import axios from "axios";

// Render 免費方案冷啟動最久可達 90 秒
// 第一次 request timeout 會自動 retry 一次
const TIMEOUT_MS = 90000;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    timeout: TIMEOUT_MS,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isAuthRequest = error.config?.url?.includes("/api/auth/");
    const config = error.config || {};

    // 自動重試一次：當遇到 timeout 或網路錯誤（通常是 Render 冷啟動）
    const isTimeoutOrNetwork =
      error.code === "ECONNABORTED" ||
      (!error.response && error.message !== "canceled");

    if (isTimeoutOrNetwork && !config.__isRetry) {
      console.log("[axios] First attempt failed (likely cold start), retrying once...");
      config.__isRetry = true;
      // 等 2 秒讓 Render 完全醒來
      await new Promise((r) => setTimeout(r, 2000));
      try {
        return await api.request(config);
      } catch (retryError) {
        console.error("[axios] Retry also failed:", retryError);
        return Promise.reject(retryError);
      }
    }

    if (error.code === "ECONNABORTED") {
      console.error("Request timeout:", error);
    }

    if (!error.response) {
      console.error("Network error or server is waking up:", error);
    }

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/**
 * 主動喚醒後端（適用於進入需要 API 的頁面前先 ping 一下）
 * 例：登入頁可以在背景呼叫此函式，等使用者真的按登入時後端已經醒了
 */
export const wakeUpBackend = async () => {
  try {
    await api.get("/api/categories", { timeout: TIMEOUT_MS });
    console.log("[axios] Backend is awake");
    return true;
  } catch (e) {
    console.warn("[axios] Wake-up ping failed:", e?.message);
    return false;
  }
};

export default api;
