const ProductRequest = require('../models/ProductRequest');
const Product = require('../models/Product');

exports.createRequest = async (req, res) => {
    try {
        console.log('Request received:', req.body);
        console.log('User:', req.user);
        
        const { barcode, name, category, sellingPrice, costPrice, quantity, imageUrl } = req.body;
        
        const existingProduct = await Product.findOne({ barcode });
        if (existingProduct) {
            return res.status(400).json({ success: false, error: 'Product already exists' });
        }
        
        const existingRequest = await ProductRequest.findOne({ barcode, status: 'pending' });
        if (existingRequest) {
            return res.status(400).json({ success: false, error: 'Request already pending' });
        }
        
        const request = new ProductRequest({
            barcode,
            name,
            category: category || 'General',
            sellingPrice,
            costPrice: costPrice || 0,
            quantity: quantity || 1,
            imageUrl: imageUrl || '',
            requestedBy: req.user.id,
            requestedByName: req.user.name || req.user.username,
            status: 'pending'
        });
        
        await request.save();
        
        res.status(201).json({ success: true, data: request, message: 'Request sent to admin' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await ProductRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllRequests = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.status = status;
        const requests = await ProductRequest.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getRequestCount = async (req, res) => {
    try {
        const pendingCount = await ProductRequest.countDocuments({ status: 'pending' });
        res.json({ success: true, data: { pendingCount } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.approveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await ProductRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }
        
        const product = new Product({
            name: request.name,
            barcode: request.barcode,
            sellingPrice: request.sellingPrice,
            costPrice: request.costPrice,
            quantity: request.quantity,
            category: request.category,
            imageUrl: request.imageUrl
        });
        
        await product.save();
        
        request.status = 'approved';
        request.reviewedAt = new Date();
        request.reviewedBy = req.user.name || req.user.username;
        await request.save();
        
        res.json({ success: true, data: { product, request }, message: 'Product added' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await ProductRequest.findById(id);
        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }
        
        request.status = 'rejected';
        request.reviewedAt = new Date();
        request.reviewedBy = req.user.name || req.user.username;
        await request.save();
        
        res.json({ success: true, data: request, message: 'Request rejected' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};