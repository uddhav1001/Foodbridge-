import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationToast from './components/NotificationToast';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

import { DonorDashboard, CreateDonation } from './pages/donor/DonorDashboard';
import { VolunteerDashboard, RouteMap } from './pages/volunteer/VolunteerDashboard';
import { NgoDashboard } from './pages/ngo/NgoDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import Leaderboard from './pages/Leaderboard';

function App() {
    return (
        <Router>
            <Navbar />
            <NotificationToast />
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Donor Routes */}
                <Route path="/donor-dashboard" element={<ProtectedRoute allowedRoles={['donor']}><DonorDashboard /></ProtectedRoute>} />
                <Route path="/donor/create" element={<ProtectedRoute allowedRoles={['donor']}><CreateDonation /></ProtectedRoute>} />

                {/* Volunteer Routes */}
                <Route path="/volunteer-dashboard" element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerDashboard /></ProtectedRoute>} />
                <Route path="/volunteer/route" element={<ProtectedRoute allowedRoles={['volunteer']}><RouteMap /></ProtectedRoute>} />

                {/* NGO Routes */}
                <Route path="/ngo-dashboard" element={<ProtectedRoute allowedRoles={['ngo']}><NgoDashboard /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

                <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
        </Router>
    );
}

export default App;
