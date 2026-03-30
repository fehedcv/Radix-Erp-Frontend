import axios from "axios";

const frappeApi = axios.create({
  baseURL: import.meta.env.VITE_FRAPPE_URL || "/api",
  // ❌ removed withCredentials — not needed for token auth
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Attach token on every request
frappeApi.interceptors.request.use((config) => {
  const apiKey    = localStorage.getItem("bc_api_key");
  const apiSecret = localStorage.getItem("bc_api_secret");
  if (apiKey && apiSecret) {
    config.headers["Authorization"] = `token ${apiKey}:${apiSecret}`;
  }
  return config;
});

// Global error handling
frappeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("AUTH ERROR", error.response.data);
      // Optionally clear tokens and redirect
      localStorage.removeItem("bc_api_key");
      localStorage.removeItem("bc_api_secret");
      localStorage.removeItem("vynx_user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default frappeApi;