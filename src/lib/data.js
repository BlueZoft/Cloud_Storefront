"use server"
import { product, admin } from "./models";
import { connectToDb } from "./utils";

export const getProducts = async () => {
    
    try {
      connectToDb()
      const products = await product.find();
      return products;
    } catch (err) {
      console.log(err);
      throw new Error("Failed to fetch products!");
    }
  }
  export const fetchProduct = async (id) => {
    try {
      connectToDb();
      const fetchedProduct = await product.findById(id);
      return fetchedProduct;
    } catch (err) {
      console.log(err);
      throw new Error("Failed to fetch product!");
    }
  }
  
  
export const getAdmin = async () => {
    try {
      connectToDb()
      const rawAdmin = await admin.findOne();
      const Admin = JSON.parse(JSON.stringify(rawAdmin))
      return Admin
    } catch (err) {
      console.log(err);
      throw new Error("Failed to fetch Admin!");
    }
  };
  