import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

type PushRuntime = {
  enabled: boolean;
  token: string | null;
  reason?: string;
};

let initialized = false;
let reminderNotificationId: string | null = null;
let pushRuntime: PushRuntime = { enabled: false, token: null, reason: "not_initialized" };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function getPushRuntime(): PushRuntime {
  return { ...pushRuntime };
}

export async function ensurePushReady(): Promise<PushRuntime> {
  if (initialized) return getPushRuntime();

  initialized = true;

  if (!Device.isDevice) {
    pushRuntime = { enabled: false, token: null, reason: "physical_device_required" };
    return getPushRuntime();
  }

  try {
    const perms = await Notifications.getPermissionsAsync();
    let finalStatus = perms.status;
    if (finalStatus !== "granted") {
      const request = await Notifications.requestPermissionsAsync();
      finalStatus = request.status;
    }
    if (finalStatus !== "granted") {
      pushRuntime = { enabled: false, token: null, reason: "permission_denied" };
      return getPushRuntime();
    }

    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200, 120, 200],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    // Token acquisition is optional for now; local notifications still work without backend.
    const tokenResult = await Notifications.getExpoPushTokenAsync();
    pushRuntime = { enabled: true, token: tokenResult.data ?? null };
    return getPushRuntime();
  } catch (error) {
    pushRuntime = {
      enabled: false,
      token: null,
      reason: String((error as Error)?.message || error),
    };
    return getPushRuntime();
  }
}

export async function startReminderPush(intervalSeconds = 20 * 60): Promise<{ ok: boolean; id?: string; reason?: string }> {
  const runtime = await ensurePushReady();
  if (!runtime.enabled) {
    return { ok: false, reason: runtime.reason || "push_unavailable" };
  }

  try {
    if (reminderNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(reminderNotificationId);
      reminderNotificationId = null;
    }

    const seconds = Math.max(60, Math.round(intervalSeconds));
    reminderNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "20-20-20 Reminder",
        body: "Look at something 6m away for 20 seconds.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: true,
      },
    });

    return { ok: true, id: reminderNotificationId };
  } catch (error) {
    return { ok: false, reason: String((error as Error)?.message || error) };
  }
}

export async function stopReminderPush(): Promise<{ ok: boolean; reason?: string }> {
  try {
    if (reminderNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(reminderNotificationId);
      reminderNotificationId = null;
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: String((error as Error)?.message || error) };
  }
}
