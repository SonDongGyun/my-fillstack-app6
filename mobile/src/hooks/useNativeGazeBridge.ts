import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { WebView } from "react-native-webview";
import { NativeGazeBridge, type NativeBridgeMessage } from "../NativeGazeBridge";
import type { GazeSample } from "../lib/gazeMath";
import {
  MOCK_FALLBACK_POLL_MS,
  MOCK_FALLBACK_SAMPLE_GAP_MS,
} from "../nativeWebBridge";

type Params = {
  bridge: NativeGazeBridge;
  webRef: RefObject<WebView | null>;
  setCameraStatus: (status: string) => void;
};

export function useNativeGazeBridge({ bridge, webRef, setCameraStatus }: Params) {
  const sampleAtRef = useRef(0);

  useEffect(() => {
    const off = bridge.onFrame((frame) => {
      const msg: NativeBridgeMessage = { type: "NATIVE_GAZE_FRAME", payload: frame };
      webRef.current?.postMessage(JSON.stringify(msg));
      setCameraStatus(`streaming x:${frame.gazeX.toFixed(2)} y:${frame.gazeY.toFixed(2)} c:${frame.confidence.toFixed(2)}`);
      sampleAtRef.current = Date.now();
    });

    const fallbackTimer = setInterval(() => {
      if (Date.now() - sampleAtRef.current > MOCK_FALLBACK_SAMPLE_GAP_MS) {
        bridge.startMockStream();
      }
    }, MOCK_FALLBACK_POLL_MS);

    return () => {
      off();
      clearInterval(fallbackTimer);
      bridge.stopMockStream();
    };
  }, [bridge, setCameraStatus, webRef]);

  const pushNativeSample = (sample: GazeSample) => {
    bridge.stopMockStream();
    bridge.pushSample(sample);
  };

  return {
    pushNativeSample,
  };
}
