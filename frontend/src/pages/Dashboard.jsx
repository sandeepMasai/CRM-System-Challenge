import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'
import api from '../store/api'
import { selectAuth } from '../store/slices/authSlice'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const { user } = useSelector(selectAuth)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const response = await api.get('/dashboard/stats')
            setStats(response.data.stats)
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="text-center py-12">Loading dashboard...</div>
    }

    if (!stats) {
        return <div className="text-center py-12">No data available</div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLeads}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        ${stats.totalValue.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Recent Activities</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.recentActivities}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Leads (30 days)</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.leadsLast30Days}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Leads by Status</h2>
                    <BarChart width={400} height={300} data={stats.leadsByStatus}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Activities by Type</h2>
                    <PieChart width={400} height={300}>
                        <Pie
                            data={stats.activitiesByType}
                            cx={200}
                            cy={150}
                            labelLine={false}
                            label={({ type, count }) => `${type}: ${count}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                        >
                            {stats.activitiesByType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </div>
            </div>

            {stats.leadsBySource && stats.leadsBySource.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Leads by Source</h2>
                    <BarChart width={600} height={300} data={stats.leadsBySource}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="source" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#00C49F" />
                    </BarChart>
                </div>
            )}
        </div>
    )
}

export default Dashboard

