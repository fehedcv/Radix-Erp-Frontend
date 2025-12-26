import axios from "axios";

const frappeApi = axios.create({
  baseURL: import.meta.env.VITE_FRAPPE_URL || "/api",
  withCredentials: true, // REQUIRED for Frappe session cookies
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Optional: global error handling
frappeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Frappe permission / auth errors
      if (error.response.status === 401 || error.response.status === 403) {
        console.warn("AUTH ERROR", error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default frappeApi;
