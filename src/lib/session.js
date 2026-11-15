import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32 || value.startsWith("replace-")) throw new Error("Configure SESSION_SECRET (at least 32 random characters)");
  return value;
}
export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password, hash) {
  if (typeof password !== "string" || password.length > 256) return false;
  if (!/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(hash || "")) return false;
  const [salt, expected] = hash.split(":");
  return timingSafeEqual(Buffer.from(expected, "hex"), scryptSync(password, salt, 64));
}
export function createSession() {
  const payload = Buffer.from(JSON.stringify({ role: "admin", exp: Date.now() + 3600000 })).toString("base64url");
  return `${payload}.${createHmac("sha256", secret()).update(payload).digest("hex")}`;
}
export function validSession(token) {
  if (typeof token !== "string" || token.length > 512) return false;
  const [payload, signature, extra] = token.split(".");
  if (extra || !/^[a-f0-9]{64}$/.test(signature || "")) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, "hex"))) return false;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString());
    return value.role === "admin" && Number.isFinite(value.exp) && value.exp > Date.now();
  } catch { return false; }
}
