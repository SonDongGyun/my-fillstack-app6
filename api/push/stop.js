module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ ok: true });
};
