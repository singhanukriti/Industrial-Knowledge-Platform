import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE,
    timeout: 60000,
});

export default api;
