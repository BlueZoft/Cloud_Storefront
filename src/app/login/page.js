"use client"
import { handleAdmin } from "@/lib/action"
import styles from './page.module.css'
import { useFormState } from "react-dom"


const LoginForm = () => {
  const [state, formAction] = useFormState(handleAdmin, undefined);

  return (
    <form className={styles.container} action={formAction}>
      <input type="text" placeholder="username" name="username"  minLength="3" maxLength="10" pattern="[a-zA-Z0-9]+" />
      <input type="password" placeholder="password" name="password"  minLength="3" maxLength="10" pattern="[a-zA-Z0-9]+" />
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm
