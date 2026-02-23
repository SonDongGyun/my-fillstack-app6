export const DEFAULT_WEB_URI = "http://127.0.0.1:5505/index.html";
export const DEFAULT_PUSH_INTERVAL_SECONDS = 20 * 60;
export const MOCK_FALLBACK_SAMPLE_GAP_MS = 3500;
export const MOCK_FALLBACK_POLL_MS = 1200;
export const WEB_STATUS_PREVIEW_LENGTH = 40;

export const INJECT_NATIVE_SOURCE_SCRIPT = `
  (function(){
    window.__NATIVE_SOURCE__ = 'react-native-webview';
    true;
  })();
`;

type NativePushStartCommand = {
  type: "NATIVE_PUSH_START";
  payload?: { intervalSeconds?: number };
};

type NativePushStopCommand = {
  type: "NATIVE_PUSH_STOP";
};

type NativePushSyncCommand = {
  type: "NATIVE_PUSH_SYNC";
};

export type NativeWebCommand =
  | NativePushStartCommand
  | NativePushStopCommand
  | NativePushSyncCommand;

export function parseNativeWebCommand(raw: string): NativeWebCommand | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    switch (parsed.type) {
      case "NATIVE_PUSH_START":
      case "NATIVE_PUSH_STOP":
      case "NATIVE_PUSH_SYNC":
        return parsed as NativeWebCommand;
      default:
        return null;
    }
  } catch {
    return null;
  }
}
