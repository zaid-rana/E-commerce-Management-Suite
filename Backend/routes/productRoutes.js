import express from "express";
import multer from "multer";
import { createProduct, editProduct, getProducts, deleteProduct, getProductById } from "../controllers/productController.js";
import { storage } from "../config/cloudinary.js"; // Import the Cloudinary storage

const router = express.Router();

// Initialize Multer with Cloudinary Storage
const upload = multer({ 
    storage: storage,
});

// Routes
router.post('/createproducts', upload.array('Images', 10), createProduct);
router.get("/getproducts", getProducts);
router.get("/getProductByID/:id", getProductById);
router.put("/products/:id", editProduct);
router.delete("/products/:id", deleteProduct);

export default router;