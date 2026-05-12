import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { printReceipt } from './ReceiptPrinter';
import ImageUpload from './ImageUpload';

const ModernPOS = () => {
    const [activeTab, setActiveTab] = useState('pos');
    const [cart, setCart] = useState([]);
    const [barcode, setBarcode] = useState('');
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showLowStockModal, setShowLowStockModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        barcode: '',
        category: '',
        sellingPrice: '',
        costPrice: '',
        quantity: '',
        reorderLevel: 10,
        imageUrl: ''
    });
    
    const [isRestockMode, setIsRestockMode] = useState(false);

    const [showNotFoundModal, setShowNotFoundModal] = useState(false);
    const [notFoundBarcode, setNotFoundBarcode] = useState('');
    const [quickProduct, setQuickProduct] = useState({
        name: '',
        barcode: '',
        category: '',
        sellingPrice: '',
        costPrice: '',
        quantity: '',
        reorderLevel: 10,
        imageUrl: ''
    });

    const API_URL = 'http://localhost:5000/api';
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = currentUser?.role === 'admin';

    const formatCurrency = (amount) => {
        return '₱' + (amount || 0).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatNumber = (num) => {
        return (num || 0).toLocaleString('en-PH');
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await axios.get(`${API_URL}/products`);
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item._id === product._id);
        if (existing) {
            if (existing.quantity + 1 > product.quantity) {
                alert(`Only ${product.quantity} left in stock`);
                return;
            }
            setCart(cart.map(item =>
                item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (id, change) => {
        setCart(cart.map(item => {
            if (item._id === id) {
                const newQty = item.quantity + change;
                if (newQty <= 0) return null;
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(Boolean));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item._id !== id));
    };

    const clearCart = () => setCart([]);

    const handleScan = async (e) => {
        if (e.key === 'Enter' && barcode) {
            const product = products.find(p => p.barcode === barcode);
            
            if (product) {
                if (isRestockMode && isAdmin) {
                    const newQuantity = prompt(`Current stock: ${product.quantity}\nEnter quantity to ADD:`, "10");
                    if (newQuantity && !isNaN(newQuantity) && parseInt(newQuantity) > 0) {
                        try {
                            const newTotal = product.quantity + parseInt(newQuantity);
                            await axios.put(`${API_URL}/products/${product._id}/stock`, {
                                quantity: newTotal,
                                operation: 'set'
                            });
                            alert(`Restocked ${newQuantity} units!\nNew stock: ${newTotal}`);
                            loadProducts();
                            setBarcode('');
                        } catch (error) {
                            alert('Restock failed');
                        }
                    } else {
                        setBarcode('');
                    }
                } else {
                    addToCart(product);
                    setBarcode('');
                }
            } else {
                setNotFoundBarcode(barcode);
                setQuickProduct({
                    name: '',
                    barcode: barcode,
                    category: '',
                    sellingPrice: '',
                    costPrice: '',
                    quantity: '1',
                    reorderLevel: 10,
                    imageUrl: ''
                });
                setShowNotFoundModal(true);
                setBarcode('');
            }
        }
    };

    const handleQuickAddProduct = async () => {
    if (!quickProduct.name || !quickProduct.sellingPrice) {
        alert('Please fill Product Name and Price');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        
        if (!isAdmin) {
            // Cashier: Send request to admin (includes image)
            const response = await axios.post(`${API_URL}/requests/create`, {
                name: quickProduct.name,
                barcode: quickProduct.barcode,
                category: quickProduct.category || 'General',
                sellingPrice: parseFloat(quickProduct.sellingPrice),
                costPrice: parseFloat(quickProduct.costPrice) || 0,
                quantity: parseInt(quickProduct.quantity) || 0,
                imageUrl: quickProduct.imageUrl || ''  // ← Image included
            }, {
                headers: { 'x-auth-token': token }
            });

                if (response.data.success) {
                    alert('Request sent to Admin! They will review and add the product.');
                    setShowNotFoundModal(false);
                    setNotFoundBarcode('');
                    setQuickProduct({
                        name: '', barcode: '', category: '', sellingPrice: '', costPrice: '', quantity: '', reorderLevel: 10, imageUrl: ''
                    });
                }
            } else {
                await axios.post(`${API_URL}/products`, {
                name: quickProduct.name,
                barcode: quickProduct.barcode,
                sellingPrice: parseFloat(quickProduct.sellingPrice),
                costPrice: parseFloat(quickProduct.costPrice) || 0,
                quantity: parseInt(quickProduct.quantity) || 0,
                category: quickProduct.category || 'General',
                reorderLevel: parseInt(quickProduct.reorderLevel) || 10,
                imageUrl: quickProduct.imageUrl || ''  // ← Image included
            });

                alert('Product added successfully!');
                setShowNotFoundModal(false);
                setNotFoundBarcode('');
                setQuickProduct({
                    name: '', barcode: '', category: '', sellingPrice: '', costPrice: '', quantity: '', reorderLevel: 10, imageUrl: ''
                });
                loadProducts();
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMsg = error.response?.data?.error || error.message;
            alert('Error: ' + errorMsg);
        }
    };

    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.barcode || !newProduct.sellingPrice) {
            alert('Please fill required fields');
            return;
        }

        try {
            await axios.post(`${API_URL}/products`, {
                name: newProduct.name,
                barcode: newProduct.barcode,
                sellingPrice: parseFloat(newProduct.sellingPrice),
                costPrice: parseFloat(newProduct.costPrice) || 0,
                quantity: parseInt(newProduct.quantity) || 0,
                category: newProduct.category || 'General',
                reorderLevel: parseInt(newProduct.reorderLevel) || 10,
                imageUrl: newProduct.imageUrl || ''
            });

            alert('Product added successfully!');
            setShowAddModal(false);
            setNewProduct({
                name: '',
                barcode: '',
                category: '',
                sellingPrice: '',
                costPrice: '',
                quantity: '',
                reorderLevel: 10,
                imageUrl: ''
            });
            loadProducts();
        } catch (error) {
            alert('Error: ' + (error.response?.data?.error || 'Duplicate barcode?'));
        }
    };

    const handleUpdateProduct = async () => {
        if (!selectedProduct) return;

        try {
            await axios.put(`${API_URL}/products/${selectedProduct._id}`, {
                name: selectedProduct.name,
                barcode: selectedProduct.barcode,
                sellingPrice: parseFloat(selectedProduct.sellingPrice),
                costPrice: parseFloat(selectedProduct.costPrice) || 0,
                quantity: parseInt(selectedProduct.quantity) || 0,
                category: selectedProduct.category || 'General',
                reorderLevel: parseInt(selectedProduct.reorderLevel) || 10,
                imageUrl: selectedProduct.imageUrl || ''
            });

            alert('Product updated successfully!');
            setShowEditModal(false);
            setSelectedProduct(null);
            loadProducts();
        } catch (error) {
            alert('Error updating product');
        }
    };

    const handleDeleteProduct = async (id, name) => {
        if (window.confirm(`Delete "${name}"?`)) {
            try {
                await axios.delete(`${API_URL}/products/${id}`);
                alert('Product deleted');
                loadProducts();
            } catch (error) {
                alert('Error deleting product');
            }
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('Cart is empty');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/pos/checkout`, {
                items: cart.map(item => ({ productId: item._id, quantity: item.quantity })),
                paymentMethod: 'cash',
                customerName: 'Walk-in Customer',
                cashierName: currentUser?.name || 'Cashier'
            });

            if (response.data.success) {
                const subtotalAmount = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
                const taxAmount = subtotalAmount * 0.12;
                const totalAmount = subtotalAmount + taxAmount;

                printReceipt({
                    invoiceNumber: response.data.invoiceNumber,
                    items: cart.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        unitPrice: item.sellingPrice
                    })),
                    subtotal: subtotalAmount,
                    tax: taxAmount,
                    total: totalAmount,
                    customerName: 'Walk-in Customer',
                    cashierName: currentUser?.name || 'Cashier',
                    paymentMethod: 'Cash'
                });

                alert(`Sale Complete!\nInvoice: ${response.data.invoiceNumber}\nTotal: ${formatCurrency(totalAmount)}`);
                setCart([]);
                loadProducts();
            }
        } catch (error) {
            alert('Checkout failed');
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
    const tax = subtotal * 0.12;
    const total = subtotal + tax;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const totalRevenue = 0;
    const totalSales = 0;
    const totalProducts = products.length;
    const inventoryValue = products.reduce((sum, p) => sum + ((p.costPrice || 0) * (p.quantity || 0)), 0);
    const lowStockProducts = products.filter(p => p.quantity <= (p.reorderLevel || 10));

    const last7Days = ['Apr 29', 'May 1', 'May 2', 'May 3', 'May 4', 'May 5'];
    const salesData = [0, 0, 0, 0, 0, 0];

    const categorySummary = products.reduce((acc, p) => {
        const cat = p.category || 'General';
        acc[cat] = (acc[cat] || 0) + ((p.costPrice || 0) * (p.quantity || 0));
        return acc;
    }, {});

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
            {/* Header */}
            <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ padding: '15px 30px' }}>
                    <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '28px' }}>POS System</h1>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => setActiveTab('pos')} style={{
                            padding: '10px 25px',
                            backgroundColor: activeTab === 'pos' ? '#3498db' : '#ecf0f1',
                            color: activeTab === 'pos' ? 'white' : '#2c3e50',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}>Sales</button>

                        {isAdmin && (
                            <button onClick={() => setActiveTab('inventory')} style={{
                                padding: '10px 25px',
                                backgroundColor: activeTab === 'inventory' ? '#3498db' : '#ecf0f1',
                                color: activeTab === 'inventory' ? 'white' : '#2c3e50',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}>Inventory</button>
                        )}

                        {isAdmin && (
                            <button onClick={() => setActiveTab('dashboard')} style={{
                                padding: '10px 25px',
                                backgroundColor: activeTab === 'dashboard' ? '#3498db' : '#ecf0f1',
                                color: activeTab === 'dashboard' ? 'white' : '#2c3e50',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}>Dashboard</button>
                        )}

                        {isAdmin && (
                            <button 
                                onClick={() => setIsRestockMode(!isRestockMode)} 
                                style={{
                                    marginLeft: 'auto',
                                    padding: '8px 20px',
                                    backgroundColor: isRestockMode ? '#28a745' : '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {isRestockMode ? 'Restock Mode ON' : 'Restock Mode OFF'}
                            </button>
                        )}

                        {lowStockProducts.length > 0 && (
                            <button onClick={() => setShowLowStockModal(true)} style={{
                                marginLeft: 'auto',
                                padding: '8px 20px',
                                backgroundColor: '#ff9800',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer'
                            }}>Low Stock ({lowStockProducts.length})</button>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ padding: '20px' }}>
                {/* POS TAB */}
                {activeTab === 'pos' && (
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        
                        {/* LEFT PANEL - Products Grid */}
                        <div style={{ flex: 2, backgroundColor: 'white', borderRadius: '10px', padding: '20px' }}>
                            <h2>Products</h2>
                            <div style={{ marginBottom: '20px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Search products..." 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)} 
                                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px' }} 
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                                {filteredProducts.map(product => (
                                    <div key={product._id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', cursor: 'pointer' }}>
                                        {product.imageUrl && (
                                            <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                                                onError={(e) => { e.target.style.display = 'none'; }} />
                                        )}
                                        <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>{product.barcode}</div>
                                        <div style={{ fontSize: '12px' }}>Stock: {formatNumber(product.quantity)}</div>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2ecc71' }}>{formatCurrency(product.sellingPrice)}</div>
                                        <button onClick={() => addToCart(product)} style={{ marginTop: '10px', width: '100%', padding: '8px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Add to Cart</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT PANEL - Cart with Barcode Input */}
                        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '10px', padding: '20px' }}>
                            <h2>Current Sale</h2>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Scan or enter barcode..." 
                                    value={barcode} 
                                    onChange={(e) => setBarcode(e.target.value)} 
                                    onKeyPress={handleScan} 
                                    style={{ width: '100%', padding: '12px', border: '2px solid #007bff', borderRadius: '5px' }} 
                                    autoFocus
                                />
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                    Scan barcode and press Enter to add to cart
                                </div>
                            </div>
                            
                            {cart.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Cart is empty</div>
                            ) : (
                                <>
                                    {cart.map(item => (
                                        <div key={item._id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                                            <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>{formatCurrency(item.sellingPrice)} each</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                                <div>
                                                    <button onClick={() => updateQuantity(item._id, -1)} style={{ width: '28px', height: '28px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                                                    <span style={{ margin: '0 10px' }}>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item._id, 1)} style={{ width: '28px', height: '28px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                                                    <button onClick={() => removeFromCart(item._id)} style={{ marginLeft: '10px', padding: '4px 8px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
                                                </div>
                                                <div style={{ fontWeight: 'bold' }}>{formatCurrency(item.sellingPrice * item.quantity)}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ borderTop: '2px solid #ddd', paddingTop: '15px' }}>
                                        <div>Total Items: {totalItems}</div>
                                        <div>Subtotal: {formatCurrency(subtotal)}</div>
                                        <div>VAT (12%): {formatCurrency(tax)}</div>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2ecc71' }}>Total: {formatCurrency(total)}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                        <button onClick={clearCart} style={{ flex: 1, padding: '12px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Clear Cart</button>
                                        <button onClick={handleCheckout} style={{ flex: 2, padding: '12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Complete Sale</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* INVENTORY TAB */}
                {isAdmin && activeTab === 'inventory' && (
                    <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>Inventory Management</h2>
                            <button onClick={() => setShowAddModal(true)} style={{ padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>+ Add Product</button>
                        </div>
                        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px' }} />
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                                        <th style={{ padding: '12px' }}>PRODUCT</th>
                                        <th style={{ padding: '12px' }}>BARCODE</th>
                                        <th style={{ padding: '12px' }}>CATEGORY</th>
                                        <th style={{ padding: '12px' }}>PRICE</th>
                                        <th style={{ padding: '12px' }}>STOCK</th>
                                        <th style={{ padding: '12px' }}>STATUS</th>
                                        <th style={{ padding: '12px' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(product => (
                                        <tr key={product._id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px' }}>{product.name}</td>
                                            <td style={{ padding: '12px' }}>{product.barcode}</td>
                                            <td style={{ padding: '12px' }}>{product.category || 'General'}</td>
                                            <td style={{ padding: '12px' }}>{formatCurrency(product.sellingPrice)}</td>
                                            <td style={{ padding: '12px' }}>{formatNumber(product.quantity)}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', backgroundColor: product.quantity <= (product.reorderLevel || 10) ? '#ff9800' : '#27ae60', color: 'white' }}>
                                                    {product.quantity <= (product.reorderLevel || 10) ? 'Low Stock' : 'In Stock'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <button onClick={() => { setSelectedProduct(product); setShowEditModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>add</button>
                                                <button onClick={() => handleDeleteProduct(product._id, product.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#e74c3c' }}>delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* DASHBOARD TAB */}
                {isAdmin && activeTab === 'dashboard' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                                <h3>Total Revenue</h3>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2ecc71' }}>{formatCurrency(totalRevenue)}</div>
                            </div>
                            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                                <h3>Total Sales</h3>
                                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalSales}</div>
                            </div>
                            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                                <h3>Products in Stock</h3>
                                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalProducts}</div>
                            </div>
                            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                                <h3>Inventory Value</h3>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3498db' }}>{formatCurrency(inventoryValue)}</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                                <h3>Sales Trend (Last 7 Days)</h3>
                                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                                    {salesData.map((value, i) => (
                                        <div key={i} style={{ textAlign: 'center', width: '50px' }}>
                                            <div style={{ height: `${Math.max(5, value)}px`, backgroundColor: '#3498db', borderRadius: '4px', marginBottom: '5px' }}></div>
                                            <div style={{ fontSize: '11px' }}>{last7Days[i]}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
                                <h3>Products by Category</h3>
                                <div>
                                    {Object.entries(categorySummary).sort((a, b) => a[0].localeCompare(b[0])).map(([cat, val]) => (
                                        <div key={cat} style={{ marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>{cat}</span>
                                                <span style={{ fontWeight: 'bold' }}>{formatCurrency(val)}</span>
                                            </div>
                                            <div style={{ width: '100%', backgroundColor: '#ecf0f1', borderRadius: '4px', height: '8px', marginTop: '4px' }}>
                                                <div style={{ width: `${Math.min(100, (val / inventoryValue) * 100)}%`, height: '8px', backgroundColor: '#3498db', borderRadius: '4px' }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                                    <span>Total Inventory Value: </span>
                                    <span style={{ fontWeight: 'bold', color: '#2ecc71' }}>{formatCurrency(inventoryValue)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ADD PRODUCT MODAL */}
                {isAdmin && showAddModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', maxWidth: '500px', width: '90%' }}>
                            <h2>Add New Product</h2>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <input type="text" placeholder="Product Name *" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="text" placeholder="Barcode *" value={newProduct.barcode} onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="text" placeholder="Category" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="number" placeholder="Price *" value={newProduct.sellingPrice} onChange={(e) => setNewProduct({...newProduct, sellingPrice: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="number" placeholder="Stock" value={newProduct.quantity} onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="number" placeholder="Low Stock Threshold" value={newProduct.reorderLevel} onChange={(e) => setNewProduct({...newProduct, reorderLevel: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <ImageUpload 
                                    onImageUpload={(imageData) => {
                                        setNewProduct({...newProduct, imageUrl: imageData});
                                    }}
                                    currentImageUrl={newProduct.imageUrl}
                                    onRemove={() => setNewProduct({...newProduct, imageUrl: ''})}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Or paste image URL here" 
                                    value={newProduct.imageUrl} 
                                    onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})} 
                                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', marginTop: '10px' }} 
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleAddProduct} style={{ flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Add Product</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* EDIT PRODUCT MODAL */}
                {isAdmin && showEditModal && selectedProduct && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', maxWidth: '500px', width: '90%' }}>
                            <h2>Edit Product</h2>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <input type="text" placeholder="Product Name *" value={selectedProduct.name} onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="text" placeholder="Barcode *" value={selectedProduct.barcode} onChange={(e) => setSelectedProduct({...selectedProduct, barcode: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="text" placeholder="Category" value={selectedProduct.category || ''} onChange={(e) => setSelectedProduct({...selectedProduct, category: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="number" placeholder="Price *" value={selectedProduct.sellingPrice} onChange={(e) => setSelectedProduct({...selectedProduct, sellingPrice: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="number" placeholder="Stock" value={selectedProduct.quantity} onChange={(e) => setSelectedProduct({...selectedProduct, quantity: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <input type="number" placeholder="Low Stock Threshold" value={selectedProduct.reorderLevel || 10} onChange={(e) => setSelectedProduct({...selectedProduct, reorderLevel: e.target.value})} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} />
                                <ImageUpload 
                                    onImageUpload={(imageData) => {
                                        setSelectedProduct({...selectedProduct, imageUrl: imageData});
                                    }}
                                    currentImageUrl={selectedProduct?.imageUrl || ''}
                                    onRemove={() => setSelectedProduct({...selectedProduct, imageUrl: ''})}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Or paste image URL here" 
                                    value={selectedProduct?.imageUrl || ''} 
                                    onChange={(e) => setSelectedProduct({...selectedProduct, imageUrl: e.target.value})} 
                                    style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', marginTop: '10px' }} 
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleUpdateProduct} style={{ flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Update Product</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* LOW STOCK ALERT MODAL */}
                {showLowStockModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', maxWidth: '500px', width: '90%' }}>
                            <h2>Low Stock Alert</h2>
                            <p>{lowStockProducts.length} products need attention</p>
                            <div>
                                {lowStockProducts.map(p => (
                                    <div key={p._id} style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                        <div style={{ fontSize: '12px' }}>Barcode: {p.barcode}</div>
                                        <div style={{ color: '#e74c3c' }}>{formatNumber(p.quantity)} units left</div>
                                        {isAdmin && (
                                            <button 
                                                onClick={() => {
                                                    const newQty = prompt(`Current stock: ${p.quantity}\nEnter quantity to ADD:`, "50");
                                                    if (newQty && !isNaN(newQty) && parseInt(newQty) > 0) {
                                                        const newTotal = p.quantity + parseInt(newQty);
                                                        axios.put(`${API_URL}/products/${p._id}/stock`, { quantity: newTotal })
                                                            .then(() => {
                                                                alert(`Restocked! New stock: ${newTotal}`);
                                                                loadProducts();
                                                                setShowLowStockModal(false);
                                                            })
                                                            .catch(err => alert('Restock failed'));
                                                    }
                                                }}
                                                style={{
                                                    marginTop: '8px',
                                                    padding: '5px 10px',
                                                    backgroundColor: '#17a2b8',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '5px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Quick Restock
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setShowLowStockModal(false)} style={{ width: '100%', padding: '10px', marginTop: '15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Close</button>
                        </div>
                    </div>
                )}

                {/* PRODUCT NOT FOUND MODAL */}
{showNotFoundModal && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }}>
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', maxWidth: '550px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            {!isAdmin ? (
                // Cashier View - Request to Admin
                <>
                    <h2 style={{ color: '#ff9800', marginBottom: '10px' }}>Product Not Found</h2>
                    <p style={{ marginBottom: '15px' }}>
                        Product with barcode <strong>"{notFoundBarcode}"</strong> is not in inventory.
                        <br />Would you like to request this product from Admin?
                    </p>
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <h3>Product Details</h3>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            <input 
                                type="text" 
                                placeholder="Product Name *" 
                                value={quickProduct.name} 
                                onChange={(e) => setQuickProduct({...quickProduct, name: e.target.value})} 
                                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                                autoFocus
                            />
                            <input 
                                type="text" 
                                placeholder="Barcode" 
                                value={quickProduct.barcode} 
                                disabled 
                                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f5f5f5' }} 
                            />
                            <input 
                                type="text" 
                                placeholder="Category" 
                                value={quickProduct.category} 
                                onChange={(e) => setQuickProduct({...quickProduct, category: e.target.value})} 
                                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                            />
                            <input 
                                type="number" 
                                placeholder="Estimated Price *" 
                                value={quickProduct.sellingPrice} 
                                onChange={(e) => setQuickProduct({...quickProduct, sellingPrice: e.target.value})} 
                                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                            />
                            <input 
                                type="number" 
                                placeholder="Quantity" 
                                value={quickProduct.quantity} 
                                onChange={(e) => setQuickProduct({...quickProduct, quantity: e.target.value})} 
                                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                            />
                            
                            {/* DRAG & DROP IMAGE UPLOAD FOR CASHIER */}
                            <div style={{ marginTop: '5px' }}>
                                <ImageUpload 
                                    onImageUpload={(imageData) => {
                                        setQuickProduct({...quickProduct, imageUrl: imageData});
                                    }}
                                    currentImageUrl={quickProduct.imageUrl}
                                    onRemove={() => setQuickProduct({...quickProduct, imageUrl: ''})}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Or paste image URL here" 
                                    value={quickProduct.imageUrl} 
                                    onChange={(e) => setQuickProduct({...quickProduct, imageUrl: e.target.value})} 
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', marginTop: '10px' }} 
                                />
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button 
                            onClick={() => { 
                                setShowNotFoundModal(false);
                                setNotFoundBarcode('');
                                setQuickProduct({
                                    name: '', barcode: '', category: '', sellingPrice: '', costPrice: '', quantity: '', reorderLevel: 10, imageUrl: ''
                                });
                            }} 
                            style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleQuickAddProduct} 
                            style={{ flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        >
                            Send Request to Admin
                        </button>
                    </div>
                </>
            ) : (
                // Admin View - Add Directly
                <>
                    <h2 style={{ color: '#ff9800', marginBottom: '10px' }}>Product Not Found</h2>
                    <p style={{ marginBottom: '15px' }}>
                        Barcode <strong>"{notFoundBarcode}"</strong> was not found. Add to inventory?
                    </p>
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <h3>Add New Product</h3>
                        <div style={{ display: 'grid', gap: '10px' }}>
                            <input 
                                type="text" 
                                placeholder="Product Name *" 
                                value={quickProduct.name} 
                                onChange={(e) => setQuickProduct({...quickProduct, name: e.target.value})} 
                                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                                autoFocus
                            />
                            <input 
                                type="text" 
                                placeholder="Barcode" 
                                value={quickProduct.barcode} 
                                disabled 
                                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f5f5f5' }} 
                            />
                            <input 
                                type="text" 
                                placeholder="Category" 
                                value={quickProduct.category} 
                                onChange={(e) => setQuickProduct({...quickProduct, category: e.target.value})} 
                                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                            />
                            <input 
                                type="number" 
                                placeholder="Price *" 
                                value={quickProduct.sellingPrice} 
                                onChange={(e) => setQuickProduct({...quickProduct, sellingPrice: e.target.value})} 
                                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                            />
                            <input 
                                type="number" 
                                placeholder="Stock" 
                                value={quickProduct.quantity} 
                                onChange={(e) => setQuickProduct({...quickProduct, quantity: e.target.value})} 
                                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
                            />
                            
                            {/* DRAG & DROP IMAGE UPLOAD FOR ADMIN */}
                            <div style={{ marginTop: '5px' }}>
                                <ImageUpload 
                                    onImageUpload={(imageData) => {
                                        setQuickProduct({...quickProduct, imageUrl: imageData});
                                    }}
                                    currentImageUrl={quickProduct.imageUrl}
                                    onRemove={() => setQuickProduct({...quickProduct, imageUrl: ''})}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Or paste image URL here" 
                                    value={quickProduct.imageUrl} 
                                    onChange={(e) => setQuickProduct({...quickProduct, imageUrl: e.target.value})} 
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', marginTop: '10px' }} 
                                />
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button 
                            onClick={() => { 
                                setShowNotFoundModal(false);
                                setNotFoundBarcode('');
                                setQuickProduct({
                                    name: '', barcode: '', category: '', sellingPrice: '', costPrice: '', quantity: '', reorderLevel: 10, imageUrl: ''
                                });
                            }} 
                            style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleQuickAddProduct} 
                            style={{ flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        >
                            Add to Inventory
                        </button>
                    </div>
                </>
            )}
        </div>
    </div>
)}
            </div>
        </div>
    );
};

export default ModernPOS;