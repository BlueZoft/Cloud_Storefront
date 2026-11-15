import { requireAdmin } from "@/lib/auth";
import { logout } from "@/lib/action";
export default async function AdminLayout({ children }) {
  await requireAdmin();
  return <><form action={logout}><button type="submit">Log out</button></form>{children}</>;
}
