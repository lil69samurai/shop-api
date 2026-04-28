export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Cloudinary cloud name (for banner images)
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dm8ovqeot";

export const getImageSrc = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return API_BASE_URL + imageUrl;
};

// Get banner images from Cloudinary shop-banners folder
export const getBannerUrl = (filename) => {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/shop-banners/${filename}`;
};
