import React, { useState, useEffect } from 'react';
import ModernPOS from './components/ModernPOS';
import SalesDashboard from './components/SalesDashboard';
import UserProfile from './components/UserProfile';
import RequestsManager from './components/RequestsManager';
import Login from './components/Login';
import Register from './components/Register';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('pos');
    const [showRegister, setShowRegister] = useState(false);
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setIsLoggedIn(true);
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const handleLogin = (userData) => {
        setIsLoggedIn(true);
        setUser(userData);
        setShowRegister(false);
        setActiveTab('pos');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('savedCart');
        setIsLoggedIn(false);
        setUser(null);
        setActiveTab('pos');
    };

    const isAdmin = user?.role === 'admin';

    if (!isLoggedIn) {
        if (showRegister) {
            return <Register onSwitchToLogin={() => setShowRegister(false)} />;
        }
        return <Login onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />;
    }

    return (
        <div>
            {/* Navigation Bar */}
            <div style={{
                backgroundColor: '#2c3e50',
                padding: '10px 15px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveTab('pos')} style={{
                        padding: '8px 16px',
                        backgroundColor: activeTab === 'pos' ? '#3498db' : '#34495e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}>POS</button>
                    
                    
                    <button onClick={() => setActiveTab('profile')} style={{
                        padding: '8px 16px',
                        backgroundColor: activeTab === 'profile' ? '#3498db' : '#34495e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}>Profile</button>
                    
                    {isAdmin && (
                        <button onClick={() => setActiveTab('requests')} style={{
                            padding: '8px 16px',
                            backgroundColor: activeTab === 'requests' ? '#3498db' : '#34495e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}>Requests</button>
                    )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'white', fontSize: '13px' }}>
                        {user?.name} ({user?.role})
                    </span>
                    <button onClick={handleLogout} style={{
                        padding: '5px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}>Logout</button>
                </div>
            </div>
            
            {/* Content */}
            {activeTab === 'pos' && <ModernPOS />}
            {activeTab === 'dashboard' && isAdmin && <SalesDashboard />}
            {activeTab === 'profile' && <UserProfile user={user} onLogout={handleLogout} />}
            {activeTab === 'requests' && isAdmin && <RequestsManager />}
        </div>
    );
}

export default App;