import Image from "next/image";
import Link from "next/link";
import styles from "./products.module.css"
import { getProducts } from "@/lib/data"
import { deleteProduct } from "@/lib/action"

const ProductsPage = async () => {
  const products = await getProducts();
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Link href="products/add">
          <button className={styles.addButton}>Add New</button>
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Title</td>
            <td>Description</td>
            <td>Price</td>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className={styles.product}>
                  <Image
                    src={product.img}
                    alt=""
                    width={40}
                    height={40}
                    className={styles.productImage}
                  />
                  {product.title}
                </div>
              </td>
              <td>{product.desc}</td>
              <td>£ {product.price}</td>
              <td>
                <div className={styles.buttons}>
                  <Link href={`/products/${product.id}`}>
                    <button className={`${styles.button} ${styles.view}`}>
                      Edit
                    </button>
                  </Link>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={product.id} />
                    <button className={`${styles.button} ${styles.delete}`}>
                      Delete
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsPage;
