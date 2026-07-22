import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL, timeout: 10000 });

// Attach JWT if the user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jhanvika_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Guest cart identity — persists in localStorage until the user logs in
  let guestToken = localStorage.getItem("jhanvika_guest_token");
  if (!guestToken) {
    guestToken = crypto.randomUUID();
    localStorage.setItem("jhanvika_guest_token", guestToken);
  }
  config.headers["x-guest-token"] = guestToken;

  return config;
});

export default api;
