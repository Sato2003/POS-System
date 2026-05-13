import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { printReceipt } from './ReceiptPrinter';
import ImageUpload from './ImageUpload';
import API_URL from '../config';

const Modal = ({ show, onClose, title, children, width = '500px' }) => {
    if (!show) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', maxWidth: width, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>{title}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
                </div>
                {children}
            </div>
        </div>
    );
};
// ==================== CUSTOM HOOKS ====================

const useProducts = () => {
    const [products, setProducts] = useState([]);
    // const API_URL = 'http://localhost:5000/api';

    const loadProducts = async () => {
        try {
            const response = await axios.get(`${API_URL}/products`);
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const addProduct = async (productData) => {
        const response = await axios.post(`${API_URL}/products`, productData);
        await loadProducts();
        return response;
    };

    const updateProduct = async (id, productData) => {
        const response = await axios.put(`${API_URL}/products/${id}`, productData);
        await loadProducts();
        return response;
    };

    const deleteProduct = async (id) => {
        const response = await axios.delete(`${API_URL}/products/${id}`);
        await loadProducts();
        return response;
    };

    const restockProduct = async (id, quantity) => {
        const response = await axios.put(`${API_URL}/products/${id}/stock`, {
            quantity,
            operation: 'set'
        });
        await loadProducts();
        return response;
    };

    useEffect(() => {
        loadProducts();
    }, []);

    return { products, loadProducts, addProduct, updateProduct, deleteProduct, restockProduct };
};

const useCart = () => {
    const [cart, setCart] = useState([]);

    const addToCart = (product, currentStock) => {
        const existing = cart.find(item => item._id === product._id);
        if (existing) {
            if (existing.quantity + 1 > currentStock) {
                alert(`Only ${currentStock} left in stock`);
                return false;
            }
            setCart(cart.map(item =>
                item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        return true;
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

    const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
    const tax = subtotal * 0.12;
    const total = subtotal + tax;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        tax,
        total,
        totalItems
    };
};

const useProductForm = (initialData = null) => {
    const defaultForm = {
        name: '',
        barcode: '',
        category: '',
        sellingPrice: '',
        costPrice: '',
        quantity: '',
        reorderLevel: 10,
        imageUrl: ''
    };

    const [formData, setFormData] = useState(initialData || defaultForm);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormData(initialData || defaultForm);
    };

    const setForm = (data) => {
        setFormData(data);
    };

    const validate = () => {
        if (!formData.name || !formData.sellingPrice) {
            alert('Please fill Product Name and Price');
            return false;
        }
        return true;
    };

    const toApiFormat = () => ({
        name: formData.name,
        barcode: formData.barcode,
        sellingPrice: parseFloat(formData.sellingPrice),
        costPrice: parseFloat(formData.costPrice) || 0,
        quantity: parseInt(formData.quantity) || 0,
        category: formData.category || 'General',
        reorderLevel: parseInt(formData.reorderLevel) || 10,
        imageUrl: formData.imageUrl || ''
    });

    return { formData, updateField, resetForm, setForm, validate, toApiFormat };
};

// ==================== HELPER FUNCTIONS ====================

const formatCurrency = (amount) => {
    return '₱' + (amount || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const formatNumber = (num) => {
    return (num || 0).toLocaleString('en-PH');
};

// ==================== REUSABLE COMPONENTS ====================

const Header = ({ activeTab, setActiveTab, isAdmin, lowStockCount, isRestockMode, setIsRestockMode, setShowLowStockModal }) => (
    <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ padding: '15px 30px' }}>
            <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '28px' }}>POS System</h1>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <TabButton label="Sales" tab="pos" activeTab={activeTab} setActiveTab={setActiveTab} />
                {isAdmin && <TabButton label="Inventory" tab="inventory" activeTab={activeTab} setActiveTab={setActiveTab} />}
                {isAdmin && <TabButton label="Dashboard" tab="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} />}
                
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

                {lowStockCount > 0 && (
                    <button onClick={() => setShowLowStockModal(true)} style={{
                        marginLeft: 'auto',
                        padding: '8px 20px',
                        backgroundColor: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer'
                    }}>Low Stock ({lowStockCount})</button>
                )}
            </div>
        </div>
    </div>
);

const TabButton = ({ label, tab, activeTab, setActiveTab }) => (
    <button 
        onClick={() => setActiveTab(tab)} 
        style={{
            padding: '10px 25px',
            backgroundColor: activeTab === tab ? '#3498db' : '#ecf0f1',
            color: activeTab === tab ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
        }}
    >
        {label}
    </button>
);

const StatCard = ({ title, value, color }) => (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
        <h3>{title}</h3>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: color || '#2c3e50' }}>{value}</div>
    </div>
);

const ProductCard = ({ product, onAddToCart }) => (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', cursor: 'pointer' }}>
        {product.imageUrl && (
            <img 
                src={product.imageUrl} 
                alt={product.name} 
                style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                onError={(e) => { e.target.style.display = 'none'; }} 
            />
        )}
        <div style={{ fontWeight: 'bold' }}>{product.name}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{product.barcode}</div>
        <div style={{ fontSize: '12px' }}>Stock: {formatNumber(product.quantity)}</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2ecc71' }}>{formatCurrency(product.sellingPrice)}</div>
        <button 
            onClick={() => onAddToCart(product)} 
            style={{ marginTop: '10px', width: '100%', padding: '8px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
            Add to Cart
        </button>
    </div>
);

const CartItem = ({ item, onUpdateQuantity, onRemove }) => (
    <div style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{formatCurrency(item.sellingPrice)} each</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <div>
                <button onClick={() => onUpdateQuantity(item._id, -1)} style={{ width: '28px', height: '28px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                <span style={{ margin: '0 10px' }}>{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item._id, 1)} style={{ width: '28px', height: '28px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                <button onClick={() => onRemove(item._id)} style={{ marginLeft: '10px', padding: '4px 8px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Remove</button>
            </div>
            <div style={{ fontWeight: 'bold' }}>{formatCurrency(item.sellingPrice * item.quantity)}</div>
        </div>
    </div>
);

const ProductFormFields = ({ formData, updateField, onImageUpload, onImageRemove, showBarcodeDisabled = false }) => (
    <div style={{ display: 'grid', gap: '15px' }}>
        <input 
            type="text" 
            placeholder="Product Name *" 
            value={formData.name} 
            onChange={(e) => updateField('name', e.target.value)} 
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
        />
        <input 
            type="text" 
            placeholder="Barcode *" 
            value={formData.barcode} 
            onChange={(e) => updateField('barcode', e.target.value)} 
            disabled={showBarcodeDisabled}
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', ...(showBarcodeDisabled && { backgroundColor: '#f5f5f5' }) }} 
        />
        <input 
            type="text" 
            placeholder="Category" 
            value={formData.category} 
            onChange={(e) => updateField('category', e.target.value)} 
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
        />
        <input 
            type="number" 
            placeholder="Price *" 
            value={formData.sellingPrice} 
            onChange={(e) => updateField('sellingPrice', e.target.value)} 
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
        />
        <input 
            type="number" 
            placeholder="Cost Price" 
            value={formData.costPrice} 
            onChange={(e) => updateField('costPrice', e.target.value)} 
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
        />
        <input 
            type="number" 
            placeholder="Stock" 
            value={formData.quantity} 
            onChange={(e) => updateField('quantity', e.target.value)} 
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
        />
        <input 
            type="number" 
            placeholder="Low Stock Threshold" 
            value={formData.reorderLevel} 
            onChange={(e) => updateField('reorderLevel', e.target.value)} 
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }} 
        />
        <ImageUpload 
            onImageUpload={onImageUpload}
            currentImageUrl={formData.imageUrl}
            onRemove={onImageRemove}
        />
        <input 
            type="text" 
            placeholder="Or paste image URL here" 
            value={formData.imageUrl} 
            onChange={(e) => updateField('imageUrl', e.target.value)} 
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', marginTop: '10px' }} 
        />
    </div>
);

// ==================== MAIN COMPONENT ====================

const ModernPOS = () => {
    // State
    const [activeTab, setActiveTab] = useState('pos');
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showLowStockModal, setShowLowStockModal] = useState(false);
    const [showNotFoundModal, setShowNotFoundModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isRestockMode, setIsRestockMode] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [notFoundBarcode, setNotFoundBarcode] = useState('');

    // Custom Hooks
    const { products, loadProducts, addProduct, updateProduct, deleteProduct, restockProduct } = useProducts();
    const { 
        cart, addToCart, updateQuantity, removeFromCart, clearCart,
        subtotal, tax, total, totalItems 
    } = useCart();
    
    const newProductForm = useProductForm();
    const editProductForm = useProductForm();
    const quickProductForm = useProductForm();

    // Derived Data
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = currentUser?.role === 'admin';
    // const API_URL = 'http://localhost:5000/api';
    
    const lowStockProducts = products.filter(p => p.quantity <= (p.reorderLevel || 10));
    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    const totalRevenue = 0;
    const totalSales = 0;
    const inventoryValue = products.reduce((sum, p) => sum + ((p.costPrice || 0) * (p.quantity || 0)), 0);
    
    const categorySummary = products.reduce((acc, p) => {
        const cat = p.category || 'General';
        acc[cat] = (acc[cat] || 0) + ((p.costPrice || 0) * (p.quantity || 0));
        return acc;
    }, {});

    // Group products by category
const groupProductsByCategory = (products) => {
    const grouped = {};
    products.forEach(product => {
        const category = product.category || 'General';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(product);
    });
    return grouped;
};

const groupedProducts = groupProductsByCategory(filteredProducts);
const categories = Object.keys(groupedProducts).sort();
    
    // Handlers
    const handleScan = async (e) => {
        if (e.key === 'Enter' && barcode) {
            const product = products.find(p => p.barcode === barcode);
            
            if (product) {
                if (isRestockMode && isAdmin) {
                    const newQuantity = prompt(`Current stock: ${product.quantity}\nEnter quantity to ADD:`, "10");
                    if (newQuantity && !isNaN(newQuantity) && parseInt(newQuantity) > 0) {
                        try {
                            const newTotal = product.quantity + parseInt(newQuantity);
                            await restockProduct(product._id, newTotal);
                            alert(`Restocked ${newQuantity} units!\nNew stock: ${newTotal}`);
                            setBarcode('');
                        } catch (error) {
                            alert('Restock failed');
                        }
                    } else {
                        setBarcode('');
                    }
                } else {
                    addToCart(product, product.quantity);
                    setBarcode('');
                }
            } else {
                setNotFoundBarcode(barcode);
                quickProductForm.setForm({
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
        if (!quickProductForm.validate()) return;

        try {
            const token = localStorage.getItem('token');
            const productData = quickProductForm.toApiFormat();
            
            if (!isAdmin) {
                await axios.post(`${API_URL}/requests/create`, productData, {
                    headers: { 'x-auth-token': token }
                });
                alert('Request sent to Admin! They will review and add the product.');
            } else {
                await addProduct(productData);
                alert('Product added successfully!');
            }
            
            setShowNotFoundModal(false);
            quickProductForm.resetForm();
            loadProducts();
        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleAddProduct = async () => {
        if (!newProductForm.validate()) return;
        
        try {
            await addProduct(newProductForm.toApiFormat());
            alert('Product added successfully!');
            setShowAddModal(false);
            newProductForm.resetForm();
        } catch (error) {
            alert('Error: ' + (error.response?.data?.error || 'Duplicate barcode?'));
        }
    };

    const handleUpdateProduct = async () => {
        if (!selectedProduct) return;
        
        try {
            await updateProduct(selectedProduct._id, editProductForm.toApiFormat());
            alert('Product updated successfully!');
            setShowEditModal(false);
            setSelectedProduct(null);
            editProductForm.resetForm();
        } catch (error) {
            alert('Error updating product');
        }
    };

    const handleDeleteProduct = async (id, name) => {
        if (window.confirm(`Delete "${name}"?`)) {
            try {
                await deleteProduct(id);
                alert('Product deleted');
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
                printReceipt({
                    invoiceNumber: response.data.invoiceNumber,
                    items: cart.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        unitPrice: item.sellingPrice
                    })),
                    subtotal: subtotal,
                    tax: tax,
                    total: total,
                    customerName: 'Walk-in Customer',
                    cashierName: currentUser?.name || 'Cashier',
                    paymentMethod: 'Cash'
                });

                alert(`Sale Complete!\nInvoice: ${response.data.invoiceNumber}\nTotal: ${formatCurrency(total)}`);
                clearCart();
                loadProducts();
            }
        } catch (error) {
            alert('Checkout failed');
        }
    };

    const handleEditClick = (product) => {
        setSelectedProduct(product);
        editProductForm.setForm({
            name: product.name,
            barcode: product.barcode,
            category: product.category || '',
            sellingPrice: product.sellingPrice,
            costPrice: product.costPrice || '',
            quantity: product.quantity,
            reorderLevel: product.reorderLevel || 10,
            imageUrl: product.imageUrl || ''
        });
        setShowEditModal(true);
    };

    // Chart Data (placeholder)
    const last7Days = ['Apr 29', 'May 1', 'May 2', 'May 3', 'May 4', 'May 5'];
    const salesData = [0, 0, 0, 0, 0, 0];

    // Render Components
    const renderPOSTab = () => (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
    <button 
        onClick={() => setSearch('')} 
        style={{
            padding: '8px 16px',
            backgroundColor: search === '' ? '#3498db' : '#ecf0f1',
            color: search === '' ? 'white' : '#2c3e50',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer'
        }}
    >
        All
    </button>
    {['LOTIONS', 'SOAP', 'SHAMPOO', 'SUNSCREEN', 'DEODORANT', 'CAN FOODS', 'TOOTHPASTE', 'WET WIPES', 'INSECT REPELLENT'].map(cat => (
        <button 
            key={cat}
            onClick={() => setSearch(cat)} 
            style={{
                padding: '8px 16px',
                backgroundColor: search === cat ? '#3498db' : '#ecf0f1',
                color: search === cat ? 'white' : '#2c3e50',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer'
            }}
        >
            {cat}
        </button>
    ))}
</div>
            
            {/* Products Grid */}
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
                {categories.length === 0 ? (
    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No products found</div>
) : (
    categories.map(category => (
        <div key={category} style={{ marginBottom: '30px' }}>
            <div style={{ 
                backgroundColor: '#3498db', 
                color: 'white', 
                padding: '10px 15px', 
                borderRadius: '8px',
                marginBottom: '15px',
                fontSize: '18px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <span>📁</span> {category}
                <span style={{ fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.3)', padding: '2px 8px', borderRadius: '20px' }}>
                    {groupedProducts[category].length} items
                </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                {groupedProducts[category].map(product => (
                    <ProductCard key={product._id} product={product} onAddToCart={(p) => addToCart(p, p.quantity)} />
                ))}
            </div>
        </div>
    ))
)}

            {/* Cart */}
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
                            <CartItem 
                                key={item._id} 
                                item={item} 
                                onUpdateQuantity={updateQuantity} 
                                onRemove={removeFromCart} 
                            />
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
    );

const renderInventoryTab = () => {
    const groupedInventory = groupProductsByCategory(filteredProducts);
    const inventoryCategories = Object.keys(groupedInventory).sort();

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ margin: 0 }}>Inventory Management</h2>
                <button onClick={() => setShowAddModal(true)} style={{ padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>+ Add Product</button>
            </div>
            
            <input type="text" placeholder="Search by name, barcode, or category..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px' }} />
            
            {inventoryCategories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No products found</div>
            ) : (
                inventoryCategories.map(category => (
                    <div key={category} style={{ marginBottom: '30px' }}>
                        <div style={{ backgroundColor: '#27ae60', color: 'white', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>📦</span> {category}
                            <span style={{ fontSize: '12px', backgroundColor: 'rgba(255,255,255,0.3)', padding: '2px 8px', borderRadius: '20px' }}>
                                {groupedInventory[category].length} items
                            </span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>PRODUCT</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>BARCODE</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>PRICE</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>STOCK</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>STATUS</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedInventory[category].map(product => (
                                        <tr key={product._id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {product.imageUrl && <img src={product.imageUrl} alt={product.name} style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} onError={(e) => { e.target.style.display = 'none'; }} />}
                                                    <span>{product.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px' }}>{product.barcode}</td>
                                            <td style={{ padding: '12px' }}>{formatCurrency(product.sellingPrice)}</td>
                                            <td style={{ padding: '12px' }}>{formatNumber(product.quantity)}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', backgroundColor: product.quantity <= (product.reorderLevel || 10) ? '#ff9800' : '#27ae60', color: 'white' }}>
                                                    {product.quantity <= (product.reorderLevel || 10) ? 'Low Stock' : 'In Stock'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <button onClick={() => handleEditClick(product)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', marginRight: '10px' }} title="Edit">✏️</button>
                                                <button onClick={() => handleDeleteProduct(product._id, product.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#e74c3c' }} title="Delete">🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

            const renderDashboardTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <StatCard title="Total Revenue" value={formatCurrency(0)} color="#2ecc71" />
            <StatCard title="Total Sales" value={0} />
            <StatCard title="Products in Stock" value={products.length} />
            <StatCard title="Inventory Value" value={formatCurrency(inventoryValue)} color="#3498db" />
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
                <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                    <span>Total Inventory Value: </span>
                    <span style={{ fontWeight: 'bold', color: '#2ecc71' }}>{formatCurrency(inventoryValue)}</span>
                </div>
            </div>
        </div>
    </div>
);

    const renderLowStockModal = () => (
        <Modal show={showLowStockModal} onClose={() => setShowLowStockModal(false)} title="Low Stock Alert" width="500px">
            <p>{lowStockProducts.length} products need attention</p>
            <div>
                {lowStockProducts.map(p => (
                    <div key={p._id} style={{ padding: '10px', marginBottom: '10px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
                        <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                        <div style={{ fontSize: '12px' }}>Barcode: {p.barcode}</div>
                        <div style={{ color: '#e74c3c' }}>{formatNumber(p.quantity)} units left</div>
                        {isAdmin && (
                            <button 
                                onClick={async () => {
                                    const newQty = prompt(`Current stock: ${p.quantity}\nEnter quantity to ADD:`, "50");
                                    if (newQty && !isNaN(newQty) && parseInt(newQty) > 0) {
                                        try {
                                            const newTotal = p.quantity + parseInt(newQty);
                                            await restockProduct(p._id, newTotal);
                                            alert(`Restocked! New stock: ${newTotal}`);
                                            setShowLowStockModal(false);
                                        } catch (err) {
                                            alert('Restock failed');
                                        }
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
        </Modal>
    );

    const renderNotFoundModal = () => (
        <Modal show={showNotFoundModal} onClose={() => {
            setShowNotFoundModal(false);
            quickProductForm.resetForm();
        }} title="Product Not Found" width="550px">
            <p style={{ marginBottom: '15px' }}>
                Product with barcode <strong>"{notFoundBarcode}"</strong> is not in inventory.
                {!isAdmin && <br />}{!isAdmin && "Would you like to request this product from Admin?"}
            </p>
            <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <h3>{!isAdmin ? "Product Details" : "Add New Product"}</h3>
                <ProductFormFields 
                    formData={quickProductForm.formData}
                    updateField={quickProductForm.updateField}
                    onImageUpload={(imageData) => quickProductForm.updateField('imageUrl', imageData)}
                    onImageRemove={() => quickProductForm.updateField('imageUrl', '')}
                    showBarcodeDisabled={true}
                />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                    onClick={() => {
                        setShowNotFoundModal(false);
                        quickProductForm.resetForm();
                    }} 
                    style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Cancel
                </button>
                <button 
                    onClick={handleQuickAddProduct} 
                    style={{ flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    {!isAdmin ? "Send Request to Admin" : "Add to Inventory"}
                </button>
            </div>
        </Modal>
    );

    const renderAddProductModal = () => (
        <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Product" width="500px">
            <ProductFormFields 
                formData={newProductForm.formData}
                updateField={newProductForm.updateField}
                onImageUpload={(imageData) => newProductForm.updateField('imageUrl', imageData)}
                onImageRemove={() => newProductForm.updateField('imageUrl', '')}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleAddProduct} style={{ flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Add Product</button>
            </div>
        </Modal>
    );

    const renderEditProductModal = () => (
        <Modal show={showEditModal} onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
            editProductForm.resetForm();
        }} title="Edit Product" width="500px">
            <ProductFormFields 
                formData={editProductForm.formData}
                updateField={editProductForm.updateField}
                onImageUpload={(imageData) => editProductForm.updateField('imageUrl', imageData)}
                onImageRemove={() => editProductForm.updateField('imageUrl', '')}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleUpdateProduct} style={{ flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Update Product</button>
            </div>
        </Modal>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
            <Header 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isAdmin={isAdmin}
                lowStockCount={lowStockProducts.length}
                isRestockMode={isRestockMode}
                setIsRestockMode={setIsRestockMode}
                setShowLowStockModal={setShowLowStockModal}
            />

            <div style={{ padding: '20px' }}>
                {activeTab === 'pos' && renderPOSTab()}
                {isAdmin && activeTab === 'inventory' && renderInventoryTab()}
                {isAdmin && activeTab === 'dashboard' && renderDashboardTab()}
            </div>

            {isAdmin && renderAddProductModal()}
            {isAdmin && renderEditProductModal()}
            {renderLowStockModal()}
            {renderNotFoundModal()}
        </div>
    );
};

export default ModernPOS;
