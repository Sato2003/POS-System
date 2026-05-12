const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const productRoutes = require('./routes/productRoutes');
const posRoutes = require('./routes/posRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');

app.use('/api/products', productRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'POS System API is running!' });
});

// Debug route - add this temporarily to check database content
app.get('/api/debug/products', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const products = await db.collection('products').find({}).toArray();
        res.json({
            collections: collections.map(c => c.name),
            productCount: products.length,
            firstProduct: products[0] || null
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// IMPORTANT: Use environment variable
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI environment variable is not set!');
    process.exit(1);
}

console.log('Attempting to connect to MongoDB Atlas...');

// ONLY ONE connect call - no options
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Atlas connected successfully!');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});