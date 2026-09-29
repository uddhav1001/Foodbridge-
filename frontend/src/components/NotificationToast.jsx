import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../socket';

const NotificationToast = () => {
    const { user } = useAuth();

    useEffect(() => {
        const socket = getSocket();
        if (!socket || !user) return;

        const notify = (msg, icon) => toast(msg, { icon, style: { background: '#12121a', color: '#fff', border: '1px solid #00ff88' } });

        socket.on('new-donation', (data) => {
            if (user.role === 'volunteer') notify(`New surplus: ${data.quantity} meals of ${data.foodType}!`, '🚨');
        });

        socket.on('donation-claimed', (data) => {
            if (user.role === 'ngo') notify(`A volunteer claimed a pickup for you!`, '🏃');
        });

        socket.on('donation-delivered', (data) => {
            notify(`Delivery complete! ${data.meals} meals saved.`, '✅');
        });

        return () => {
            socket.off('new-donation');
            socket.off('donation-claimed');
            socket.off('donation-delivered');
        };
    }, [user]);

    return <Toaster position="bottom-right" reverseOrder={false} />;
};

export default NotificationToast;
