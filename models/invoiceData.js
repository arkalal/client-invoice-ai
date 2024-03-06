import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema({
  name: String,
  quantity: Number,
  unitPrice: Number,
  totalPrice: Number,
});

const invoiceDataSchema = new Schema(
  {
    currency: { type: String, required: true },
    products: [ProductSchema],
    subtotal: Number,
    discount: Number,
    tax: Number,
    totalDue: Number,
  },
  { timestamps: true }
);

const InvoiceData =
  mongoose.models.InvoiceData ||
  mongoose.model("InvoiceData", invoiceDataSchema);

export default InvoiceData;
