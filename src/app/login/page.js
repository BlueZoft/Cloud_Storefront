"use client"
import { handleAdmin } from "@/lib/action"
import styles from './page.module.css'
import { useFormState } from "react-dom"


const LoginForm = () => {
  const [state, formAction] = useFormState(handleAdmin, undefined);

  return (
    <form className={styles.container} action={formAction}>
      <input type="text" placeholder="username" name="username" />
      <input type="password" placeholder="password" name="password" />
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm
