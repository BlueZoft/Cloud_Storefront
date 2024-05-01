import { updateProduct } from "@/lib/action"
import { fetchProduct } from "@/lib/data"
import styles from "./singleProduct.module.css"
import Image from "next/image";

const SingleProductPage = async ({ params }) => {
  const { id } = params
  const product = await fetchProduct(id);

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
          <Image src= {product.img} alt="" fill />
        </div>
        {product.title}
      </div>
      <div className={styles.formContainer}>
        <form action={updateProduct} className={styles.form}>
          <input type="hidden" name="id" value={product.id} />
          <label>Name</label>
          <input type="text" name="title" defaultValue={product.title} minLength="3" maxLength="50" required />
          <label>Price</label>
          <input type="text" name="price" defaultValue={product.price} pattern="^\d+(\.\d{1,2})?$" required />
          <label>Image URL</label>
          <input type="url" name="img" defaultValue={product.img} pattern="https://.*" required />
          <label>Description</label>
          <textarea
            name="desc"s
            id="desc"
            rows="10"
            maxLength="500"
            defaultValue={product.desc}
          ></textarea>
          <button>Update</button>
        </form>
      </div>
    </div>
  );
};

export default SingleProductPage;
