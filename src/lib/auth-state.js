import { createHash } from "node:crypto";
import { connectToDb } from "./utils";
import { createSession, validSession } from "./session";

let indexPromise;
async function collections() {
  const connection = await connectToDb();
  const db = connection.connection.db;
  const sessions = db.collection("auth_sessions");
  const limits = db.collection("login_limits");
  if (!indexPromise) {
    indexPromise = Promise.all([
      sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      limits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    ]).catch((error) => { indexPromise = null; throw error; });
  }
  await indexPromise;
  return { sessions, limits };
}
function digest(token) { return createHash("sha256").update(token).digest("hex"); }
function credentials() {
  return digest(`${process.env.ADMIN_USERNAME || ""}\0${process.env.ADMIN_PASSWORD_HASH || ""}`);
}
export async function consumeLoginAttempt() {
  const { limits } = await collections();
  // This app has one administrator: a shared bucket avoids trusting forwarded IP headers.
  const window = Math.floor(Date.now() / 60000);
  const query = { _id: `admin:${window}` };
  const update = { $inc: { attempts: 1 }, $setOnInsert: { expiresAt: new Date((window + 2) * 60000) } };
  let row;
  try {
    row = await limits.findOneAndUpdate(query, update, { upsert: true, returnDocument: "after" });
  } catch (error) {
    if (error.code !== 11000) throw error;
    row = await limits.findOneAndUpdate(query, update, { returnDocument: "after" });
  }
  return row !== null && row.attempts <= 10;
}
export async function issueSession() {
  const { sessions } = await collections();
  const token = createSession();
  await sessions.insertOne({ _id: digest(token), credentials: credentials(), expiresAt: new Date(Date.now() + 3600000) });
  return token;
}
export async function activeSession(token) {
  if (!validSession(token)) return false;
  const { sessions } = await collections();
  return Boolean(await sessions.findOne({ _id: digest(token), credentials: credentials(), expiresAt: { $gt: new Date() } }));
}
export async function revokeSession(token) {
  if (typeof token !== "string" || token.length > 512) return;
  const { sessions } = await collections();
  await sessions.deleteOne({ _id: digest(token) });
}
export async function revokeAllSessions() {
  const { sessions } = await collections();
  await sessions.deleteMany({});
}
