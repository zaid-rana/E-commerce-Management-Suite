import Banner from '../models/Banner.js';
import fs from 'fs'; // Node.js File System module
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..'); // Assumes controller is one level deep

// --- GET All Banners ---
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error });
  }
};


// --- UPLOAD New Banner ---
export const uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Get form fields from req.body
    const { altText, linkUrl } = req.body;

    // We get the path from multer and save it to the DB
    // We replace '\' with '/' for cross-platform compatibility
    const imageUrl = `/${req.file.path.replace(/\\/g, "/")}`; 

    const newBanner = new Banner({
      imageUrl,
      altText: altText || 'Banner Image',
      linkUrl: linkUrl || '/'
    });

    await newBanner.save();
    res.status(201).json(newBanner);

  } catch (error) {
    res.status(500).json({ message: 'Error uploading banner', error });
  }
};


// --- DELETE a Banner ---
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    // 1. Delete the file from the server
    // Get the path relative to the project root
    // banner.imageUrl is like '/public/uploads/banner-123.jpg'
    // We need to remove the leading '/'
    const filePath = path.join(projectRoot, banner.imageUrl.substring(1));
    
    fs.unlink(filePath, async (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        // Don't stop, still try to delete from DB
      }

      // 2. Delete the record from the database
      await Banner.findByIdAndDelete(id);
      res.status(200).json({ message: 'Banner deleted successfully' });
    });

  } catch (error) {
    res.status(500).json({ message: 'Error deleting banner', error });
  }
};