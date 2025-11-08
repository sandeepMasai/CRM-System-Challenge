import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api'

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials)
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))
            return response.data
        } catch (error) {
            let errorMessage = 'Login failed'

            if (error.response) {
                // Server responded with error
                errorMessage = error.response.data?.message ||
                    error.response.data?.error ||
                    'Login failed'
            } else if (error.request) {
                // Request made but no response
                errorMessage = 'Unable to connect to server. Please check if the backend is running.'
            } else {
                // Something else happened
                errorMessage = error.message || 'Login failed'
            }

            console.error('Login API error:', error)
            return rejectWithValue(errorMessage)
        }
    }
)

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/register', userData)
            // Save token and user to localStorage on successful registration
            if (response.data.token) {
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('user', JSON.stringify(response.data.user))
            }
            return response.data
        } catch (error) {
            let errorMessage = 'Registration failed'

            if (error.response) {
                errorMessage = error.response.data?.message ||
                    error.response.data?.error ||
                    'Registration failed'
            } else if (error.request) {
                errorMessage = 'Unable to connect to server. Please check if the backend is running.'
            } else {
                errorMessage = error.message || 'Registration failed'
            }

            console.error('Registration API error:', error)
            return rejectWithValue(errorMessage)
        }
    }
)

export const getCurrentUser = createAsyncThunk(
    'auth/me',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/me')
            return response.data.user
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to get user')
        }
    }
)

// Safely parse localStorage user
const getStoredUser = () => {
    try {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    } catch (error) {
        console.error('Error parsing stored user:', error)
        return null
    }
}

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: getStoredUser(),
        token: localStorage.getItem('token') || null,
        isAuthenticated: !!localStorage.getItem('token'),
        loading: false,
        error: null
    },
    reducers: {
        logout: (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        },
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false
                state.isAuthenticated = true
                state.user = action.payload.user
                state.token = action.payload.token
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload
                state.isAuthenticated = true
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.isAuthenticated = false
                state.user = null
                state.token = null
                localStorage.removeItem('token')
                localStorage.removeItem('user')
            })
            .addCase(register.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false
                state.isAuthenticated = true
                state.user = action.payload.user
                state.token = action.payload.token
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    }
})

export const { logout, clearError } = authSlice.actions
export const selectAuth = (state) => state.auth
export default authSlice.reducer

