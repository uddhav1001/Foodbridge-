import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
    if (!socket) {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        socket = io(BACKEND_URL, {
            auth: { token }
        });

        socket.on('connect', () => {
            console.log('🔗 Connected to Real-time API');
        });
    }
    return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
