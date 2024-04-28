"use client"
import { getAdmin } from "@/lib/action"
import styles from './page.module.css'

const LogIn = () => {
  connectToDb();
  
  const handleAdmin = async (event) => {
    event.preventDefault();
    
    const enteredUsername = event.target.username.value;
    const enteredPassword = event.target.password.value;
    
    const admin = await getAdmin();
  
    if (enteredUsername === admin.username && enteredPassword === admin.password) {
      router.push('./addproduct');
    } else {
      router.push('/')
    }
  };
  
  return (
    <form className={styles.container} onSubmit={handleAdmin}>
      <h1>Log-In</h1>
      <input type="text" name="username" placeholder="Username" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Log-In</button>
    </form>
  );
};

export default LogIn;
