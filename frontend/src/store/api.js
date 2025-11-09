import axios from 'axios'

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
            // Clear user data from localStorage
            localStorage.removeItem('user')
            // Redirect to login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api

