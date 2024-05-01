import NavLink from "./navLink/navLink";
import styles from "./links.module.css"

const Links = () => {

    const links = [
        {
            title:"Homepage",
            path:"/",

        },
        {
            title:"About",
            path:"/about",

        },
        {
            title:"Login",
            path:"/login",

        }
    ];

    return (
    <div className={styles.links}>
        {links.map((link)=>(
        <NavLink item={link} key={link.title}/>

    ))} 

    </div>
    )
  }
  
  export default Links