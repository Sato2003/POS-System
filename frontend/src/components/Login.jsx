import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin, onSwitchToRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password
            });

            if (response.data.success) {
                localStorage.removeItem('savedCart');
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                onLogin(response.data.data.user);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Elements */}
            <div style={{ position: 'absolute', top: '10%', left: '5%', fontSize: '80px', opacity: 0.08, transform: 'rotate(-15deg)' }}>🛍️</div>
            <div style={{ position: 'absolute', bottom: '15%', right: '8%', fontSize: '100px', opacity: 0.08, transform: 'rotate(10deg)' }}>🛒</div>
            <div style={{ position: 'absolute', top: '30%', right: '15%', fontSize: '60px', opacity: 0.06 }}>💳</div>
            
            <div style={{
                width: '100%',
                maxWidth: '420px',
                margin: '20px',
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    padding: '30px 20px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '55px', marginBottom: '10px' }}></div>
                    <h1 style={{ margin: 0, color: 'white', fontSize: '28px', fontWeight: 'bold' }}>POS SYSTEM</h1>
                    <p style={{ margin: '5px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Point of Sale System</p>
                </div>
                
                <div style={{ padding: '25px 30px 0 30px' }}>
                    <h2 style={{ margin: 0, color: '#333', fontSize: '22px', fontWeight: '600' }}>Welcome Back!</h2>
                    <p style={{ margin: '5px 0 0', color: '#666', fontSize: '13px' }}>Please login to your account</p>
                </div>
                
                <div style={{ padding: '20px 30px 30px 30px' }}>
                    {error && (
                        <div style={{ padding: '12px', backgroundColor: '#fee2e2', borderLeft: '4px solid #dc3545', color: '#dc3545', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>Username</label>
                            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden' }}>
                                <span style={{ padding: '12px 15px', backgroundColor: '#f0f4f8', borderRight: '1px solid #e0e0e0', color: '#2a5298' }}>👤</span>
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" style={{ flex: 1, padding: '12px 15px', border: 'none', outline: 'none', fontSize: '14px' }} required />
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>Password</label>
                            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden' }}>
                                <span style={{ padding: '12px 15px', backgroundColor: '#f0f4f8', borderRight: '1px solid #e0e0e0', color: '#2a5298' }}>🔑</span>
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" style={{ flex: 1, padding: '12px 15px', border: 'none', outline: 'none', fontSize: '14px' }} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ padding: '12px 15px', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>{showPassword ? 'Hidden' : 'View'}</button>
                            </div>
                        </div>
                        
                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#2a5298', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#1e3c72'} onMouseLeave={(e) => e.target.style.backgroundColor = '#2a5298'}>
                            {loading ? <>⏳ Logging in...</> : <>Login to POS</>}
                        </button>
                    </form>
                    
                    <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0 20px' }}>
                        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e0e0e0' }} />
                        <span style={{ padding: '0 10px', fontSize: '12px', color: '#ccc' }}>or</span>
                        <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e0e0e0' }} />
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#666', fontSize: '13px' }}>Don't have an account?{' '}
                            <button onClick={onSwitchToRegister} style={{ background: 'none', border: 'none', color: '#2a5298', cursor: 'pointer', fontWeight: 'bold' }}>Create New Account</button>
                        </p>
                    </div>
                    
                    <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f0f4f8', borderRadius: '10px', textAlign: 'center' }}>
                        <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>Demo Credentials</p>
                        <p style={{ fontSize: '11px', color: '#666', margin: '5px 0 0' }}>Username: <strong>admin</strong> | Password: <strong>admin123</strong></p>
                    </div>
                </div>
                
                <div style={{ backgroundColor: '#f0f4f8', padding: '12px', textAlign: 'center', borderTop: '1px solid #e0e0e0' }}>
                    <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>© 2024 POS System | All Rights Reserved</p>
                </div>
            </div>
        </div>
    );
};

export default Login;