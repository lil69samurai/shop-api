import api from "./axios";

// ============================================================
// Options 屬性 API
// ============================================================
export const getOptionsApi = async (productId) => {
  const response = await api.get(`/api/products/${productId}/options`);
  return response.data;
};

export const createOptionApi = async (productId, payload) => {
  const response = await api.post(`/api/products/${productId}/options`, payload);
  return response.data;
};

export const updateOptionApi = async (optionId, payload) => {
  const response = await api.put(`/api/products/options/${optionId}`, payload);
  return response.data;
};

export const deleteOptionApi = async (optionId) => {
  const response = await api.delete(`/api/products/options/${optionId}`);
  return response.data;
};

// ============================================================
// Variants (SKU) API
// ============================================================
export const getVariantsApi = async (productId) => {
  const response = await api.get(`/api/products/${productId}/variants`);
  return response.data;
};

export const createVariantApi = async (productId, payload) => {
  const response = await api.post(`/api/products/${productId}/variants`, payload);
  return response.data;
};

export const updateVariantApi = async (variantId, payload) => {
  const response = await api.put(`/api/products/variants/${variantId}`, payload);
  return response.data;
};

export const deleteVariantApi = async (variantId) => {
  const response = await api.delete(`/api/products/variants/${variantId}`);
  return response.data;
};
