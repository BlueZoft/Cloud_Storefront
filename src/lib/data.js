import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { product } from "./models";
import { connectToDb } from "./utils";

export async function getProducts() {
  await connectToDb();
  return product.find().sort({ _id: -1 });
}
export async function fetchProduct(id) {
  if (!mongoose.isValidObjectId(id)) notFound();
  await connectToDb();
  const item = await product.findById(id);
  if (!item) notFound();
  return item;
}
