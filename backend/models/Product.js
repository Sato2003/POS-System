const mongoose = require('mongoose');

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
    name: { type: String, required: true },
    barcode: { type: String, unique: true },
    sellingPrice: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
    category: { type: String, default: 'General' },
    reorderLevel: { type: Number, default: 10 },
    imageUrl: { type: String, default: '' }
}, { timestamps: true }));

module.exports = Product;