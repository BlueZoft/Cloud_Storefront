import styles from "./productCard.module.css"
import Image from "next/image"

const productCard = () => {
    return <div className={styles.container}>
        <div className={styles.top}>
            <div className={styles.imgContainer}>
                <Image src="../product.jpg" alt="bakery product image" fill className={styles.img}/>
            </div>
        </div>
        <div className={styles.bottom}></div>
        <h1 className={styles.title}>Title</h1>
        <p className={styles.desc}>Desc</p>
        <h2>Price</h2>
    </div>;
  };
  
  export default productCard;