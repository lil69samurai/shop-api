import api from "./axios";

export const getProductsApi = async () => {
  const response = await api.get("/api/products?size=100");
  return response.data;
};

export const getProductByIdApi = async (id) => {
  const response = await api.get(`/api/products/${id}`);
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