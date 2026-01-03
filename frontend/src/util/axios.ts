import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,  // vd http://localhost:3000/api
  withCredentials: true,
});

// Request interceptor - Add token to requests
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle token expiration
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 or 403, token might be invalid/expired
    if (error.response?.status === 401 || error.response?.status === 403) {
      const token = localStorage.getItem("accessToken");
      // Only remove token and redirect if we actually sent a token
      if (token) {
        console.warn("Token invalid or expired, clearing localStorage");
        localStorage.removeItem("accessToken");
        
        // Only redirect to login if not already on public pages
        const publicPages = ['/login', '/register', '/events', '/'];
        const currentPath = window.location.pathname;
        if (!publicPages.some(page => currentPath.startsWith(page))) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
