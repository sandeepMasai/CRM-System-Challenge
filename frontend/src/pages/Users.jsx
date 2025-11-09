import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectAuth } from '../store/slices/authSlice'
import { toast } from 'react-toastify'
import api from '../store/api'
import { format } from 'date-fns'
import { UserPlus, Edit3, Trash2 } from 'lucide-react'

const roleColors = {
    Admin: 'bg-purple-100 text-purple-800 border border-purple-300',
    Manager: 'bg-blue-100 text-blue-800 border border-blue-300',
    'Sales Executive': 'bg-green-100 text-green-800 border border-green-300',
}

function Users() {
    const { user: currentUser } = useSelector(selectAuth)
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Sales Executive',
        isActive: true,
    })

    useEffect(() => {
        if (
            currentUser &&
            (currentUser.role === 'Admin' || currentUser.role === 'Manager')
        ) {
            fetchUsers()
        }
    }, [currentUser])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await api.get('/auth/users')
            setUsers(response.data.users)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch users')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateUser = async (e) => {
        e.preventDefault()
        try {
            await api.post('/auth/admin/register', formData)
            toast.success('User created successfully!')
            setShowModal(false)
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'Sales Executive',
                isActive: true,
            })
            fetchUsers()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user')
        }
    }

    const handleEditUser = (user) => {
        setSelectedUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            isActive: user.isActive,
        })
        setShowEditModal(true)
    }

    const handleUpdateUser = async (e) => {
        e.preventDefault()
        try {
            const updateData = { ...formData }
            if (!updateData.password) delete updateData.password
            await api.put(`/auth/users/${selectedUser.id}`, updateData)
            toast.success('User updated successfully!')
            setShowEditModal(false)
            setSelectedUser(null)
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'Sales Executive',
                isActive: true,
            })
            fetchUsers()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user')
        }
    }

    const handleDeleteUser = async (userId) => {
        if (
            !window.confirm(
                'Are you sure you want to delete this user? This action cannot be undone.'
            )
        )
            return

        try {
            await api.delete(`/auth/users/${userId}`)
            toast.success('User deleted successfully!')
            fetchUsers()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user')
        }
    }

    if (
        !currentUser ||
        (currentUser.role !== 'Admin' && currentUser.role !== 'Manager')
    ) {
        return (
            <div className="text-center py-12 text-secondary">
                Access denied. Admin or Manager role required.
            </div>
        )
    }

    if (loading) {
        return (
            <div className="text-center py-12 text-secondary text-lg font-medium">
                Loading users...
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-primary tracking-tight text-center sm:text-left">
                    User Management
                </h1>
                {currentUser.role === 'Admin' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-transform duration-200 text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
                    >
                        <UserPlus size={18} />
                        Create User
                    </button>
                )}
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                            <tr>
                                {['Name', 'Email', 'Role', 'Status', 'Created', 'Actions'].map(
                                    (header) => (
                                        <th
                                            key={header}
                                            className="px-4 sm:px-6 py-3 text-left font-semibold text-secondary uppercase text-xs"
                                        >
                                            {header}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-gray-200 dark:divide-slate-700">
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition duration-150"
                                >
                                    <td className="px-4 sm:px-6 py-4 font-medium text-primary whitespace-nowrap">
                                        {user.name}
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-secondary">
                                        {user.email}
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <span
                                            className={`px-3 py-1 text-xs font-semibold rounded-full ${roleColors[user.role]
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <span
                                            className={`px-3 py-1 text-xs font-semibold rounded-full ${user.isActive
                                                ? 'bg-green-100 text-green-800 border border-green-300'
                                                : 'bg-red-100 text-red-800 border border-red-300'
                                                }`}
                                        >
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-secondary">
                                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                            >
                                                <Edit3 size={16} />
                                                <span className="hidden sm:inline">Edit</span>
                                            </button>
                                            {user.id !== currentUser.id && (
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                                >
                                                    <Trash2 size={16} />
                                                    <span className="hidden sm:inline">Delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {(showModal || showEditModal) && (
                <div className="fixed inset-0 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="relative card p-6 w-[95%] max-w-md animate-fadeIn">
                        <h3 className="text-xl font-bold text-primary mb-4">
                            {showModal ? 'Create New User' : 'Edit User'}
                        </h3>

                        <form
                            onSubmit={showModal ? handleCreateUser : handleUpdateUser}
                            className="space-y-4"
                        >
                            <input
                                type="text"
                                placeholder="Full Name *"
                                required
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                            <input
                                type="email"
                                placeholder="Email *"
                                required
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                            <input
                                type="password"
                                placeholder={
                                    showModal
                                        ? 'Password *'
                                        : 'New Password (optional)'
                                }
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                required={showModal}
                            />
                            <select
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({ ...formData, role: e.target.value })
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                            >
                                <option value="Sales Executive">Sales Executive</option>
                                <option value="Manager">Manager</option>
                                <option value="Admin">Admin</option>
                            </select>

                            <div className="flex items-center">
                                <input
                                    id="isActive"
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) =>
                                        setFormData({ ...formData, isActive: e.target.checked })
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                                    Active
                                </label>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false)
                                        setShowEditModal(false)
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition w-full sm:w-auto"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition w-full sm:w-auto"
                                >
                                    {showModal ? 'Create' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Users
