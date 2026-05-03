import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SalesDashboard = () => {
    const [kpi, setKpi] = useState({
        todayRevenue: 0,
        todayTransactions: 0,
        totalProducts: 0,
        lowStockCount: 0,
        inventoryValue: 0
    });
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const API_URL = 'http://localhost:5000/api';

    const formatCurrency = (amount) => {
        const num = Number(amount) || 0;
        return 'PHP' + num.toLocaleString('en-PH', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    };

    const formatNumber = (num) => {
        const number = Number(num) || 0;
        return number.toLocaleString('en-PH');
    };

    useEffect(() => {
        // Get logged in user
        try {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (e) {
            console.error('Error parsing user:', e);
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [kpiRes, lowStockRes, topRes] = await Promise.all([
                axios.get(`${API_URL}/analytics/kpi`),
                axios.get(`${API_URL}/analytics/low-stock`),
                axios.get(`${API_URL}/analytics/top-products`)
            ]);
            
            // Safely set data with fallbacks
            setKpi({
                todayRevenue: kpiRes.data?.data?.todayRevenue || 0,
                todayTransactions: kpiRes.data?.data?.todayTransactions || 0,
                totalProducts: kpiRes.data?.data?.totalProducts || 0,
                lowStockCount: kpiRes.data?.data?.lowStockCount || 0,
                inventoryValue: kpiRes.data?.data?.inventoryValue || 0
            });
            setLowStockProducts(lowStockRes.data?.data || []);
            setTopProducts(topRes.data?.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <div>Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                
                {/* Header with User Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <h1 style={{ margin: 0 }}>📊 Sales Dashboard</h1>
                    {user && (
                        <div style={{ backgroundColor: '#e9ecef', padding: '8px 15px', borderRadius: '20px' }}>
                            👤 {user.name} ({user.role})
                        </div>
                    )}
                </div>
                
                {/* KPI Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    <div style={kpiCardStyle('#27ae60')}>
                        <div style={{ fontSize: '14px', color: '#666' }}>Today's Revenue</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                            {formatCurrency(kpi.todayRevenue)}
                        </div>
                    </div>
                    <div style={kpiCardStyle('#3498db')}>
                        <div style={{ fontSize: '14px', color: '#666' }}>Today's Transactions</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                            {formatNumber(kpi.todayTransactions)}
                        </div>
                    </div>
                    <div style={kpiCardStyle('#9b59b6')}>
                        <div style={{ fontSize: '14px', color: '#666' }}>Total Products</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                            {formatNumber(kpi.totalProducts)}
                        </div>
                    </div>
                    <div style={kpiCardStyle('#e74c3c')}>
                        <div style={{ fontSize: '14px', color: '#666' }}>Low Stock Items</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e74c3c' }}>
                            {formatNumber(kpi.lowStockCount)}
                        </div>
                    </div>
                    <div style={kpiCardStyle('#f39c12')}>
                        <div style={{ fontSize: '14px', color: '#666' }}>Inventory Value</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                            {formatCurrency(kpi.inventoryValue)}
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px'
                }}>
                    
                    {/* Low Stock Alerts */}
                    <div style={cardStyle}>
                        <h2 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>⚠️</span> Low Stock Alerts
                            {lowStockProducts.length > 0 && (
                                <span style={{
                                    backgroundColor: '#e74c3c',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '20px',
                                    fontSize: '12px'
                                }}>
                                    {lowStockProducts.length} items
                                </span>
                            )}
                        </h2>
                        {lowStockProducts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#27ae60' }}>
                                ✅ All products have sufficient stock!
                            </div>
                        ) : (
                            <div>
                                {lowStockProducts.map(product => (
                                    <div key={product._id} style={alertItemStyle}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>Barcode: {product.barcode}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                                                Stock: {formatNumber(product.quantity)}
                                            </div>
                                            <div style={{ fontSize: '12px' }}>
                                                Reorder at: {formatNumber(product.reorderLevel)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top Selling Products */}
                    <div style={cardStyle}>
                        <h2 style={{ marginBottom: '15px' }}>🏆 Top Selling Products (30 days)</h2>
                        {topProducts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                No sales data yet. Make a sale to see data here.
                            </div>
                        ) : (
                            <div>
                                {topProducts.map((product, index) => (
                                    <div key={index} style={topProductStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '24px' }}>
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📦'}
                                            </span>
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>
                                                    {formatNumber(product.totalSold)} units sold
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: 'bold', color: '#27ae60' }}>
                                            {formatCurrency(product.revenue)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const kpiCardStyle = (color) => ({
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: `4px solid ${color}`
});

const cardStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const alertItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    marginBottom: '10px',
    backgroundColor: '#fff3cd',
    borderRadius: '8px',
    borderLeft: '3px solid #ffc107'
};

const topProductStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    marginBottom: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
};

export default SalesDashboard;