import { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import type { WebViewMessageEvent } from "react-native-webview";
import { NativeGazeBridge, type NativeBridgeMessage } from "./src/NativeGazeBridge";
import { NativeCameraGaze } from "./src/NativeCameraGaze";
import { ensurePushReady, getPushRuntime, startReminderPush, stopReminderPush } from "./src/nativePush";

const WEB_URI = process.env.EXPO_PUBLIC_WEB_URI || "http://127.0.0.1:5505/index.html";

type NativeWebCommand =
  | { type: "NATIVE_PUSH_START"; payload?: { intervalSeconds?: number } }
  | { type: "NATIVE_PUSH_STOP" }
  | { type: "NATIVE_PUSH_SYNC" };

function parseNativeWebCommand(raw: string): NativeWebCommand | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.type === "NATIVE_PUSH_START") return parsed;
    if (parsed.type === "NATIVE_PUSH_STOP") return parsed;
    if (parsed.type === "NATIVE_PUSH_SYNC") return parsed;
    return null;
  } catch {
    return null;
  }
}

export default function App() {
  const webRef = useRef<WebView>(null);
  const bridge = useMemo(() => new NativeGazeBridge(), []);

  const [cameraStatus, setCameraStatus] = useState("native init");
  const [pushStatus, setPushStatus] = useState("push init");
  const sampleAtRef = useRef(0);

  useEffect(() => {
    const off = bridge.onFrame((frame) => {
      const msg: NativeBridgeMessage = { type: "NATIVE_GAZE_FRAME", payload: frame };
      webRef.current?.postMessage(JSON.stringify(msg));
      setCameraStatus(`streaming x:${frame.gazeX.toFixed(2)} y:${frame.gazeY.toFixed(2)} c:${frame.confidence.toFixed(2)}`);
      sampleAtRef.current = Date.now();
    });

    const fallbackTimer = setInterval(() => {
      if (Date.now() - sampleAtRef.current > 3500) {
        bridge.startMockStream();
      }
    }, 1200);

    return () => {
      off();
      clearInterval(fallbackTimer);
      bridge.stopMockStream();
    };
  }, [bridge]);

  useEffect(() => {
    let mounted = true;
    ensurePushReady().then((runtime) => {
      if (!mounted) return;
      if (runtime.enabled) {
        const tokenText = runtime.token ? `${runtime.token.slice(0, 16)}...` : "token unavailable";
        setPushStatus(`native push ready (${tokenText})`);
      } else {
        setPushStatus(`native push unavailable (${runtime.reason || "unknown"})`);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const onWebMessage = async (event: WebViewMessageEvent) => {
    const raw = event.nativeEvent.data || "";
    if (!raw) return;

    const command = parseNativeWebCommand(raw);
    if (!command) {
      setPushStatus(`web msg: ${raw.slice(0, 40)}`);
      return;
    }

    if (command.type === "NATIVE_PUSH_SYNC") {
      const runtime = getPushRuntime();
      if (runtime.enabled) {
        setPushStatus("native push mode");
      } else {
        setPushStatus(`native push unavailable (${runtime.reason || "unknown"})`);
      }
      return;
    }

    if (command.type === "NATIVE_PUSH_START") {
      const intervalSeconds = command.payload?.intervalSeconds ?? 20 * 60;
      const started = await startReminderPush(intervalSeconds);
      if (started.ok) {
        setPushStatus(`native push running (${intervalSeconds}s)`);
      } else {
        setPushStatus(`native push start failed (${started.reason || "unknown"})`);
      }
      return;
    }

    if (command.type === "NATIVE_PUSH_STOP") {
      const stopped = await stopReminderPush();
      if (stopped.ok) {
        setPushStatus("native push stopped");
      } else {
        setPushStatus(`native push stop failed (${stopped.reason || "unknown"})`);
      }
    }
  };

  const injectReady = `
    (function(){
      window.__NATIVE_SOURCE__ = 'react-native-webview';
      true;
    })();
  `;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>my-fullstack-app5 hybrid</Text>
        <Text style={styles.sub}>{cameraStatus}</Text>
        <Text style={styles.sub}>{pushStatus}</Text>
      </View>

      <NativeCameraGaze
        active
        onStatus={setCameraStatus}
        onSample={(sample) => {
          bridge.stopMockStream();
          bridge.pushSample(sample);
        }}
      />

      <WebView
        ref={webRef}
        source={{ uri: WEB_URI }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={onWebMessage}
        injectedJavaScript={injectReady}
        originWhitelist={["*"]}
      />

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f4f8ff" },
  header: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#cad8f4",
    backgroundColor: "#ffffff",
  },
  title: { fontSize: 15, fontWeight: "700", color: "#214e92" },
  sub: { marginTop: 3, fontSize: 12, color: "#4e6e99" },
});
