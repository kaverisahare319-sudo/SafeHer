// Short-lived, in-memory location for an ACTIVE emergency only.
// Never written to the database, auto-forgotten after TTL, cleared when she marks herself safe.
const TTL_MS = Number(process.env.LIVE_SHARE_TTL_MIN || 120) * 60 * 1000;
const store = new Map();

function set(userId, { lat, lng }) {
  store.set(String(userId), { lat, lng, expires: Date.now() + TTL_MS });
}
function get(userId) {
  const v = store.get(String(userId));
  if (!v) return null;
  if (v.expires < Date.now()) { store.delete(String(userId)); return null; }
  return v;
}
function clear(userId) { store.delete(String(userId)); }
function isActive(userId) { return !!get(userId); }

setInterval(() => { const n = Date.now(); for (const [k, v] of store) if (v.expires < n) store.delete(k); }, 60 * 1000).unref();

module.exports = { set, get, clear, isActive };
