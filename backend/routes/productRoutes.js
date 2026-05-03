const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.post('/', productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/barcode/:barcode', productController.getProductByBarcode);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.put('/:id/stock', productController.updateStock);
router.delete('/:id', productController.deleteProduct);

module.exports = router;