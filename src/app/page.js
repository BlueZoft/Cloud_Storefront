import styles from './page.module.css';
import productCard from '@/components/productCard/productCard.js';

const Home = () => {
  return <div className={styles.container}>
    <productCard/>
    <productCard/>
    <productCard/>
    <productCard/>
  </div>
}

export default Home