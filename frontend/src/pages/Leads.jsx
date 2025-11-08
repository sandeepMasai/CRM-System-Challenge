import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchLeads, createLead, selectLeads } from '../store/slices/leadSlice'
import { toast } from 'react-toastify'
import api from '../store/api'

const statusColors = {
    'New': 'bg-gray-100 text-gray-800',
    'Contacted': 'bg-blue-100 text-blue-800',
    'Qualified': 'bg-yellow-100 text-yellow-800',
    'Proposal': 'bg-purple-100 text-purple-800',
    'Negotiation': 'bg-orange-100 text-orange-800',
    'Won': 'bg-green-100 text-green-800',
    'Lost': 'bg-red-100 text-red-800'
}

function Leads() {
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'New',
        source: '',
        estimatedValue: '',
        notes: ''
    })
    const [users, setUsers] = useState([])
    const [filters, setFilters] = useState({ status: '', page: 1 })
    const dispatch = useDispatch()
    const { leads, pagination, loading } = useSelector(selectLeads)

    useEffect(() => {
        dispatch(fetchLeads(filters))
        fetchUsers()
    }, [dispatch, filters])

    const fetchUsers = async () => {
        try {
            const response = await api.get('/auth/users')
            setUsers(response.data.users)
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await dispatch(createLead(formData)).unwrap()
            toast.success('Lead created successfully!')
            setShowModal(false)
            setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                status: 'New',
                source: '',
                estimatedValue: '',
                notes: ''
            })
            dispatch(fetchLeads(filters))
        } catch (error) {
            toast.error(error || 'Failed to create lead')
        }
    }

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value, page: 1 })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    + New Lead
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow flex gap-4">
                <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2"
                >
                    <option value="">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                </select>
            </div>

            {/* Leads Table */}
            {loading ? (
                <div className="text-center py-12">Loading leads...</div>
            ) : (
                <>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {leads.map((lead) => (
                                <li key={lead.id}>
                                    <Link
                                        to={`/leads/${lead.id}`}
                                        className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                                                    <p className="text-sm text-gray-500">{lead.email}</p>
                                                    {lead.company && (
                                                        <p className="text-sm text-gray-500">{lead.company}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[lead.status]}`}>
                                                    {lead.status}
                                                </span>
                                                {lead.estimatedValue && (
                                                    <p className="text-sm font-medium text-gray-900">
                                                        ${parseFloat(lead.estimatedValue).toLocaleString()}
                                                    </p>
                                                )}
                                                {lead.assignedTo && (
                                                    <p className="text-sm text-gray-500">
                                                        {lead.assignedTo.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center space-x-2">
                            <button
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                disabled={filters.page === 1}
                                className="px-4 py-2 border rounded-md disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {filters.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                disabled={filters.page === pagination.pages}
                                className="px-4 py-2 border rounded-md disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Create Lead Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-bold mb-4">Create New Lead</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Name *"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <input
                                type="email"
                                placeholder="Email *"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Company"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Qualified">Qualified</option>
                                <option value="Proposal">Proposal</option>
                                <option value="Negotiation">Negotiation</option>
                                <option value="Won">Won</option>
                                <option value="Lost">Lost</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Source"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <input
                                type="number"
                                placeholder="Estimated Value"
                                value={formData.estimatedValue}
                                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <textarea
                                placeholder="Notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                rows="3"
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Leads

