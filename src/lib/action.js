"use server";
import { admin, product } from "./models";
import { connectToDb } from "./utils";
import { v4 as uuidv4 } from 'uuid';

export const addProduct = async (prevState,formData) => {
  const { title, desc, price, img } = Object.fromEntries(formData);
  try {
    const newProduct = new product({
      id: uuidv4(),title,desc,price,img,});
    await newProduct.save();
    console.log("saved to db");
  } catch (err) {
    console.log(err);
    return { error: "Product Not Saved!" };
  }
};

export const deleteProduct = async (id) => {
  try {
    await product.findByIdAndDelete(id);
    console.log("deleted from db");
  } catch (err) {
    console.log(err);
    return { error: "Product Not Deleted!" };
  }
};

export const updatePrdoduct = async (updatedProduct) => {
  try {
    const { id, title, desc, price, img } = updatedProduct;

    const updatedProductData = await product.findByIdAndUpdate(
      id,
      {
        title,
        desc,
        price,
        img,
      },
      { new: true }
    );

    return updatedProductData;
  } catch (err) {
    console.error('Error updating product:', err);
    throw err;
  }
};
export const getProducts = async () => {
  try {
    const Products = await product.find();
    return Products;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch products!");
  }
};

export const getAdmin = async () => {
  try {
    const Admin = await admin.find();
    return Admin;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch Admin!");
  }
};


export const handleLogout = async () => {
  "use server";
  await signOut();
};


