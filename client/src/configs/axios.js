import axios from "axios"
import { toast } from "react-hot-toast"

const baseURL = import.meta.env.VITE_BASEURL
    ? import.meta.env.VITE_BASEURL.replace(/\/+$/, '')
    : (import.meta.env.DEV ? 'http://localhost:3000' : '');

const api = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 15000,
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const isNetworkError = !error?.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';

        if (isNetworkError) {
            error.message = 'Network error. Please check your connection and try again.';
            toast.error(error.message);
        } else if (status === 503) {
            error.message = 'The server is temporarily unavailable. Please try again in a moment.';
            toast.error(error.message);
        } else if (status >= 500) {
            error.message = 'The server hit an error. Please try again shortly.';
            toast.error(error.message);
        }

        return Promise.reject(error);
    }
)

export default api