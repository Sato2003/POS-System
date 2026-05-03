const Product = require('../models/Product');
const Sale = require('../models/Sale');

exports.scanBarcode = async (req, res) => {
    try {
        const product = await Product.findOne({ barcode: req.params.barcode });
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        
        if (product.quantity <= 0) {
            return res.status(400).json({ success: false, error: 'Product out of stock' });
        }
        
        res.json({
            success: true,
            data: {
                _id: product._id,
                name: product.name,
                barcode: product.barcode,
                sellingPrice: product.sellingPrice,
                quantity: product.quantity,
                category: product.category
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getAllSales = async (req, res) => {
    try {
        const { page = 1, limit = 50, startDate, endDate } = req.query;
        
        let query = {};
        
        if (startDate && endDate) {
            query.saleDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const sales = await Sale.find(query)
            .sort({ saleDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Sale.countDocuments(query);
        
        res.json({
            success: true,
            data: sales,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.checkout = async (req, res) => {
    try {
        const { items, paymentMethod, customerName, cashierName } = req.body;
        
        let subtotal = 0;
        const processedItems = [];
        
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ success: false, error: `Product not found` });
            }
            
            if (product.quantity < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    error: `Insufficient stock for ${product.name}. Available: ${product.quantity}` 
                });
            }
            
            const itemTotal = product.sellingPrice * item.quantity;
            subtotal += itemTotal;
            
            processedItems.push({
                productId: product._id,
                name: product.name,
                barcode: product.barcode,
                quantity: item.quantity,
                unitPrice: product.sellingPrice,
                total: itemTotal
            });
            
            await Product.findByIdAndUpdate(product._id, {
                $inc: { quantity: -item.quantity }
            });
        }
        
        const taxAmount = subtotal * 0.12;
        const totalAmount = subtotal + taxAmount;
        const invoiceNumber = `INV-${Date.now()}`;
        
        const sale = new Sale({
            invoiceNumber,
            items: processedItems,
            subtotal,
            taxAmount,
            totalAmount,
            paymentMethod: paymentMethod || 'cash',
            customerName: customerName || 'Walk-in Customer',
            cashierName: cashierName || 'Cashier'
        });
        
        await sale.save();
        
        res.status(201).json({
            success: true,
            data: sale,
            invoiceNumber,
            message: 'Sale completed successfully'
        });
        
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getTodaySales = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const sales = await Sale.find({
            saleDate: { $gte: startOfDay, $lte: endOfDay }
        });
        
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        
        res.json({
            success: true,
            data: { sales, totalRevenue, count: sales.length }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};