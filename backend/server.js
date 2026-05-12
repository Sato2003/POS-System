// MUST BE FIRST - DNS configuration to fix Render resolution
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration - Allow Vercel frontend
app.use(cors({
    origin: ['https://pos-system-inventory.vercel.app', 'http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
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

// Debug route
app.get('/api/debug/products', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ error: 'Database not connected', state: mongoose.connection.readyState });
        }
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const products = await db.collection('products').find({}).limit(5).toArray();
        res.json({
            connected: true,
            databaseName: db.databaseName,
            collections: collections.map(c => c.name),
            productCount: products.length,
            sampleProducts: products
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI environment variable is not set!');
    process.exit(1);
}

console.log('Attempting to connect to MongoDB Atlas...');

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