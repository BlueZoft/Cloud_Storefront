import styles from './page.module.css';
import ProductCard from '@/components/productCard/productCard.js';
import { getProducts } from "@/lib/action";


const Home = async () => {
  const products = await getProducts()

  return (
  <div className={styles.container}>
    {products.map((product) => (
    <div className={styles.product} key={product.id}><ProductCard product={product}/></div>
    ))}
  </div>)
}

export default Home