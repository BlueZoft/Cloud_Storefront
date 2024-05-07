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
<input type="text" name="title" defaultValue={product.title} minLength="3" maxLength="50" pattern="[a-zA-Z0-9 ]+" required />
<label>Price</label>
<input type="text" name="price" defaultValue={product.price} pattern="^\d+(\.\d{1,2})?$" required />
<label>Image URL</label>
<input type="text" placeholder="image" name="img"  defaultValue={product.img} pattern="https://images.pexels.com/.*" required />
<label>Description</label>
<textarea name="desc" id="desc" rows="10" maxLength="500" defaultValue={product.desc} pattern="[a-zA-Z0-9 ]+"></textarea>
          <button>Update</button>
        </form>
      </div>
    </div>
  );
};

export default SingleProductPage;
