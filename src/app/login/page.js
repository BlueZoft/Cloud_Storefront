"use client"
import { getAdmin } from "@/lib/action"
import styles from './page.module.css'
import { useState } from 'react';

const LogIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleAdmin = async (event) => {
    event.preventDefault();

    try {
      const Admin = await getAdmin();
      if (Admin.username === username && Admin.password === password) {
        console.log('Admin logged in successfully');
      } else {
        console.log('Invalid username or password');
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form className={styles.container} onSubmit={handleAdmin}>
      <h1>Log-In</h1>
      <input type="text" name="username" placeholder="Username" required onChange={e => setUsername(e.target.value)} />
      <input type="password" name="password" placeholder="Password" required onChange={e => setPassword(e.target.value)} />
      <button type="submit">Log-In</button>
    </form>
  );
};

export default LogIn;
