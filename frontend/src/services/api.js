import axios from "axios";
import { emitAuthExpired } from "../lib/events";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8080"
    : window.location.origin);

const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, "");
export const API_URL = normalizedBaseUrl.endsWith("/api")
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lm_token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.debug(
    `[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
  );

  return config;
});

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

    if (
      error.response?.status === 503 &&
      config &&
      !config._isRetryExhausted
    ) {
      config._retryCount = config._retryCount || 0;

      if (config._retryCount < 3) {
        config._retryCount += 1;

        console.warn(`[API] 503 retry attempt ${config._retryCount}/3`);

        await new Promise((res) => setTimeout(res, 15000));
        return api(config);
      }

      config._isRetryExhausted = true;
    }

    if (
      error.response?.status === 401 &&
      localStorage.getItem("lm_token")
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

export function getApiErrorMessage(
  error,
  fallback = "Something went wrong. Please try again."
) {
  if (error.code === "ECONNABORTED") {
    return "Request timed out. Please check your connection.";
  }

  if (!error.response) {
    return "Unable to reach the server. Please check your connection and try again.";
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
