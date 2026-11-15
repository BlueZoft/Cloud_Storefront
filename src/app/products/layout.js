import { requireAdmin } from "@/lib/auth";
import { logout, logoutAll } from "@/lib/action";
export default async function AdminLayout({ children }) {
  await requireAdmin();
  return <><form action={logout}><button type="submit">Log out</button></form><form action={logoutAll}><button type="submit">Sign out all devices</button></form>{children}</>;
}
