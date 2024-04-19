import Links from "./links/links"
import Link from "next/link"
import styles from "./navbar.module.css"
const Navbar = () => {
    return (
    <div className={styles.container}>
   
                  <Link href="/"className={styles.logo}>Kilmaine Kakes!</Link>
            <div>
                <Links/>
            </div>
            
      
    </div>)
  }
  
  export default Navbar