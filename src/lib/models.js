import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, minlength: 3, maxlength: 50,
    },
    desc: {
      type: String,
      required: true, maxlength: 500,
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
