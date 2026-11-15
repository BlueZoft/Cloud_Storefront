"use server";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { product } from "./models";
import { connectToDb } from "./utils";
import { requireAdmin } from "./auth";
import { verifyPassword } from "./session";
import { consumeLoginAttempt, issueSession, revokeSession, revokeAllSessions } from "./auth-state";
import { productInput } from "./validation";

function idFrom(formData) {
  const id = String(formData.get("id") || "");
  if (!mongoose.isValidObjectId(id)) throw new Error("Invalid product ID");
  return id;
}
function refresh() { revalidatePath("/"); revalidatePath("/products"); }
export async function addProduct(previous, formData) {
  await requireAdmin();
  let values;
  try { values = productInput(formData); } catch (error) { return { error: error.message }; }
  try { await connectToDb(); await product.create(values); }
  catch { return { error: "Unable to save product. Please retry." }; }
  refresh(); redirect("/products");
}
export async function updateProduct(previous, formData) {
  await requireAdmin();
  let values, id;
  try { values = productInput(formData); id = idFrom(formData); } catch (error) { return { error: error.message }; }
  try {
    await connectToDb();
    if (!await product.findByIdAndUpdate(id, values, { runValidators: true })) return { error: "Product no longer exists." };
  } catch { return { error: "Unable to save product. Please retry." }; }
  refresh(); redirect("/products");
}
export async function deleteProduct(previous, formData) {
  await requireAdmin();
  try {
    const id = idFrom(formData);
    await connectToDb();
    if (!await product.findByIdAndDelete(id)) return { error: "Product no longer exists." };
  } catch { return { error: "Unable to delete product. Please retry." }; }
  refresh(); return { success: "Product deleted." };
}
export async function handleAdmin(previous, formData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  if (!await consumeLoginAttempt()) return { error: "Too many login attempts. Please wait one minute." };
  // Verify the hash even for unknown usernames to reduce timing differences.
  const correct = await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH);
  if (!correct || !process.env.ADMIN_USERNAME || username !== process.env.ADMIN_USERNAME) return { error: "Invalid username or password." };
  const jar = await cookies();
  await revokeSession(jar.get("storefront_session")?.value);
  const token = await issueSession();
  jar.set("storefront_session", token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 3600, path: "/",
  });
  redirect("/products");
}
export async function logout() {
  const jar = await cookies();
  await revokeSession(jar.get("storefront_session")?.value);
  jar.delete("storefront_session");
  redirect("/login");
}
export async function logoutAll() {
  await requireAdmin();
  await revokeAllSessions();
  (await cookies()).delete("storefront_session");
  redirect("/login");
}
