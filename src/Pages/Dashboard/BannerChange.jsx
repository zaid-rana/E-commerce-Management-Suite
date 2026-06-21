import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, CircularProgress } from '@mui/material';
import { UploadFile, Delete } from '@mui/icons-material';
import apiClient from '../../utils/apiClient';

// Function to get the full image URL (adjust if your backend URL is different)
const getImageUrl = (path) => {
  // Assuming your server is running on localhost:5000
  // In production, this would be your 'https://api.yourdomain.com'
  const API_URL = 'http://localhost:5000'; 
  return `${API_URL}${path}`;
}

function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [altText, setAltText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- 1. Fetch all banners on component mount ---
  const fetchBanners = async () => {
    try {
      // const { data } = await axios.get('/api/banners/getbanner');
      // setBanners(data);
      // console.log('API Response:', data);
      const { data } = await apiClient.get('/banners/getbanner');
      setBanners(data);
      console.log('api res :',data);
    } catch (err) {
      setError('Could not fetch banners.');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // --- 2. Handle file selection ---
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // --- 3. Handle upload submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image to upload.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('bannerImage', selectedFile); // This key MUST match multer
    formData.append('altText', altText);
    formData.append('linkUrl', linkUrl);

    try {
      // const { data: newBanner } = await axios.post('/api/banners/upload', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });

      const { data: newBanner } = await apiClient.post('/banners/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Add new banner to the top of the list
      setBanners([newBanner, ...banners]);
      
      // Reset form
      setSelectedFile(null);
      setAltText('');
      setLinkUrl('');
      document.getElementById('file-input').value = null; // Clear file input
      
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. Handle banner deletion ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      await axios.delete(`/api/banners/${id}`);
      // Filter out the deleted banner from state
      setBanners(banners.filter(banner => banner._id !== id));
    } catch (err) {
      setError('Could not delete banner.');
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Manage Landing Page Banners
      </h1>

      {/* --- UPLOAD FORM --- */}
      <form 
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 mb-8"
      >
        <h2 className="text-lg font-semibold text-gray-800">Add New Banner</h2>
        
        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Banner Image
          </label>
          <input
            id="file-input"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {/* Alt Text */}
        <TextField
          fullWidth
          size="small"
          label="Alt Text (for accessibility)"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="e.g., 'Woman wearing new summer collection'"
        />

        {/* Link URL */}
        <TextField
          fullWidth
          size="small"
          label="Link URL (where banner clicks)"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="e.g., '/collections/summer-sale'"
        />
        
        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <UploadFile />}
            disabled={isLoading || !selectedFile}
          >
            {isLoading ? 'Uploading...' : 'Upload Banner'}
          </Button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
      </form>
      
      
      {/* --- CURRENT BANNERS LIST --- */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Current Banners
        </h2>
        
        {banners.length === 0 ? (
          <p className="text-gray-500">No banners uploaded yet.</p>
        ) : (
          <div className="space-y-4">
            {banners.map(banner => (
              <div 
                key={banner._id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <img 
                    // Use the helper to get the full URL
                    src={getImageUrl(banner.imageUrl)}
                    alt={banner.altText}
                    className="w-32 h-16 object-cover rounded-md bg-gray-100"
                  />
                  <div>
                    <p className="font-medium text-gray-700">
                      Links to: {banner.linkUrl}
                    </p>
                    <p className="text-sm text-gray-500">
                      Alt: {banner.altText}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleDelete(banner._id)}
                  startIcon={<Delete />}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BannerManager;