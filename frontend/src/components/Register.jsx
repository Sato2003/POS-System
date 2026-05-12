import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';

const Register = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        role: 'cashier'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!formData.username || !formData.password || !formData.name) {
            setError('Please fill all required fields');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 4) {
            setError('Password must be at least 4 characters');
            setLoading(false);
            return;
        }

        try {
            // const response = await axios.post('http://localhost:5000/api/auth/register', {
            const response = await axios.post(`${API_URL}/auth/register`, {
                username: formData.username,
                password: formData.password,
                name: formData.name,
                role: formData.role
            });

            if (response.data.success) {
                setSuccess('Account created successfully! Redirecting...');
                setTimeout(() => onSwitchToLogin(), 2000);
            }
        } catch (error) {
            if (error.response?.data?.error?.includes('duplicate')) {
                setError('Username already exists. Please choose another.');
            } else {
                setError(error.response?.data?.error || 'Registration failed');
            }
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
            <div style={{ position: 'absolute', top: '10%', left: '5%', fontSize: '80px', opacity: 0.08, transform: 'rotate(-15deg)' }}>🛍️</div>
            <div style={{ position: 'absolute', bottom: '15%', right: '8%', fontSize: '100px', opacity: 0.08, transform: 'rotate(10deg)' }}>🛒</div>
            
            <div style={{
                width: '100%',
                maxWidth: '480px',
                margin: '20px',
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    padding: '25px 20px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '50px', marginBottom: '5px' }}></div>
                    <h1 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: 'bold' }}>Create Account</h1>
                    <p style={{ margin: '5px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Register for POS access</p>
                </div>
                
                <div style={{ padding: '25px 30px' }}>
                    {error && <div style={{ padding: '12px', backgroundColor: '#fee2e2', borderLeft: '4px solid #dc3545', color: '#dc3545', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>{error}</div>}
                    {success && <div style={{ padding: '12px', backgroundColor: '#d4edda', borderLeft: '4px solid #28a745', color: '#155724', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>{success}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Full Name *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#2a5298'} onBlur={(e) => e.target.style.borderColor = '#e0e0e0'} required />
                        </div>
                        
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Username *</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#2a5298'} onBlur={(e) => e.target.style.borderColor = '#e0e0e0'} required />
                        </div>
                        
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Password *</label>
                            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 4 characters" style={{ flex: 1, padding: '12px', border: 'none', outline: 'none', fontSize: '14px' }} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ padding: '12px 15px', background: 'none', border: 'none', cursor: 'pointer' }}>{showPassword ? 'Hidden' : 'View'}</button>
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Confirm Password *</label>
                            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" style={{ flex: 1, padding: '12px', border: 'none', outline: 'none', fontSize: '14px' }} required />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: '12px 15px', background: 'none', border: 'none', cursor: 'pointer' }}>{showConfirmPassword ? 'Hidden' : 'View'}</button>
                            </div>
                        </div>
                        
                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#2a5298', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#1e3c72'} onMouseLeave={(e) => e.target.style.backgroundColor = '#2a5298'}>
                            {loading ? 'Creating...' : 'Register'}
                        </button>
                    </form>
                    
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <p style={{ color: '#666', fontSize: '13px' }}>Already have an account?{' '}
                            <button onClick={onSwitchToLogin} style={{ background: 'none', border: 'none', color: '#2a5298', cursor: 'pointer', fontWeight: 'bold' }}>Sign In</button>
                        </p>
                    </div>
                </div>
                
                <div style={{ backgroundColor: '#f0f4f8', padding: '12px', textAlign: 'center', borderTop: '1px solid #e0e0e0' }}>
                    <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>© 2024 POS System | All Rights Reserved</p>
                </div>
            </div>
        </div>
    );
};

export default Register;