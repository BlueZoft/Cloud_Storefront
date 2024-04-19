import Image from "next/image"
import styles from "./about.module.css"

const AboutPage = () => {
    return (
    <div className={styles.imgContainer}>
      <Image src="/logo.jpeg" alt="Kilmaine Kakes logo" fill/>
    </div>
    )  
}
  
  export default AboutPage;