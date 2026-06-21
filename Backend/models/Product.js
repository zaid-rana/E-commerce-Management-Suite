import mongoose from "mongoose";

// --- SUB-SCHEMAS FOR DYNAMIC VARIANTS ---

/**
 * Defines a single option *type* and its *values*.
 * e.g., { name: "Size", values: ["S", "M", "L"] }
 * e.g., { name: "Color", values: ["Red", "Blue"] }
 */
const optionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  values: [
    {
      type: String,
      required: true,
    },
  ],
}, { _id: true }); // _id: true (default) gives each option a unique ID

const specificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false }); // _id: false prevents


const generatedVariantSchema = new mongoose.Schema({
  /**
   * An array of {name, value} pairs.
   * e.g., [{ name: "Size", value: "S" }, { name: "Color", value: "Red" }]
   */
  combination: [
    {
      _id: false, 
      name: { type: String, required: true }, // e.g., "Size"
      value: { type: String, required: true }, // e.g., "S"
    },
  ],

  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  
  SKU: {
    type: String,
    required: false, // Make this true if every variant MUST have a unique SKU
  },
}, { _id: true }); // _id: true (default) gives each *variant* a unique ID


const productSchema = new mongoose.Schema(
  {
    productInformation: {
      Name: { type: String, required: true, unique: true },
      SKU: { type: Number, required: true, unique: true },
      Weight: { type: Number, required: true },
      Unit: { type: String, required: true },
      Description: { type: String, required: false },
    },

    pricing: {
      Price: { type: Number, required: true },
      Currency: { type: String, required: true },
      Availability: { type: Boolean, required: true },
    },

    organization: {
      Vendor: { type: String, required: true },
      Category: { type: String, required: true },
      Collection: { type: String, required: false },
      Tags: [{ type: String }],
    },

    specifications: [specificationSchema],

    options: [optionSchema],

    generatedVariants: [generatedVariantSchema],

    /**
     * These are the "main" images for the product.
     * You could also add an 'Images' array inside
     * 'generatedVariantSchema' if each variant has unique photos.
     */
    Images: [{ type: String, required: true }],
  },
  { timestamps: true }
);

export default mongoose.model("Products", productSchema);