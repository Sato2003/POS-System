import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { printReceipt } from './ReceiptPrinter';
import ImageUpload from './ImageUpload';

const POSInterface = () => {
    const [cart, setCart] = useState([]);
    const [barcode, setBarcode] = useState('');
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState('');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        barcode: '',
        sellingPrice: '',
        costPrice: '',
        quantity: '',
        category: '',
        imageUrl: ''
    });
    const [quickQty, setQuickQty] = useState({});

    const API_URL = 'http://localhost:5000/api';

    // Get current user role
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = currentUser?.role === 'admin';
    const isCashier = currentUser?.role === 'cashier';

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

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem('savedCart', JSON.stringify(cart));
        }
    }, [cart]);

    // Load cart from localStorage when component mounts
    useEffect(() => {
        const savedCart = localStorage.getItem('savedCart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                if (parsedCart.length > 0) {
                    setCart(parsedCart);
                }
            } catch (e) {
                console.error('Error loading saved cart:', e);
            }
        }
    }, []);

    const loadProducts = async () => {
        try {
            const response = await axios.get(`${API_URL}/products`);
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const addManualProduct = async () => {
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
                imageUrl: newProduct.imageUrl || ''
            });
            
            alert('✅ Product added successfully!');
            setNewProduct({ name: '', barcode: '', sellingPrice: '', costPrice: '', quantity: '', category: '', imageUrl: '' });
            setShowForm(false);
            loadProducts();
        } catch (error) {
            alert('❌ Error: ' + (error.response?.data?.error || 'Check if barcode is unique'));
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name,
            barcode: product.barcode,
            sellingPrice: product.sellingPrice,
            costPrice: product.costPrice,
            quantity: product.quantity,
            category: product.category || 'General',
            imageUrl: product.imageUrl || ''
        });
    };

    const handleUpdateProduct = async () => {
        if (!newProduct.name || !newProduct.barcode || !newProduct.sellingPrice) {
            alert('Please fill required fields');
            return;
        }

        try {
            await axios.put(`${API_URL}/products/${editingProduct._id}`, {
                name: newProduct.name,
                barcode: newProduct.barcode,
                sellingPrice: parseFloat(newProduct.sellingPrice),
                costPrice: parseFloat(newProduct.costPrice) || 0,
                quantity: parseInt(newProduct.quantity) || 0,
                category: newProduct.category || 'General',
                imageUrl: newProduct.imageUrl || ''
            });
            
            alert('✅ Product updated successfully!');
            setEditingProduct(null);
            setNewProduct({ name: '', barcode: '', sellingPrice: '', costPrice: '', quantity: '', category: '', imageUrl: '' });
            loadProducts();
        } catch (error) {
            alert('❌ Error updating product');
        }
    };

    const handleDeleteProduct = async (productId, productName) => {
        if (window.confirm(`Delete "${productName}"?`)) {
            try {
                await axios.delete(`${API_URL}/products/${productId}`);
                alert('✅ Product deleted');
                loadProducts();
            } catch (error) {
                alert('❌ Error deleting product');
            }
        }
    };

    const cancelEdit = () => {
        setEditingProduct(null);
        setNewProduct({ name: '', barcode: '', sellingPrice: '', costPrice: '', quantity: '', category: '', imageUrl: '' });
        setShowForm(false);
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item._id === product._id);
        
        if (existingItem) {
            setCart(cart.map(item =>
                item._id === product._id 
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item
            ));
        } else {
            const newItem = {
                _id: product._id,
                name: product.name,
                barcode: product.barcode,
                sellingPrice: product.sellingPrice,
                quantity: 1,
                imageUrl: product.imageUrl || '',
                category: product.category || ''
            };
            setCart([...cart, newItem]);
        }
        
        setMessage(`✅ Added: ${product.name}`);
        setTimeout(() => setMessage(''), 1500);
    };

    const handleScan = (e) => {
        if (e.key === 'Enter' && barcode) {
            const product = products.find(p => p.barcode === barcode);
            if (product) {
                addToCart(product);
                setBarcode('');
            } else {
                alert('❌ Product not found!');
                setBarcode('');
            }
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

    const removeItem = (id) => {
        setCart(cart.filter(item => item._id !== id));
    };

    const clearCart = () => setCart([]);

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
                cashierName: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Cashier'
            });

            if (response.data.success) {
                const subtotalAmount = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
                const taxAmount = subtotalAmount * 0.12;
                const totalAmount = subtotalAmount + taxAmount;
                
                const receiptData = {
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
                    cashierName: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Cashier',
                    paymentMethod: 'Cash'
                };
                
                printReceipt(receiptData);
                
                alert(`✅ Sale Complete! Invoice: ${response.data.invoiceNumber}`);
                setCart([]);
                loadProducts();
            }
        } catch (error) {
            alert('❌ Checkout failed');
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
    const tax = subtotal * 0.12;
    const total = subtotal + tax;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(search.toLowerCase())
    );

    const qtyButtonStyle = {
        width: '30px',
        height: '30px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px'
    };
    
    const removeButtonStyle = {
        padding: '5px 10px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
    };

    const addButtonStyle = {
        padding: '6px 10px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '12px'
    };

    const editButtonStyle = {
        padding: '6px 10px',
        backgroundColor: '#ffc107',
        color: '#333',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '12px'
    };

    const deleteButtonStyle = {
        padding: '6px 10px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '12px'
    };

    return (
        <div style={{ minHeight: '100vh', padding: '10px', backgroundColor: '#f0f2f5' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '10px' }}>
                
                {/* Responsive Two Columns */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* LEFT PANEL */}
                    <div style={{ 
                        flex: 1, 
                        backgroundColor: 'white', 
                        borderRadius: '10px', 
                        padding: '15px', 
                        overflow: 'auto',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h2>🛒 CURRENT ORDER</h2>
                        
                        <input
                            type="text"
                            placeholder="Scan or type barcode, press Enter"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            onKeyPress={handleScan}
                            style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '2px solid #007bff', borderRadius: '5px', fontSize: '16px' }}
                            autoFocus
                        />
                        
                        {message && <div style={{ padding: '10px', backgroundColor: '#d4edda', borderRadius: '5px', marginBottom: '10px' }}>{message}</div>}
                        
                        {cart.map(item => (
                            <div key={item._id} style={{ borderBottom: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                    
                                    {/* Image and Info */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 2 }}>
                                        {item.imageUrl && item.imageUrl !== '' ? (
                                            <img 
                                                src={item.imageUrl} 
                                                alt={item.name} 
                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '5px' }}
                                                onError={(e) => {
                                                    console.log('Image error for:', item.name);
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div style={{ 
                                                width: '40px', 
                                                height: '40px', 
                                                backgroundColor: '#f0f0f0', 
                                                borderRadius: '5px', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                fontSize: '20px'
                                            }}>
                                                🛒
                                            </div>
                                        )}
                                        <div>
                                            <div><strong>{item.name}</strong></div>
                                            <div style={{ fontSize: '11px', color: '#666' }}>{item.barcode}</div>
                                            <div style={{ fontSize: '12px' }}>{formatCurrency(item.sellingPrice)} each</div>
                                        </div>
                                    </div>
                                    
                                    {/* Quantity Controls */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <button onClick={() => updateQuantity(item._id, -1)} style={qtyButtonStyle}>-</button>
                                            <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item._id, 1)} style={qtyButtonStyle}>+</button>
                                        </div>
                                        <div style={{ fontWeight: 'bold', minWidth: '80px', textAlign: 'right' }}>
                                            {formatCurrency(item.sellingPrice * item.quantity)}
                                        </div>
                                        <button onClick={() => removeItem(item._id)} style={removeButtonStyle}>✕</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {cart.length > 0 && (
                            <div style={{ marginTop: '20px', textAlign: 'right', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
                                <div>Total Items: {formatNumber(totalItems)}</div>
                                <div>Subtotal: {formatCurrency(subtotal)}</div>
                                <div>VAT (12%): {formatCurrency(tax)}</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>Total: {formatCurrency(total)}</div>
                                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                    <button onClick={clearCart} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Clear</button>
                                    <button onClick={handleCheckout} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Checkout</button>
                                </div>
                            </div>
                        )}
                        
                        {/* Admin-only: Add Product Section */}
                        {isAdmin && (
                            <>
                                <hr style={{ margin: '20px 0' }} />
                                
                                <button 
                                    onClick={() => {
                                        setShowForm(!showForm);
                                        setEditingProduct(null);
                                        setNewProduct({ name: '', barcode: '', sellingPrice: '', costPrice: '', quantity: '', category: '', imageUrl: '' });
                                    }}
                                    style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                                >
                                    {showForm ? '− CANCEL' : '+ ADD NEW PRODUCT'}
                                </button>
                                
                                {(showForm || editingProduct) && (
                                    <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', border: '1px solid #ddd' }}>
                                        <h3>{editingProduct ? '✏️ EDIT PRODUCT' : '➕ ADD NEW PRODUCT'}</h3>
                                        <input type="text" placeholder="Product Name *" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                        <input type="text" placeholder="Barcode *" value={newProduct.barcode} onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                        <input type="number" placeholder="Selling Price *" value={newProduct.sellingPrice} onChange={(e) => setNewProduct({...newProduct, sellingPrice: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                        <input type="number" placeholder="Cost Price" value={newProduct.costPrice} onChange={(e) => setNewProduct({...newProduct, costPrice: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                        <input type="number" placeholder="Quantity" value={newProduct.quantity} onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                        <input type="text" placeholder="Category" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                        
                                        <ImageUpload 
                                            onImageUpload={(imageData) => {
                                                setNewProduct({...newProduct, imageUrl: imageData});
                                            }}
                                            currentImageUrl={newProduct.imageUrl}
                                            onRemove={() => setNewProduct({...newProduct, imageUrl: ''})}
                                        />
                                        
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                            {editingProduct ? (
                                                <>
                                                    <button onClick={handleUpdateProduct} style={{ flex: 1, padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>UPDATE</button>
                                                    <button onClick={cancelEdit} style={{ flex: 1, padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>CANCEL</button>
                                                </>
                                            ) : (
                                                <button onClick={addManualProduct} style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>SAVE</button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    
                    {/* RIGHT PANEL - Products */}
                    <div style={{ 
                        flex: 1, 
                        backgroundColor: 'white', 
                        borderRadius: '10px', 
                        padding: '15px', 
                        overflow: 'auto',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h2>📦 PRODUCTS</h2>
                        <input 
                            type="text" 
                            placeholder="🔍 Search by name or barcode..." 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                            style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }} 
                        />
                        
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '10px'
                        }}>
                            {filteredProducts.map(p => (
                                <div key={p._id} style={{ 
                                    border: '1px solid #ddd', 
                                    borderRadius: '8px', 
                                    padding: '10px',
                                    transition: 'transform 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
                                        {p.imageUrl && p.imageUrl !== '' ? (
                                            <img src={p.imageUrl} alt={p.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                                        ) : (
                                            <div style={{ width: '60px', height: '60px', backgroundColor: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>📦</div>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.name}</div>
                                            <div style={{ fontSize: '11px', color: '#666' }}>Barcode: {p.barcode}</div>
                                            <div style={{ marginTop: '5px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#007bff' }}>{formatCurrency(p.sellingPrice)}</span>
                                                <span style={{ marginLeft: '8px', fontSize: '11px', color: p.quantity < 10 ? '#dc3545' : '#28a745' }}>Stock: {formatNumber(p.quantity)}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                            {/* Add to Cart - Available to ALL users */}
                                            <button onClick={() => addToCart(p)} style={addButtonStyle}>🛒</button>
                                            
                                            {/* Admin-only buttons */}
                                            {isAdmin && (
                                                <>
                                                    <button onClick={() => handleEditProduct(p)} style={editButtonStyle}>✏️</button>
                                                    <button onClick={() => handleDeleteProduct(p._id, p.name)} style={deleteButtonStyle}>🗑️</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {filteredProducts.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                No products found. Click "+ ADD NEW PRODUCT" to add one.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POSInterface;