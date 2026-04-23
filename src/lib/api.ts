import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "../types";

// Development: proxy via Vite ke localhost:5000
// Production: pakai VITE_API_URL dari environment variable
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Auto-attach token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("km_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-hendle 401
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiError>) => {
    if (err.response?.status == 401) {
      localStorage.removeItem("km_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;
