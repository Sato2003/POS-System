import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const UserProfile = ({ user, onLogout }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [message, setMessage] = useState('');
    const [editForm, setEditForm] = useState({
        name: '',
        username: '',
        role: ''
    });
    const [newUserForm, setNewUserForm] = useState({
        name: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'cashier'
    });

    const API_URL = 'http://localhost:5000/api';
    const isAdmin = user?.role === 'admin';

    const fetchUsers = useCallback(async () => {
        try {
            if (isAdmin) {
                const response = await axios.get(`${API_URL}/auth/users`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                setUsers(response.data.data || []);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleAddUser = async () => {
        if (!newUserForm.name || !newUserForm.username || !newUserForm.password) {
            setMessage('❌ Please fill all required fields');
            setTimeout(() => setMessage(''), 2000);
            return;
        }

        if (newUserForm.password !== newUserForm.confirmPassword) {
            setMessage('❌ Passwords do not match');
            setTimeout(() => setMessage(''), 2000);
            return;
        }

        if (newUserForm.password.length < 4) {
            setMessage('❌ Password must be at least 4 characters');
            setTimeout(() => setMessage(''), 2000);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                name: newUserForm.name,
                username: newUserForm.username,
                password: newUserForm.password,
                role: newUserForm.role
            });

            if (response.data.success) {
                setMessage('✅ User added successfully!');
                setTimeout(() => setMessage(''), 2000);
                setShowAddModal(false);
                setNewUserForm({
                    name: '',
                    username: '',
                    password: '',
                    confirmPassword: '',
                    role: 'cashier'
                });
                fetchUsers();
            }
        } catch (error) {
            if (error.response?.data?.error?.includes('duplicate')) {
                setMessage('❌ Username already exists');
            } else {
                setMessage('❌ Error adding user');
            }
            setTimeout(() => setMessage(''), 2000);
        }
    };

    const handleEditUser = (userToEdit) => {
        setEditingUser(userToEdit);
        setEditForm({
            name: userToEdit.name,
            username: userToEdit.username,
            role: userToEdit.role
        });
        setShowEditModal(true);
    };

    const handleUpdateUser = async () => {
        try {
            await axios.put(`${API_URL}/auth/users/${editingUser._id}`, editForm, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            setMessage('✅ User updated successfully!');
            setTimeout(() => setMessage(''), 2000);
            setShowEditModal(false);
            fetchUsers();
        } catch (error) {
            setMessage('❌ Error updating user');
            setTimeout(() => setMessage(''), 2000);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Delete user "${userName}"?`)) {
            try {
                await axios.delete(`${API_URL}/auth/users/${userId}`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                setMessage('✅ User deleted successfully!');
                setTimeout(() => setMessage(''), 2000);
                fetchUsers();
            } catch (error) {
                setMessage('❌ Error deleting user');
                setTimeout(() => setMessage(''), 2000);
            }
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
                    <h1 style={{ margin: 0 }}>User Profile</h1>
                </div>

                {/* Current User Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    padding: '20px',
                    marginBottom: '30px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderLeft: `4px solid ${isAdmin ? '#e74c3c' : '#27ae60'}`
                }}>
                    <h2>Current User</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                        <div><strong>Name:</strong> {user?.name}</div>
                        <div><strong>Username:</strong> {user?.username}</div>
                        <div><strong>Role:</strong> <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: user?.role === 'admin' ? '#e74c3c' : '#27ae60',
                            color: 'white',
                            fontSize: '12px'
                        }}>{user?.role?.toUpperCase()}</span></div>
                        <div><strong>Status:</strong> <span style={{ color: '#27ae60' }}>● Active</span></div>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div style={{
                        padding: '10px',
                        backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
                        color: message.includes('✅') ? '#155724' : '#721c24',
                        borderRadius: '5px',
                        marginBottom: '20px'
                    }}>{message}</div>
                )}

                {/* Users List - Only for Admin */}
                {isAdmin ? (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        padding: '20px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                            <h2 style={{ margin: 0 }}>User Management</h2>
                            <button 
                                onClick={() => setShowAddModal(true)} 
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                Add New User
                            </button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Username</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px' }}>{u.name} {u._id === user?._id && <span style={{ fontSize: '10px', color: '#27ae60' }}>(You)</span>}</td>
                                            <td style={{ padding: '12px' }}>{u.username}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    backgroundColor: u.role === 'admin' ? '#e74c3c' : '#27ae60',
                                                    color: 'white',
                                                    fontSize: '11px'
                                                }}>{u.role?.toUpperCase()}</span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ color: '#27ae60' }}>● Active</span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <button onClick={() => handleEditUser(u)} style={{
                                                    padding: '5px 10px',
                                                    backgroundColor: '#3498db',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    marginRight: '5px'
                                                }}>Edit</button>
                                                {u._id !== user?._id && (
                                                    <button onClick={() => handleDeleteUser(u._id, u.name)} style={{
                                                        padding: '5px 10px',
                                                        backgroundColor: '#dc3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}>Delete</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        padding: '20px',
                        textAlign: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <p style={{ color: '#666' }}>Contact administrator for user management access.</p>
                    </div>
                )}

                {/* ADD USER MODAL */}
                {showAddModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '25px',
                            borderRadius: '10px',
                            maxWidth: '500px',
                            width: '90%'
                        }}>
                            <h2>Add New User</h2>
                            <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Full Name *" 
                                    value={newUserForm.name} 
                                    onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})} 
                                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Username *" 
                                    value={newUserForm.username} 
                                    onChange={(e) => setNewUserForm({...newUserForm, username: e.target.value})} 
                                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                                />
                                <input 
                                    type="password" 
                                    placeholder="Password * (min 4 chars)" 
                                    value={newUserForm.password} 
                                    onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})} 
                                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                                />
                                <input 
                                    type="password" 
                                    placeholder="Confirm Password *" 
                                    value={newUserForm.confirmPassword} 
                                    onChange={(e) => setNewUserForm({...newUserForm, confirmPassword: e.target.value})} 
                                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                                />
                                <select 
                                    value={newUserForm.role} 
                                    onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value})} 
                                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'white' }}
                                >
                                    <option value="cashier">Cashier</option>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button 
                                    onClick={() => setShowAddModal(false)} 
                                    style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAddUser} 
                                    style={{ flex: 1, padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                >
                                    Add User
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* EDIT USER MODAL */}
                {showEditModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '25px',
                            borderRadius: '10px',
                            maxWidth: '500px',
                            width: '90%'
                        }}>
                            <h2>Edit User</h2>
                            <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Full Name" 
                                    value={editForm.name} 
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Username" 
                                    value={editForm.username} 
                                    onChange={(e) => setEditForm({...editForm, username: e.target.value})} 
                                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                                />
                                <select 
                                    value={editForm.role} 
                                    onChange={(e) => setEditForm({...editForm, role: e.target.value})} 
                                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'white' }}
                                >
                                    <option value="cashier">Cashier</option>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button 
                                    onClick={() => setShowEditModal(false)} 
                                    style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleUpdateUser} 
                                    style={{ flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                >
                                    Update User
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;