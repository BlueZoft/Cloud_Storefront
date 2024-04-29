"use server"

import { product, admin } from "./models";
import { connectToDb } from "./utils";
import { v4 as uuidv4 } from 'uuid';

export const getProducts = async () => {
  connectToDb()
  try {
    const Products = await product.find();
    return Products;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch products!");
  }
};

export const addProduct = async (formData) => {
  connectToDb()
  const { title, desc, price, img } = Object.fromEntries(formData);
  try {
    const newProduct = product({
      id: uuidv4(),title,desc,price,img,});
    await newProduct.save();
    console.log("saved to db");
  } catch (err) {
    console.log(err);
    return { error: "Product Not Saved!" };
  }
};

export const deleteProduct = async (id) => {
  connectToDb()
  try {
    await product.findByIdAndDelete(id);
    console.log("deleted from db");
  } catch (err) {
    console.log(err);
    return { error: "Product Not Deleted!" };
  }
};

export const getAdmin = async () => {
  connectToDb()
  try {
    const Admin = await admin.findOne();
    return Admin;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch Admin!");
  }
};