self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = {};
  }

  const title = data.title || "다비치안경 | 눈건강 휴식 알림";
  const options = {
    body:
      data.body ||
      "눈 피로를 줄이기 위해 잠깐 쉬어주세요.\n6m 이상 먼 곳을 20초 바라보세요.\n그리고 천천히 5회 이상 깜빡여 주세요.",
    tag: data.tag || `eye-202020-${Date.now()}`,
    icon: data.icon || "/static/davich_logo.png",
    badge: data.badge || "/static/davich_logo.png",
    renotify: true,
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("/");
      return undefined;
    }),
  );
});
