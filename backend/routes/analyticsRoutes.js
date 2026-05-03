const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/kpi', analyticsController.getKPIs);
router.get('/low-stock', analyticsController.getLowStock);
router.get('/top-products', analyticsController.getTopProducts);

module.exports = router;