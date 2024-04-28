"use client"
import { addProduct, deleteProduct, getProducts, updateProduct } from "@/lib/action";
import styles from "./adminpanel.module.css";
import { useState } from "react"
import Image from 'next/image';

const ProductPage = async() => {
  connectToDb();
  const [formData, editingProduct, editedProduct] = useState();
  products = await getProducts();

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const result = await addProduct(ev);
    if (result.error) {
      console.log(result.error);
    } else {
      console.log('Product saved successfully');
    }
  };

  const handleDelete = async (id) => {
    await deleteProduct(id);
    products = await getProducts();
  };

  const handleSave = (product) => {
    editedProduct(product);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedProduct = {
      id: editingProduct.id,
      title: formData.get('title'),
      img: formData.get('img'),
      desc: formData.get('desc'),
      price: formData.get('price'),
    };
    await updateProduct(updatedProduct);
    editedProduct(null);
    products = await getProducts();
  };

  return (
    <div className={styles.container}>
      <h1>Add New Product</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Title" />
        <input type="text" name="price" placeholder="Price" />
        <input type="text" name="img" placeholder="Product Image" />
        <textarea type="text" name="desc" placeholder="Product Description" rows={10} />
        <button type="submit">Add</button>
      </form>
      {editingProduct && (
        <div>
          <h1>Edit Product</h1>
          <form onSubmit={handleUpdate}>
            <input type="text" name="title" placeholder="Title" defaultValue={editingProduct.title} />
            <input type="text" name="price" placeholder="Price" defaultValue={editingProduct.price} />
            <input type="text" name="img" placeholder="img" defaultValue={editingProduct.img} />
            <textarea type="text" name="desc" placeholder="Product Description" rows={10} defaultValue={editingProduct.desc} />
            <button type="submit">Update</button>
          </form>
        </div>
      )}

      <h1>Products</h1>
      {products.map((product) => (
        <div className={styles.post} key={product.id}>
          <div className={styles.detail}>
            <Image src={product.img} alt="Something delicious from Kilmaine Kakes" width={50} height={50}/>
            <span className={styles.postTitle}>{product.title}</span>
          </div>
          <button onClick={() => handleDelete(product.id)} className={styles.postButton}>Delete</button>
          <button onClick={() => handleSave(product)} className={styles.editButton}>Edit</button>
        </div>
      ))}
    </div>
  );
};

export default ProductPage;
