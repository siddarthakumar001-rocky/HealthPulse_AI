import axios from "axios";

let localApiUrl =
  import.meta.env.VITE_API_URL_LOCAL ||
  `http://localhost:${import.meta.env.VITE_PORT || 5001}/api`;
if (localApiUrl && !localApiUrl.endsWith("/api") && !localApiUrl.endsWith("/api/")) {
  localApiUrl = localApiUrl.replace(/\/+$/, "") + "/api";
}

let remoteApiUrl = import.meta.env.VITE_API_URL || "https://health-931r.onrender.com/api";
if (remoteApiUrl && !remoteApiUrl.endsWith("/api") && !remoteApiUrl.endsWith("/api/")) {
  remoteApiUrl = remoteApiUrl.replace(/\/+$/, "") + "/api";
}

const API_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? localApiUrl
    : remoteApiUrl;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function getAuthToken(url) {
  if (url && url.startsWith("/admin")) {
    return localStorage.getItem("admin_token") || localStorage.getItem("token") || null;
  }
  return localStorage.getItem("token") || localStorage.getItem("admin_token") || null;
}

// Request interceptor for tokens
api.interceptors.request.use((config) => {
  const token = getAuthToken(config.url);

  console.log("Using token:", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor for easy data access and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} Status: ${response.status}`, response.data);
    return response.data;
  },
  (error) => {
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    const message = error.response?.data?.error || error.response?.data?.message || error.message;
    console.error(`[API Error] ${method} ${url}:`, message);
    return Promise.reject(new Error(message));
  }
);

export { api, API_URL };
export default api;