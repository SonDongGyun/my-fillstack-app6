module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ ok: true, running: false, interval_seconds: 1200, next_fire_at_epoch_ms: null });
};
