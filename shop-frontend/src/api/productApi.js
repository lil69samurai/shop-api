import api from "./axios";

export const getProductsApi = async (page = 0, size = 9, keyword = "", categoryId = "") => {
  let url = "/api/products?page=" + page + "&size=" + size;
  if (keyword) url += "&keyword=" + keyword;
  if (categoryId) url += "&categoryId=" + categoryId;
  const response = await api.get(url);  return response.data;
};

export const getProductByIdApi = async (id) => {
  const response = await api.get("/api/products/" + id);
  return response.data;
};

export const createProductApi = async (data) => {
  const response = await api.post("/api/products", data);
  return response.data;
};

export const updateProductApi = async (id, data) => {
  const response = await api.put(`/api/products/${id}`, data);
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