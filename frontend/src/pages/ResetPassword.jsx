import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../store/api'
import AnimatedBackground from '../components/AnimatedBackground'

function ResetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) {
            toast.error('Invalid or missing reset token')
            navigate('/forgot-password')
        }
    }, [token, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!password || !confirmPassword) {
            setError('Please fill in all fields')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            await api.post('/auth/reset-password', {
                token,
                password
            })
            toast.success('Password reset successfully! You can now sign in.')
            setTimeout(() => navigate('/login'), 2000)
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to reset password'
            setError(errorMessage)
            toast.error(errorMessage)
            console.error('Reset password error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return null
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            <AnimatedBackground />
            <div className="w-full max-w-md bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl px-8 py-10 z-10 border border-white/20 relative">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Reset Password
                    </h1>
                    <p className="mt-2 text-gray-500 text-sm">
                        Enter your new password below
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-lg bg-red-50 border-2 border-red-300 p-4">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            New Password
                        </label>
                        <div className="mt-1 relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    setError('')
                                }}
                                className="block w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 sm:text-sm transition"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path
                                            fillRule="evenodd"
                                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.977 9.977 0 00-4.158.83l-1.135-1.135zM14.95 6.05a3 3 0 014.242 4.242L14.95 6.05zM12.586 8.414L8.414 12.586A2 2 0 0110 12a2 2 0 01-1.586-.586zM2 4.222l2.929 2.929A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 2.069 0 3.983-.64 5.613-1.736L17.778 16l-1.414-1.414L2.586 2.586 1.172 4l.828.828L2 4.222z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value)
                                setError('')
                            }}
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-400 sm:text-sm transition"
                            placeholder="••••••••"
                        />
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
                                Resetting...
                            </span>
                        ) : (
                            'Reset Password'
                        )}
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        <Link
                            to="/login"
                            className="font-medium text-blue-600 hover:text-blue-700 transition"
                        >
                            Back to Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword

