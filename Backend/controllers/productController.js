import Product from "../models/Product.js";
import { sendResponse } from "../utils/response.js";
import mongoose from "mongoose";

export const createProduct = async (req, res) => {
  try {
    const productInformation = JSON.parse(req.body.productInformation);
    const pricing = JSON.parse(req.body.pricing);
    const organization = JSON.parse(req.body.organization);

    // Check for duplicate variant option names
    const options = JSON.parse(req.body.options);
    if (options && options.length > 0) {
      const optionNames = options.map(opt => opt.name.toLowerCase());
      const uniqueOptionNames = new Set(optionNames); 

      if (uniqueOptionNames.size !== optionNames.length) {
        return res.status(400).json({
          message: 'Duplicate variant option names are not allowed.'
        });
      }
    }
    
    const generatedVariants = JSON.parse(req.body.generatedVariants);
    
    const specifications = req.body.specifications 
      ? JSON.parse(req.body.specifications) 
      : [];

    // --- FIX: Extract Cloudinary URLs ---
    const files = req.files; 
    let imagePaths = [];
    if (files && files.length > 0) {
      // Multer-Cloudinary puts the full URL in `file.path`
      imagePaths = files.map(file => file.path); 
    }

    // Create and Save Product
    const newProduct = new Product({
      productInformation,
      pricing,
      organization,
      options,
      generatedVariants,
      specifications,
      Images: imagePaths, // Saves full Cloudinary URLs now
    });

    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });

  } catch (error) {
    console.error("Error creating product:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `A product with that name already exists.`
      });
    }

    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format." });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully.",
      data: product,
    });

  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const editProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, avilability, description } = req.body;

  const updatedFields = {};
  if (name !== undefined) updatedFields['productInformation.Name'] = name;
  if (price !== undefined) updatedFields['pricing.Price'] = price;
  if (avilability !== undefined) updatedFields['pricing.Availability'] = avilability;
  if (description !== undefined) updatedFields['productInformation.Description'] = description;

  if (Object.keys(updatedFields).length === 0) {
    return sendResponse(res,false, "No field provided for update.", 400);
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true }
    )

    if (!updatedProduct) {
      return sendResponse(res,false, "product not found", 400);
    }

    sendResponse(res,true, "Product updated successfully!", 200);
  } catch (err) {
    console.error('Error updating product:', err);
    sendResponse(res,false, "Server error.", 500);
  }
}

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return sendResponse(res, false, "product not found", 404);
    }
    return sendResponse(res, true, "Product deleted successfully!", 200);
  } catch (err) {
    console.error('Error deleting product:', err);
    return sendResponse(res, false, "Server error.", 500);
  }
}