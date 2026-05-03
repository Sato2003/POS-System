const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    invoiceNumber: { type: String, unique: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        barcode: String,
        quantity: Number,
        unitPrice: Number,
        total: Number
    }],
    subtotal: Number,
    taxAmount: Number,
    totalAmount: Number,
    paymentMethod: { type: String, default: 'cash' },
    customerName: { type: String, default: 'Walk-in Customer' },
    cashierName: { type: String, default: 'Cashier' },
    saleDate: { type: Date, default: Date.now }
}, { timestamps: true });

const Sale = mongoose.models.Sale || mongoose.model('Sale', saleSchema);
module.exports = Sale;