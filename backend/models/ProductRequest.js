const mongoose = require('mongoose');

const productRequestSchema = new mongoose.Schema({
    barcode: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    sellingPrice: { type: Number, required: true },
    costPrice: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    imageUrl: { type: String, default: '' },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requestedByName: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNotes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: String }
});

module.exports = mongoose.model('ProductRequest', productRequestSchema);