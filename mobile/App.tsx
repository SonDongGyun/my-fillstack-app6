import { useMemo, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import type { WebViewMessageEvent } from "react-native-webview";
import { NativeGazeBridge } from "./src/NativeGazeBridge";
import { NativeCameraGaze } from "./src/NativeCameraGaze";
import { useNativeGazeBridge } from "./src/hooks/useNativeGazeBridge";
import { useNativePushBridge } from "./src/hooks/useNativePushBridge";
import { DEFAULT_WEB_URI, INJECT_NATIVE_SOURCE_SCRIPT } from "./src/nativeWebBridge";

const WEB_URI = process.env.EXPO_PUBLIC_WEB_URI || DEFAULT_WEB_URI;

export default function App() {
  const webRef = useRef<WebView>(null);
  const bridge = useMemo(() => new NativeGazeBridge(), []);
  const [cameraStatus, setCameraStatus] = useState("native init");

  const { pushStatus, handleWebRawMessage } = useNativePushBridge();
  const { pushNativeSample } = useNativeGazeBridge({
    bridge,
    webRef,
    setCameraStatus,
  });

  const onWebMessage = async (event: WebViewMessageEvent) => {
    const raw = event.nativeEvent.data || "";
    await handleWebRawMessage(raw);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>my-fullstack-app5 hybrid</Text>
        <Text style={styles.sub}>{cameraStatus}</Text>
        <Text style={styles.sub}>{pushStatus}</Text>
      </View>

      <NativeCameraGaze active onStatus={setCameraStatus} onSample={pushNativeSample} />

      <WebView
        ref={webRef}
        source={{ uri: WEB_URI }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={onWebMessage}
        injectedJavaScript={INJECT_NATIVE_SOURCE_SCRIPT}
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
