import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../config';

const RequestsManager = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const token = localStorage.getItem('token');

    // FIXED: Wrapped fetchRequests with useCallback
    const fetchRequests = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/requests/pending`, {
                headers: { 'x-auth-token': token }
            });
            setRequests(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching requests:', error);
            setLoading(false);
        }
    }, [API_URL, token]);  // Dependencies

    // FIXED: Added fetchRequests to dependency array
    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const approveRequest = async (requestId) => {
        if (window.confirm('Approve this product request?')) {
            try {
                const response = await axios.put(`${API_URL}/requests/approve/${requestId}`, {}, {
                    headers: { 'x-auth-token': token }
                });
                if (response.data.success) {
                    setMessage('Product approved and added to inventory!');
                    fetchRequests();
                    setTimeout(() => setMessage(''), 3000);
                }
            } catch (error) {
                setMessage('Error approving request');
                setTimeout(() => setMessage(''), 3000);
            }
        }
    };

    const rejectRequest = async (requestId) => {
        if (window.confirm('Reject this product request?')) {
            try {
                const response = await axios.put(`${API_URL}/requests/reject/${requestId}`, {}, {
                    headers: { 'x-auth-token': token }
                });
                if (response.data.success) {
                    setMessage('Request rejected');
                    fetchRequests();
                    setTimeout(() => setMessage(''), 3000);
                }
            } catch (error) {
                setMessage('Error rejecting request');
                setTimeout(() => setMessage(''), 3000);
            }
        }
    };

    const viewDetails = (request) => {
        setSelectedRequest(request);
        setShowDetailsModal(true);
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading requests...</div>;
    }

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '20px' }}>Product Requests</h1>
                
                {message && (
                    <div style={{
                        padding: '10px',
                        backgroundColor: message.includes('approved') ? '#d4edda' : '#f8d7da',
                        color: message.includes('approved') ? '#155724' : '#721c24',
                        borderRadius: '5px',
                        marginBottom: '20px'
                    }}>{message}</div>
                )}

                {requests.length === 0 ? (
                    <div style={{ backgroundColor: 'white', padding: '40px', textAlign: 'center', borderRadius: '10px' }}>
                        <p>No pending requests from cashiers.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {requests.map(req => (
                            <div key={req._id} style={{ 
                                backgroundColor: 'white', 
                                borderRadius: '10px', 
                                padding: '20px', 
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                    {/* Product Image */}
                                    <div style={{ flex: '0 0 100px' }}>
                                        {req.imageUrl ? (
                                            <img 
                                                src={req.imageUrl} 
                                                alt={req.name} 
                                                style={{ 
                                                    width: '100px', 
                                                    height: '100px', 
                                                    objectFit: 'cover', 
                                                    borderRadius: '8px',
                                                    border: '1px solid #ddd'
                                                }}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <div style={{ 
                                                width: '100px', 
                                                height: '100px', 
                                                backgroundColor: '#f0f0f0', 
                                                borderRadius: '8px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                fontSize: '40px'
                                            }}>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Product Details */}
                                    <div style={{ flex: 2 }}>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#ff9800' }}>{req.name}</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', fontSize: '13px' }}>
                                            <div><strong>Barcode:</strong> {req.barcode}</div>
                                            <div><strong>Category:</strong> {req.category || 'General'}</div>
                                            <div><strong>Price:</strong> <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>₱{req.sellingPrice}</span></div>
                                            <div><strong>Quantity:</strong> {req.quantity}</div>
                                            <div><strong>Requested by:</strong> {req.requestedByName}</div>
                                            <div><strong>Date:</strong> {new Date(req.createdAt).toLocaleString()}</div>
                                        </div>
                                        {req.costPrice > 0 && (
                                            <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                                                <strong>Cost Price:</strong> ₱{req.costPrice}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button
                                            onClick={() => viewDetails(req)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#17a2b8',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => approveRequest(req._id)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => rejectRequest(req._id)}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* DETAILS MODAL - Keep your existing modal code here */}
                {showDetailsModal && selectedRequest && (
                    // ... your existing modal JSX ...
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
                        {/* Your existing modal content */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestsManager;
