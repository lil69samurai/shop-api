import api from "./axios";

export const getMyOrdersApi = async () => {
  const response = await api.get("/api/orders");
  return response.data;
};

export const getOrderByIdApi = async (id) => {
  const response = await api.get(`/api/orders/${id}`);
  return response.data;
};

export const createOrderApi = async (data) => {
  const response = await api.post("/api/orders", data);
  return response.data;
};