import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Separate axios instance + token storage key so an admin login never
// overwrites a customer's session token (and vice versa) in the same browser.
const adminApi = axios.create({ baseURL, timeout: 10000 });

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("jhanvika_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default adminApi;
