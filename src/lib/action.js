"use server"
import { product } from "./models";
import { getAdmin } from "./data";
import { connectToDb } from "./utils";
import {redirect} from "next/navigation"
import { revalidatePath } from "next/cache";


export const addProduct = async (formData) => {
  const { title, desc, price, img } = Object.fromEntries(formData);
  try {
    connectToDb()
    const newProduct = new product({title,desc,price,img,});
    await newProduct.save();
    console.log("saved to db");
  } catch (err) {
    console.log(err);
    return { error: "Product Not Saved!" };
  }
  revalidatePath("/products")
  redirect("/products")
};

export const updateProduct = async(formData) => {
  const { id, title, desc, price, img } = Object.fromEntries(formData)
  try {
    connectToDb()
    const updateFields = {id,title,desc,price,img,}
    Object.keys(updateFields).forEach(
      (key) => (updateFields[key] === "" || undefined) && delete updateFields[key]
    )
    await product.findByIdAndUpdate(id, updateFields)
    console.log("saved to db");
  } catch (err) {
    console.log(err);
    return { error: "Product Not Saved!" };
  }
  revalidatePath("/products")
  redirect("/products")
}

export const deleteProduct = async (formData) => {
  const {id} = Object.fromEntries(formData)
  try {
    connectToDb()
    await product.findByIdAndDelete(id);
    console.log("deleted from db");
  } catch (err) {
    console.log(err);
    return { error: "Product Not Deleted!" };
  }
  revalidatePath("/products")
};

export const handleAdmin = async (prevState, formData) => {
  const { username } = Object.fromEntries(formData)
  const { password } = Object.fromEntries(formData);
  
  const admin = await getAdmin();
  if (username == admin.username && password == admin.password) {
    redirect("/products");
  } else {
    redirect("/");
  }
};