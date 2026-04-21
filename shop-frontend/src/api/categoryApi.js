import api from "./axios";

export const getCategoriesApi = async () => {
  const response = await api.get("/api/categories");
  return response.data;
};

export const getCategoryByIdApi = async (id) => {
  const response = await api.get("/api/categories/" + id);
  return response.data;
};

export const createCategoryApi = async (data) => {
  const response = await api.post("/api/categories", data);
  return response.data;
};

export const updateCategoryApi = async (id, data) => {
  const response = await api.put("/api/categories/" + id, data);
  return response.data;
};

export const deleteCategoryApi = async (id) => {
  const response = await api.delete("/api/categories/" + id);
  return response.data;
};