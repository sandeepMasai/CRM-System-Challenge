import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectNotifications, markAsRead, markAllAsRead } from '../store/slices/notificationSlice'
import { format } from 'date-fns'

function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const { notifications, unreadCount } = useSelector(selectNotifications)
    const dispatch = useDispatch()

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleNotificationClick = (notificationId) => {
        dispatch(markAsRead(notificationId))
    }

    const handleMarkAllRead = () => {
        dispatch(markAllAsRead())
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                No notifications
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification.id)}
                                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {format(
                                                        new Date(notification.timestamp),
                                                        'MMM dd, yyyy HH:mm'
                                                    )}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <span className="ml-2 h-2 w-2 bg-blue-500 rounded-full"></span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationDropdown

