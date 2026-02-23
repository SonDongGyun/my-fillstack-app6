import { useCallback, useEffect, useState } from "react";
import {
  ensurePushReady,
  getPushRuntime,
  startReminderPush,
  stopReminderPush,
} from "../nativePush";
import {
  DEFAULT_PUSH_INTERVAL_SECONDS,
  WEB_STATUS_PREVIEW_LENGTH,
  parseNativeWebCommand,
} from "../nativeWebBridge";

export function useNativePushBridge() {
  const [pushStatus, setPushStatus] = useState("push init");

  useEffect(() => {
    let mounted = true;
    ensurePushReady().then((runtime) => {
      if (!mounted) return;
      if (runtime.enabled) {
        const tokenText = runtime.token ? `${runtime.token.slice(0, 16)}...` : "token unavailable";
        setPushStatus(`native push ready (${tokenText})`);
        return;
      }
      setPushStatus(`native push unavailable (${runtime.reason || "unknown"})`);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const syncPushStatus = useCallback(() => {
    const runtime = getPushRuntime();
    if (runtime.enabled) {
      setPushStatus("native push mode");
      return;
    }
    setPushStatus(`native push unavailable (${runtime.reason || "unknown"})`);
  }, []);

  const handlePushStart = useCallback(async (intervalSeconds?: number) => {
    const seconds = intervalSeconds ?? DEFAULT_PUSH_INTERVAL_SECONDS;
    const started = await startReminderPush(seconds);
    if (started.ok) {
      setPushStatus(`native push running (${seconds}s)`);
      return;
    }
    setPushStatus(`native push start failed (${started.reason || "unknown"})`);
  }, []);

  const handlePushStop = useCallback(async () => {
    const stopped = await stopReminderPush();
    if (stopped.ok) {
      setPushStatus("native push stopped");
      return;
    }
    setPushStatus(`native push stop failed (${stopped.reason || "unknown"})`);
  }, []);

  const handleWebRawMessage = useCallback(
    async (raw: string) => {
      if (!raw) return;

      const command = parseNativeWebCommand(raw);
      if (!command) {
        setPushStatus(`web msg: ${raw.slice(0, WEB_STATUS_PREVIEW_LENGTH)}`);
        return;
      }

      switch (command.type) {
        case "NATIVE_PUSH_SYNC":
          syncPushStatus();
          return;
        case "NATIVE_PUSH_START":
          await handlePushStart(command.payload?.intervalSeconds);
          return;
        case "NATIVE_PUSH_STOP":
          await handlePushStop();
          return;
      }
    },
    [handlePushStart, handlePushStop, syncPushStatus]
  );

  return {
    pushStatus,
    handleWebRawMessage,
  };
}
