import { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import type { WebViewMessageEvent } from "react-native-webview";
import { NativeGazeBridge, type NativeBridgeMessage } from "./src/NativeGazeBridge";
import { NativeCameraGaze } from "./src/NativeCameraGaze";

// WebView target URL (set EXPO_PUBLIC_WEB_URI to override)
const WEB_URI =
  process.env.EXPO_PUBLIC_WEB_URI ||
  "http://127.0.0.1:5505/index.html";
export default function App() {
  const webRef = useRef<WebView>(null);
  const bridge = useMemo(() => new NativeGazeBridge(), []);
  const [status, setStatus] = useState("native init");
  const sampleAtRef = useRef(0);

  useEffect(() => {
    const off = bridge.onFrame((frame) => {
      const msg: NativeBridgeMessage = { type: "NATIVE_GAZE_FRAME", payload: frame };
      webRef.current?.postMessage(JSON.stringify(msg));
      setStatus(`streaming x:${frame.gazeX.toFixed(2)} y:${frame.gazeY.toFixed(2)}`);
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

  const onWebMessage = (event: WebViewMessageEvent) => {
    const raw = event.nativeEvent.data || "";
    if (!raw) return;
    setStatus(`web msg: ${raw.slice(0, 42)}`);
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
        <Text style={styles.sub}>{status}</Text>
      </View>
      <NativeCameraGaze
        active
        onStatus={setStatus}
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
    backgroundColor: "#ffffff"
  },
  title: { fontSize: 15, fontWeight: "700", color: "#214e92" },
  sub: { marginTop: 3, fontSize: 12, color: "#4e6e99" }
});

