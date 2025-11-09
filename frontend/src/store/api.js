import axios from 'axios'
import { store } from './store'
import { clearAuth } from './slices/authSlice'

// Get API base URL from environment variable
// In development, Vite proxy handles /api
// In production, use full backend URL from env
const getApiBaseURL = () => {
    const apiBasePath = import.meta.env.VITE_API_BASE_PATH || '/api'
    const apiUrl = import.meta.env.VITE_API_URL

    // If VITE_API_URL is set and we're in production, use it
    if (apiUrl && import.meta.env.PROD) {
        return `${apiUrl}${apiBasePath}`
    }

    // Otherwise use relative path (for Vite proxy in dev)
    return apiBasePath
}

const api = axios.create({
    baseURL: getApiBaseURL(),
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Send cookies with requests
})

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear authentication state
            store.dispatch(clearAuth())

            // Don't redirect here - let React Router handle it via PrivateRoute
            // Redirecting here causes full page reload and breaks SPA routing in production
            // The PrivateRoute component will automatically redirect unauthenticated users
        }
        return Promise.reject(error)
    }
)

export default api

