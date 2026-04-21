import api from "./axios";

export const getCategoriesApi = async () => {
  const response = await api.get("/api/categories");
  return response.data;
};

export const createCategoryApi = async (data) => {
  const response = await api.post("/api/categories", data);
  return response.data;
};