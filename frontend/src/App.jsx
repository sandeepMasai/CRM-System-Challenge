import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import LeadDetail from './pages/LeadDetail'
import Integrations from './pages/Integrations'
import Layout from './components/Layout'
import { selectAuth } from './store/slices/authSlice'
import { useSocket } from './hooks/useSocket'

function PrivateRoute({ children }) {
    const { isAuthenticated } = useSelector(selectAuth)
    // Initialize socket for authenticated users
    useSocket()
    return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="leads" element={<Leads />} />
                <Route path="leads/:id" element={<LeadDetail />} />
                <Route path="integrations" element={<Integrations />} />
            </Route>
        </Routes>
    )
}

export default App

