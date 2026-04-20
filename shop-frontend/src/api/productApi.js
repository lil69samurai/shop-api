import api from "./axios";

export const getProductsApi = async () => {
  const response = await api.get("/api/products");
  return response.data;
};

export const getProductByIdApi = async (id) => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};