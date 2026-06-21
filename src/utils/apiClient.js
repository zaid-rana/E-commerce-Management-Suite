import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: true,
    // headers: {
    //     "Content-Type": "application/json",
    // },
});

apiClient.interceptors.request.use((config) => {
  console.log(" Sending request to:", config.baseURL + config.url);
  return config;
});

export default apiClient;