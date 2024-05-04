import { addProduct } from "@/lib/action"
import styles from "./addProduct.module.css"

const AddProductPage = () => {
  return (
    <div className={styles.container}>
      <form action={addProduct} className={styles.form}>
        <input type="text" placeholder="title" name="title" minLength="3" maxLength="50" required />
        <input type="text" placeholder="price" name="price" pattern="^\d+(\.\d{1,2})?$" required />
        <input type="text" placeholder="image" name="img" pattern="https://images.pexels.com/.*" required />
        <textarea
          required
          name="desc"
          id="desc"
          rows="10"
          maxLength="500"
          placeholder="Description"
        ></textarea>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddProductPage;
