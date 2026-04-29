import api from "./axios";

export const getProductsApi = async (page = 0, size = 9, keyword = "", categoryId = "", sortBy = "createdAt", sortDir = "desc", minPrice = "", maxPrice = "") => {
  let url = "/api/products?page=" + page + "&size=" + size;
  if (keyword) url += "&keyword=" + encodeURIComponent(keyword);
  if (categoryId) url += "&categoryId=" + categoryId;
  if (sortBy) url += "&sortBy=" + sortBy;
  if (sortDir) url += "&sortDir=" + sortDir;
  if (minPrice !== "" && minPrice !== null && minPrice !== undefined) url += "&minPrice=" + minPrice;
  if (maxPrice !== "" && maxPrice !== null && maxPrice !== undefined) url += "&maxPrice=" + maxPrice;
  const response = await api.get(url);
  return response.data;
};

export const getProductByIdApi = async (id) => {
  const response = await api.get("/api/products/" + id);
  return response.data;
};

export const createProductApi = async (productData, imageFile) => {
  const formData = new FormData();
  formData.append("product", new Blob([JSON.stringify(productData)], { type: "application/json" }));
  if (imageFile) {
    formData.append("image", imageFile);
  }
  const response = await api.post("/api/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateProductApi = async (id, productData, imageFile) => {
  const formData = new FormData();
  formData.append("product", new Blob([JSON.stringify(productData)], { type: "application/json" }));
  if (imageFile) {
    formData.append("image", imageFile);
  }
  const response = await api.put(`/api/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteProductApi = async (id) => {
  const response = await api.delete(`/api/products/${id}`);
  return response.data;
};

export const uploadProductImageApi = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/api/products/" + id + "/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const uploadProductImagesApi = async (id, files) => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }
  const response = await api.post("/api/products/" + id + "/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteProductImageApi = async (imageId) => {
  const response = await api.delete("/api/products/images/" + imageId);
  return response.data;
};


export const reorderProductImagesApi = async (id, imageIds) => {
  const response = await api.patch(`/api/products/${id}/images/reorder`, { imageIds });
  return response.data;
};
