import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    img: {
      type: String,
    },
  },
);

export const product = mongoose.models?.product || mongoose.model("product", productSchema);

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
);

export const admin = mongoose.models?.admin || mongoose.model("admin", adminSchema);