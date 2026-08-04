import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.PROD
        ? (import.meta.env.VITE_BASEURL && !import.meta.env.VITE_BASEURL.includes('localhost') ? import.meta.env.VITE_BASEURL : '/api')
        : (import.meta.env.VITE_BASEURL || 'http://localhost:3000'),
    withCredentials: true,
})

export default api