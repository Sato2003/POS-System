import React, { useState, useEffect } from 'react';
import POSInterface from './components/POSInterface';
import SalesDashboard from './components/SalesDashboard';
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
        // Reset to POS tab on login
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

    // Check if user has admin access
    const isAdmin = user?.role === 'admin';
    const isCashier = user?.role === 'cashier' || user?.role === 'manager';

    if (!isLoggedIn) {
        if (showRegister) {
            return <Register onSwitchToLogin={() => setShowRegister(false)} />;
        }
        return <Login onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />;
    }

    return (
        <div>
            {/* Navigation Bar - Role-based buttons */}
            <div style={{
                backgroundColor: '#2c3e50',
                padding: '10px 15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                '@media (min-width: 600px)': {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }
            }}>
                <div style={{ 
                    display: 'flex', 
                    gap: '10px',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    {/* POS Button - Available to ALL users */}
                    <button
                        onClick={() => setActiveTab('pos')}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: activeTab === 'pos' ? '#3498db' : '#34495e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        🛒 POS System
                    </button>
                    
                    {/* Dashboard Button - ONLY for Admin */}
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: activeTab === 'dashboard' ? '#3498db' : '#34495e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            📊 Sales Dashboard
                        </button>
                    )}
                </div>
                
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    {/* Show role badge */}
                    <span style={{ 
                        color: 'white',
                        backgroundColor: isAdmin ? '#e74c3c' : '#27ae60',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                    }}>
                        {user?.role?.toUpperCase()}
                    </span>
                    <span style={{ color: 'white' }}>👤 {user?.name || user?.username}</span>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '5px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
            
            {/* Content - Role-based access */}
            {activeTab === 'pos' && <POSInterface />}
            {isAdmin && activeTab === 'dashboard' && <SalesDashboard />}
            
            {/* If cashier tries to access dashboard directly, show POS */}
            {!isAdmin && activeTab === 'dashboard' && (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <POSInterface />
                </div>
            )}
        </div>
    );
}

export default App;