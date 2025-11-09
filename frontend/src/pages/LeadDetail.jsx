import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLeadById, updateLead, deleteLead, selectLeads } from '../store/slices/leadSlice'
import { selectAuth } from '../store/slices/authSlice'
import { toast } from 'react-toastify'
import api from '../store/api'
import { format } from 'date-fns'

const statusColors = {
    'New': 'bg-gray-100 text-gray-800',
    'Contacted': 'bg-blue-100 text-blue-800',
    'Qualified': 'bg-yellow-100 text-yellow-800',
    'Proposal': 'bg-purple-100 text-purple-800',
    'Negotiation': 'bg-orange-100 text-orange-800',
    'Won': 'bg-green-100 text-green-800',
    'Lost': 'bg-red-100 text-red-800'
}

function LeadDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { currentLead, loading } = useSelector(selectLeads)
    const { user } = useSelector(selectAuth)
    const [activities, setActivities] = useState([])
    const [showActivityModal, setShowActivityModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [activityForm, setActivityForm] = useState({
        type: 'Note',
        title: '',
        description: ''
    })
    const [editForm, setEditForm] = useState({})

    useEffect(() => {
        dispatch(fetchLeadById(id))
        fetchActivities()
    }, [id, dispatch])

    useEffect(() => {
        if (currentLead) {
            setEditForm({
                name: currentLead.name,
                email: currentLead.email,
                phone: currentLead.phone || '',
                company: currentLead.company || '',
                status: currentLead.status,
                source: currentLead.source || '',
                estimatedValue: currentLead.estimatedValue || '',
                notes: currentLead.notes || ''
            })
        }
    }, [currentLead])

    const fetchActivities = async () => {
        try {
            const response = await api.get(`/activities/lead/${id}`)
            setActivities(response.data.activities)
        } catch (error) {
            console.error('Error fetching activities:', error)
        }
    }

    const handleActivitySubmit = async (e) => {
        e.preventDefault()
        try {
            await api.post('/activities', {
                ...activityForm,
                leadId: id
            })
            toast.success('Activity created successfully!')
            setShowActivityModal(false)
            setActivityForm({ type: 'Note', title: '', description: '' })
            fetchActivities()
            dispatch(fetchLeadById(id))
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create activity')
        }
    }

    const handleUpdateLead = async (e) => {
        e.preventDefault()
        try {
            await dispatch(updateLead({ id, data: editForm })).unwrap()
            toast.success('Lead updated successfully!')
            setShowEditModal(false)
            // Refresh activities in case status change created a new activity
            fetchActivities()
            // Refresh lead data
            dispatch(fetchLeadById(id))
        } catch (error) {
            toast.error(error || 'Failed to update lead')
        }
    }

    const handleDeleteLead = async () => {
        if (!window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
            return
        }
        try {
            await dispatch(deleteLead(id)).unwrap()
            toast.success('Lead deleted successfully!')
            navigate('/leads')
        } catch (error) {
            toast.error(error || 'Failed to delete lead')
        }
    }

    if (loading) {
        return <div className="text-center py-12">Loading lead details...</div>
    }

    if (!currentLead) {
        return <div className="text-center py-12">Lead not found</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate('/leads')}
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Back to Leads
                </button>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Edit Lead
                    </button>
                    <button
                        onClick={handleDeleteLead}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                        Delete Lead
                    </button>
                </div>
            </div>

            <div className="card p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">{currentLead.name}</h1>
                        <p className="text-secondary mt-1">{currentLead.email}</p>
                        {currentLead.company && (
                            <p className="text-secondary">{currentLead.company}</p>
                        )}
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[currentLead.status]}`}>
                        {currentLead.status}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                        <label className="text-sm font-medium text-secondary">Phone</label>
                        <p className="text-primary">{currentLead.phone || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-secondary">Source</label>
                        <p className="text-primary">{currentLead.source || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-secondary">Estimated Value</label>
                        <p className="text-primary">
                            {currentLead.estimatedValue ? `$${parseFloat(currentLead.estimatedValue).toLocaleString()}` : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-secondary">Assigned To</label>
                        <p className="text-primary">{currentLead.assignedTo?.name || 'Unassigned'}</p>
                    </div>
                    {currentLead.notes && (
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-secondary">Notes</label>
                            <p className="text-primary">{currentLead.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Activities Section */}
            <div className="card p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-primary">Activity Timeline</h2>
                    <button
                        onClick={() => setShowActivityModal(true)}
                        className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 text-sm transition"
                    >
                        + Add Activity
                    </button>
                </div>

                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div key={activity.id} className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-primary">{activity.title}</h3>
                                    <p className="text-sm text-secondary">{activity.description}</p>
                                    <p className="text-xs text-muted mt-1">
                                        {activity.user?.name} • {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}
                                    </p>
                                </div>
                                <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                    {activity.type}
                                </span>
                            </div>
                        </div>
                    ))}
                    {activities.length === 0 && (
                        <p className="text-secondary text-center py-8">No activities yet</p>
                    )}
                </div>
            </div>

            {/* Add Activity Modal */}
            {showActivityModal && (
                <div className="fixed inset-0 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border border-card w-96 shadow-lg rounded-md card">
                        <h3 className="text-lg font-bold mb-4 text-primary">Add Activity</h3>
                        <form onSubmit={handleActivitySubmit} className="space-y-4">
                            <select
                                value={activityForm.type}
                                onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="Note">Note</option>
                                <option value="Call">Call</option>
                                <option value="Meeting">Meeting</option>
                                <option value="Email">Email</option>
                                <option value="Status Change">Status Change</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Title *"
                                required
                                value={activityForm.title}
                                onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <textarea
                                placeholder="Description"
                                value={activityForm.description}
                                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                rows="4"
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowActivityModal(false)}
                                    className="px-4 py-2 border rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Lead Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-gray-900/50 dark:bg-black/70 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border border-card w-96 shadow-lg rounded-md card">
                        <h3 className="text-lg font-bold mb-4 text-primary">Edit Lead</h3>
                        <form onSubmit={handleUpdateLead} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Name *"
                                required
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <input
                                type="email"
                                placeholder="Email *"
                                required
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Company"
                                value={editForm.company}
                                onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <select
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
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
                                value={editForm.source}
                                onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <input
                                type="number"
                                placeholder="Estimated Value"
                                value={editForm.estimatedValue}
                                onChange={(e) => setEditForm({ ...editForm, estimatedValue: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            />
                            <textarea
                                placeholder="Notes"
                                value={editForm.notes}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                rows="3"
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 border rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LeadDetail

