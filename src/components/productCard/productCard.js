import styles from "./productCard.module.css"
import Image from "next/image"

const ProductCard = ({product}) => {
    return <div className={styles.container}>
        <div className={styles.top}>
            <div className={styles.imgContainer}>
                <Image src={product.img} alt="bakery product image" fill className={styles.img}/>
            </div>
        </div>
        <div className={styles.bottom}></div>
        <h1 className={styles.title}>{product.title}</h1>
        <p className={styles.desc}>{product.desc}</p>
        <h2 className={styles.title}> £ {product.price}</h2>
    </div>;
  };
  
  export default ProductCard;