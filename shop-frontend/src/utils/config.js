export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const getImageSrc = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return API_BASE_URL + imageUrl;
};
