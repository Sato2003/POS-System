const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', auth, authController.getCurrentUser);
router.get('/users', auth, authController.getAllUsers);
router.put('/users/:id', auth, authController.updateUser);
router.delete('/users/:id', auth, authController.deleteUser);

module.exports = router;