const express = require('express');
const router = express.Router();
const posController = require('../controllers/posController');

router.get('/sales/all', posController.getAllSales);
router.get('/scan/:barcode', posController.scanBarcode);
router.post('/checkout', posController.checkout);
router.get('/sales/today', posController.getTodaySales);

module.exports = router;