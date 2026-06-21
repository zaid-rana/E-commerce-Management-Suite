import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs'; // Import the 'fs' module
import { uploadBanner, getBanners, deleteBanner } from '../controllers/BannerController.js';

const router = express.Router();

// --- Multer Storage Configuration ---

// 1. Define the full upload path
const uploadPath = path.join('uploads', 'banner');

// 2. Create the directory if it doesn't exist
// { recursive: true } ensures parent directories are also created (e.g., 'public' and 'uploads')
fs.mkdirSync(uploadPath, { recursive: true });

// This tells multer where to save the files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 3. Use the new path
    cb(null, uploadPath); 
  },
  filename: (req, file, cb) => {
    // Create a unique filename (this logic stays the same)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize multer upload middleware
const upload = multer({ storage: storage });
// --- End Multer Config ---


// --- Define Routes (No change here) ---

// GET /api/banners
router.get('/getbanner', getBanners);

// POST /api/banners/upload
router.post('/upload', upload.single('bannerImage'), uploadBanner);

// DELETE /api/banners/:id
router.delete('/:id', deleteBanner);


export default router;