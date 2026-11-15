import { pageNumber } from "@/lib/pagination";
import Pagination from "@/components/Pagination";
export const dynamic = "force-dynamic";
import styles from './page.module.css';
import ProductCard from '@/components/productCard/productCard.js';
import { getProducts } from "@/lib/data";


const Home = async ({ searchParams }) => {
  const page = pageNumber((await searchParams).page);
  const { products, hasNext } = await getProducts(page)

  return (
  <div className={styles.container}>
    {products.length === 0 && <p>No products yet. Please check back soon.</p>}
    {products.map((product) => (
    <div className={styles.product} key={product.id}><ProductCard product={product}/></div>
    ))}
  <Pagination page={page} hasNext={hasNext} path="/" />
    </div>)
}

export default Home
