import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  // The path to the image on your server or in cloud storage
  imageUrl: { 
    type: String, 
    required: true 
  },
  // Alt text for accessibility (good practice)
  altText: { 
    type: String, 
    default: 'Banner Image' 
  },
  // Optional: A URL the banner should link to
  linkUrl: { 
    type: String,
    default: '/' 
  }
}, { timestamps: true });

export default mongoose.model("Banner", bannerSchema);