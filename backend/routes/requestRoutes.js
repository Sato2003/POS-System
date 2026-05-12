const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const auth = require('../middleware/auth');

router.post('/create', auth, requestController.createRequest);
router.get('/pending', auth, requestController.getPendingRequests);
router.get('/all', auth, requestController.getAllRequests);
router.get('/count', auth, requestController.getRequestCount);
router.put('/approve/:id', auth, requestController.approveRequest);
router.put('/reject/:id', auth, requestController.rejectRequest);

module.exports = router;