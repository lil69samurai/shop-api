import api from "./axios";

export const getProductsApi = async (page = 0, size = 9) => {
  const response = await api.get("/api/products?page=" + page + "&size=" + size);
  return response.data;
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