import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { initSocket, disconnectSocket } from '../socket';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await api.get('/auth/me');
                    setUser(data);
                    try {
                        const socket = initSocket(token);
                        socket.emit('join-role', data.role);
                    } catch (e) { /* socket is optional */ }
                } catch (error) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setUser(data);
        try {
            const socket = initSocket(data.token);
            socket.emit('join-role', data.role);
        } catch (e) { /* socket is optional */ }
        return data;
    };

    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        localStorage.setItem('token', data.token);
        setUser(data);
        try {
            const socket = initSocket(data.token);
            socket.emit('join-role', data.role);
        } catch (e) { /* socket is optional */ }
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        try { disconnectSocket(); } catch (e) { /* ignore */ }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
