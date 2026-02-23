import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

const DEFAULT_REMINDER_SECONDS = 20 * 60;
const MIN_REMINDER_SECONDS = 60;
const NOTIFICATION_CHANNEL_ID = "default";

const REMINDER_CONTENT = {
  title: "20-20-20 Reminder",
  body: "Look at something 6m away for 20 seconds.",
};

type PushRuntime = {
  enabled: boolean;
  token: string | null;
  reason?: string;
};

let initialized = false;
let reminderNotificationId: string | null = null;
let pushRuntime: PushRuntime = { enabled: false, token: null, reason: "not_initialized" };

function toErrorMessage(error: unknown): string {
  return String((error as Error)?.message || error);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
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

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: NOTIFICATION_CHANNEL_ID,
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
      reason: toErrorMessage(error),
    };
    return getPushRuntime();
  }
}

export async function startReminderPush(intervalSeconds = DEFAULT_REMINDER_SECONDS): Promise<{ ok: boolean; id?: string; reason?: string }> {
  const runtime = await ensurePushReady();
  if (!runtime.enabled) {
    return { ok: false, reason: runtime.reason || "push_unavailable" };
  }

  try {
    if (reminderNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(reminderNotificationId);
      reminderNotificationId = null;
    }

    const seconds = Math.max(MIN_REMINDER_SECONDS, Math.round(intervalSeconds));
    reminderNotificationId = await Notifications.scheduleNotificationAsync({
      content: REMINDER_CONTENT,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: true,
      },
    });

    return { ok: true, id: reminderNotificationId };
  } catch (error) {
    return { ok: false, reason: toErrorMessage(error) };
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
    return { ok: false, reason: toErrorMessage(error) };
  }
}
