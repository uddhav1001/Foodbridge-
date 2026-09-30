import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'donor' });
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Simulate asking for location if volunteer
            let location = { type: 'Point', coordinates: [0, 0] };
            if (formData.role === 'volunteer' || formData.role === 'ngo' || formData.role === 'donor') {
                // Just mock a coordinate near India for hackathon demo
                location.coordinates = [77.1025, 28.7041]; // Delhi avg
            }

            const user = await register({ ...formData, location });
            toast.success('Registration successful!');
            navigate(`/${user.role}-dashboard`);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || 'Registration failed. Please try again.';
            toast.error(msg);
        }
    };

    return (
        <div className="page-wrapper container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass-card" style={{ maxWidth: '450px', width: '100%', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '24px' }}>Create an Account</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Full Name or Org Name" required className="input-field"
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <input type="email" placeholder="Email Address" required className="input-field"
                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    <div style={{ position: 'relative' }}>
                        <input type={showPassword ? "text" : "password"} placeholder="Password" required className="input-field"
                            value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
                        >
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                    </div>

                    <select
                        className="input-field"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        style={{ appearance: 'none', background: 'rgba(255,255,255,0.05)' }}
                    >
                        <option value="donor" style={{ color: '#000' }}>Food Donor (Restaurant/Mess)</option>
                        <option value="volunteer" style={{ color: '#000' }}>Volunteer Rider</option>
                        <option value="ngo" style={{ color: '#000' }}>NGO Shelter</option>
                        <option value="admin" style={{ color: '#000' }}>System Admin</option>
                    </select>

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>Sign Up</button>
                </form>
                <p style={{ marginTop: '20px', color: 'var(--muted)', fontSize: '14px' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--green)' }}>Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
