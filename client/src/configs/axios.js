import axios from "axios"

const baseURL = import.meta.env.VITE_BASEURL
    ? import.meta.env.VITE_BASEURL.replace(/\/+$/, '')
    : (import.meta.env.DEV ? 'http://localhost:3000' : '');

const api = axios.create({
    baseURL,
    withCredentials: true,
})

export default api