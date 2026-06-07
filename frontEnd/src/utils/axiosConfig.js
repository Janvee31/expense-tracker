import axios from "axios";

// This file configures the global axios instance.
// It will automatically add the JWT token to out-going requests.

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// We can also add a response interceptor to handle 401/403 errors gracefully
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            const requestUrl = error.config?.url || "";
            if (!requestUrl.includes("/auth/")) {
                console.warn("Redirecting to /login due to failed request to:", requestUrl, "status:", error.response.status);
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default axios;
