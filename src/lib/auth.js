import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validSession } from "./session";

export async function requireAdmin() {
  const jar = await cookies();
  if (!validSession(jar.get("storefront_session")?.value)) redirect("/login");
}
