import api from "./axios";

export const getDashboardStatsApi = async () => {
  const response = await api.get("/api/admin/stats");
  return response.data;
};
