const Product = require('../models/Product');
const Sale = require('../models/Sale');

// Get KPI data
exports.getKPIs = async (req, res) => {
    try {
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Get today's sales
        const todaySales = await Sale.find({
            saleDate: { $gte: today, $lt: tomorrow }
        });
        
        const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
        const todayTransactions = todaySales.length;
        
        // Get total products (count ALL products, not just active)
        const totalProducts = await Product.countDocuments();
        
        // Get low stock count
        const lowStockCount = await Product.countDocuments({
            $expr: { $lte: ["$quantity", "$reorderLevel"] }
        });
        
        // Get inventory value
        const products = await Product.find();
        const inventoryValue = products.reduce((sum, p) => sum + ((p.costPrice || 0) * (p.quantity || 0)), 0);
        
        console.log('Dashboard Data:', {
            totalProducts,
            lowStockCount,
            todayRevenue,
            todayTransactions,
            inventoryValue
        });
        
        res.json({
            success: true,
            data: {
                todayRevenue: todayRevenue || 0,
                todayTransactions: todayTransactions || 0,
                totalProducts: totalProducts || 0,
                lowStockCount: lowStockCount || 0,
                inventoryValue: inventoryValue || 0
            }
        });
    } catch (error) {
        console.error('Error in getKPIs:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            data: {
                todayRevenue: 0,
                todayTransactions: 0,
                totalProducts: 0,
                lowStockCount: 0,
                inventoryValue: 0
            }
        });
    }
};

// Get low stock products
exports.getLowStock = async (req, res) => {
    try {
        const products = await Product.find({
            $expr: { $lte: ["$quantity", "$reorderLevel"] }
        }).limit(20);
        
        res.json({ success: true, data: products || [] });
    } catch (error) {
        console.error('Error in getLowStock:', error);
        res.json({ success: true, data: [] });
    }
};

// Get top selling products
exports.getTopProducts = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const topProducts = await Sale.aggregate([
            { $match: { saleDate: { $gte: thirtyDaysAgo } } },
            { $unwind: "$items" },
            { $group: {
                _id: "$items.productId",
                name: { $first: "$items.name" },
                totalSold: { $sum: "$items.quantity" },
                revenue: { $sum: "$items.total" }
            }},
            { $sort: { totalSold: -1 } },
            { $limit: 10 }
        ]);
        
        res.json({ success: true, data: topProducts || [] });
    } catch (error) {
        console.error('Error in getTopProducts:', error);
        res.json({ success: true, data: [] });
    }
};