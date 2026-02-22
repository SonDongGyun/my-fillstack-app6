(function(){
  const logic = window.GameLogic || {};
  const timerManager = (window.TimerManager && typeof window.TimerManager.createTimerManager === "function")
    ? window.TimerManager.createTimerManager()
    : null;

  const state = {
    countdownTimer: null,
    nextPushTs: 0,
    ui: { active: false, status: "idle" },
    stopping: false,
    homeAutoStartedOnce: false,
    pushCapable: false,
  };

  function setUi(event){
    if (typeof logic.reducePushUiState === "function") {
      state.ui = logic.reducePushUiState(state.ui, event);
      return;
    }
    if (event === "running") state.ui = { active: true, status: "push running" };
    if (event === "stopped") state.ui = { active: false, status: "stopped" };
  }

  function toUint8Array(base64Url){
    const pad = "=".repeat((4 - (base64Url.length % 4)) % 4);
    const base64 = (base64Url + pad).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  function renderStatus(){
    const meta = document.getElementById("ruleMeta");
    if (!meta) return;
    meta.textContent = state.ui.status;
  }

  function updateRuleButtons(){
    const startBtn = document.getElementById("ruleStartBtn");
    const stopBtn = document.getElementById("ruleStopBtn");
    if (!startBtn || !stopBtn) return;
    startBtn.classList.toggle("hidden", state.ui.active);
    stopBtn.classList.toggle("hidden", !state.ui.active);
  }

  function clearCountdown(){
    if (timerManager) {
      timerManager.clearInterval("push-countdown");
      state.countdownTimer = null;
      return;
    }
    if (state.countdownTimer) {
      clearInterval(state.countdownTimer);
      state.countdownTimer = null;
    }
  }

  function startCountdown(seconds, nextFireAtEpochMs){
    clearCountdown();
    const sec = Math.max(1, seconds | 0);
    state.nextPushTs = (typeof nextFireAtEpochMs === "number" && nextFireAtEpochMs > 0)
      ? nextFireAtEpochMs
      : (Date.now() + sec * 1000);

    const tick = () => {
      const remain = Math.max(0, Math.ceil((state.nextPushTs - Date.now()) / 1000));
      const base = state.ui.status || "push running";
      state.ui.status = `${base.split(" | ")[0]} | next in ${remain}s`;
      renderStatus();
      if (remain <= 0) state.nextPushTs += sec * 1000;
    };

    tick();
    state.countdownTimer = timerManager
      ? timerManager.setInterval("push-countdown", tick, 250)
      : setInterval(tick, 250);
  }

  async function ensurePushSubscription(){
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      throw new Error("Push API not supported in this browser.");
    }

    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    const keyRes = await fetch("/api/push/public-key", { cache: "no-store" });
    const keyData = await keyRes.json();
    if (!keyData || !keyData.ok || !keyData.public_key) {
      throw new Error("Push is not configured yet.");
    }

    let perm = Notification.permission;
    if (perm !== "granted") perm = await Notification.requestPermission();
    if (perm !== "granted") throw new Error(`Notification permission: ${perm}`);

    let sub = await reg.pushManager.getSubscription();
    if (sub) {
      try { await sub.unsubscribe(); } catch (_) {}
    }

    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: toUint8Array(keyData.public_key),
    });

    const payload = (sub && typeof sub.toJSON === "function") ? sub.toJSON() : sub;
    const saveRes = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: payload }),
    });
    const saveData = await saveRes.json();
    if (!saveData || !saveData.ok) throw new Error("Failed to save push subscription.");
  }

  window.stopRuleReminder = async function(options){
    if (state.stopping) return;
    state.stopping = true;
    const silent = !!(options && options.silent);
    try {
      clearCountdown();
      try {
        await fetch("/api/push/stop", { method: "POST", headers: { "Content-Type": "application/json" } });
      } catch (_) {}
      setUi("stopped");
      updateRuleButtons();
      if (!silent) renderStatus();
    } finally {
      state.stopping = false;
    }
  };

  window.startRuleReminder = async function(intervalMs){
    if (state.ui.active) return;
    try {
      setUi("start_pending");
      renderStatus();
      await ensurePushSubscription();
      const sec = Math.max(1, Math.round(intervalMs / 1000));
      const res = await fetch("/api/push/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval_seconds: sec }),
      });
      const data = await res.json();
      if (!data || !data.ok) throw new Error("Failed to start push schedule.");

      if (data.immediate && data.immediate.failed > 0 && !(data.immediate.sent > 0)) {
        const firstErr = (data.immediate.errors && data.immediate.errors[0]) ? data.immediate.errors[0] : null;
        const detail = firstErr
          ? `${firstErr.type}${firstErr.status_code ? `/${firstErr.status_code}` : ""}${firstErr.message ? `: ${firstErr.message}` : ""}`
          : "unknown";
        setUi(`start_fail:${detail}`);
        state.ui.active = true;
      } else if (data.immediate && data.immediate.sent > 0 && data.immediate.failed > 0) {
        setUi("start_partial");
      } else {
        setUi("start_ok");
      }

      updateRuleButtons();
      startCountdown(sec, data.next_fire_at_epoch_ms);
    } catch (err) {
      clearCountdown();
      setUi(`start_fail:${String(err && err.message ? err.message : err)}`);
      updateRuleButtons();
      renderStatus();
      console.error(err);
    }
  };

  window.syncRulePushUi = async function(){
    try {
      const res = await fetch("/api/push/public-key", { cache: "no-store" });
      const data = await res.json();
      state.pushCapable = !!(data && data.ok && data.public_key);
      if (!state.pushCapable) {
        state.ui = { active: false, status: "push not configured" };
        updateRuleButtons();
        renderStatus();
        return;
      }

      if (data.running) {
        setUi("running");
        updateRuleButtons();
        renderStatus();
        startCountdown(data.interval_seconds || 1200, data.next_fire_at_epoch_ms);
      } else {
        setUi("stopped");
        updateRuleButtons();
        renderStatus();
      }
    } catch (_) {
      updateRuleButtons();
    }
  };

  function bindRuleControls(){
    const startBtn = document.getElementById("ruleStartBtn");
    const stopBtn = document.getElementById("ruleStopBtn");
    if (startBtn) {
      startBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        await window.startRuleReminder(20 * 60 * 1000);
      }, true);
    }
    if (stopBtn) {
      stopBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        await window.stopRuleReminder();
      }, true);
    }
  }

  async function startHomeAutoOnce(){
    if (state.homeAutoStartedOnce) return;
    state.homeAutoStartedOnce = true;
    await window.syncRulePushUi();
    if (!state.pushCapable) return;
    setTimeout(() => window.startRuleReminder(20 * 60 * 1000), 0);
  }

  bindRuleControls();
  updateRuleButtons();
  renderStatus();
  window.addEventListener("load", startHomeAutoOnce, { once: true });
  if (document.readyState === "complete") startHomeAutoOnce();
  window.addEventListener("beforeunload", () => {
    try {
      navigator.sendBeacon("/api/push/stop", new Blob([JSON.stringify({})], { type: "application/json" }));
    } catch (_) {}
  });
})();
