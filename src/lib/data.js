import { PAGE_SIZE } from "./pagination";
import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { product } from "./models";
import { connectToDb } from "./utils";

export async function getProducts(page = 1) {
  await connectToDb();
  const rows = await product.find().sort({ _id: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE + 1).maxTimeMS(5000);
  return { products: rows.slice(0, PAGE_SIZE), hasNext: rows.length > PAGE_SIZE };
}
export async function fetchProduct(id) {
  if (!mongoose.isValidObjectId(id)) notFound();
  await connectToDb();
  const item = await product.findById(id).maxTimeMS(5000);
  if (!item) notFound();
  return item;
}
