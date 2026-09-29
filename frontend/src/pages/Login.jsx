import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            toast.success('Login successful!');
            navigate(`/${user.role}-dashboard`);
        } catch (err) {
            toast.error('Invalid credentials');
        }
    };

    return (
        <div className="page-wrapper container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="glass-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '24px' }}>Welcome Back</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="input-field"
                        required
                    />
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="input-field"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
                        >
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                        Log In
                    </button>
                </form>
                <p style={{ marginTop: '20px', color: 'var(--muted)', fontSize: '14px' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--green)' }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
