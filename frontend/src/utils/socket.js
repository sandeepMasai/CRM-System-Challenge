import { io } from 'socket.io-client'

let socket = null

export const initializeSocket = (userId) => {
    if (!userId) return null

    // Disconnect existing socket if any
    if (socket) {
        socket.disconnect()
        socket = null
    }

    socket = io('http://localhost:5000', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    })

    socket.on('connect', () => {
        console.log('Socket connected')
        socket.emit('join', userId)
    })

    socket.on('disconnect', () => {
        console.log('Socket disconnected')
    })

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
    })

    return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

