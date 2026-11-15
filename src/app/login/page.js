import { handleAdmin } from "@/lib/action";
import ActionForm from "@/components/ActionForm";
import styles from "./page.module.css";
export default function LoginPage() {
  return <ActionForm action={handleAdmin} submitLabel="Sign in" className={styles.container}>
    <label>Username<input name="username" autoComplete="username" required maxLength={100} /></label>
    <label>Password<input type="password" name="password" autoComplete="current-password" required maxLength={256} /></label>
  </ActionForm>;
}
