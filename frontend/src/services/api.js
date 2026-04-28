import axios from "axios";
import { emitAuthExpired } from "../lib/events";

// ✅ Get API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL;

// 🔍 Debug (check in browser console)
console.log("API URL:", API_BASE_URL);

// ❌ Safety check (avoid silent failure)
if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is not defined");
}

// ✅ Ensure correct base URL (no trailing slash issues)
const API_URL = API_BASE_URL.endsWith("/api")
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

// ✅ Axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Request interceptor (attach token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("in_token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.debug(
    `[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
  );

  return config;
});

// 🔁 Response interceptor
api.interceptors.response.use(
  (response) => {
    console.debug(
      `[API] ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  async (error) => {
    const config = error.config;

    // 🔁 Retry logic for 503 errors
    if (
      error.response?.status === 503 &&
      config &&
      !config._isRetryExhausted
    ) {
      config._retryCount = config._retryCount || 0;

      if (config._retryCount < 3) {
        config._retryCount += 1;

        console.warn(
          `[API] 503 retry attempt ${config._retryCount}/3`
        );

        await new Promise((res) => setTimeout(res, 15000));
        return api(config);
      } else {
        config._isRetryExhausted = true;
      }
    }

    // 🔐 Handle 401 (auth expired)
    if (
      error.response?.status === 401 &&
      localStorage.getItem("in_token")
    ) {
      emitAuthExpired();
    }

    console.error("[API ERROR]", {
      url: config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return Promise.reject(error);
  }
);

// 📦 Utility for readable errors
export function getApiErrorMessage(
  error,
  fallback = "Something went wrong. Please try again."
) {
  if (error.code === "ECONNABORTED") {
    return "Request timed out. Please check your connection.";
  }

  if (error.response?.status === 503) {
    return "Server is busy. Please try again later.";
  }

  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    fallback
  );
}

export default api;