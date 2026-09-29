import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
    if (!socket) {
        socket = io('http://localhost:5000', {
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
