import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { activeSession } from "./auth-state";

export async function requireAdmin() {
  const jar = await cookies();
  if (!await activeSession(jar.get("storefront_session")?.value)) redirect("/login");
}
