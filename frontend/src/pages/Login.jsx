import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { login, selectAuth } from '../store/slices/authSlice'
import { toast } from 'react-toastify'
import AnimatedBackground from '../components/AnimatedBackground'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading, isAuthenticated } = useSelector(selectAuth)

    useEffect(() => {
        if (isAuthenticated) navigate('/')
    }, [isAuthenticated, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const result = await dispatch(login({ email, password })).unwrap()
            if (result && result.user) {
                toast.success('Welcome back ')
                setTimeout(() => navigate('/'), 300)
            }
        } catch (error) {
            let errorMessage = 'Login failed'
            if (typeof error === 'string') errorMessage = error
            else if (error?.message) errorMessage = error.message
            else if (error?.response?.data?.message)
                errorMessage = error.response.data.message
            else if (!error?.response)
                errorMessage = 'Unable to connect to server. Please check if the backend is running.'

            toast.error(errorMessage)
            console.error('Login error:', error)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            <AnimatedBackground />
            <div className="w-full max-w-md bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl px-8 py-10 z-10 border border-white/20 relative">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        CRM Login
                    </h1>
                    <p className="mt-2 text-gray-500 text-sm">
                        Sign in to manage your leads and activities
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-primary">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-primary shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:ring-offset-blue-50 dark:focus:ring-offset-slate-800 sm:text-sm transition"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-primary">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-primary shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:ring-offset-blue-50 dark:focus:ring-offset-slate-800 sm:text-sm transition"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link
                                to="/forgot-password"
                                className="font-medium text-blue-600 hover:text-blue-700 transition"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-lg text-white transition-all duration-300 ease-in-out ${loading
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                            } shadow-lg hover:shadow-xl`}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg
                                    className="animate-spin h-5 w-5 mr-2 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                                Signing in...
                            </span>
                        ) : (
                            'Sign in'
                        )}
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        Don’t have an account?{' '}
                        <Link
                            to="/register"
                            className="font-medium text-blue-600 hover:text-blue-700 transition"
                        >
                            Create one
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Login
