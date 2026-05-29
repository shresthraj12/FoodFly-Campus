const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, authorizeRoles } = require('../middleware/auth');

router.post('/', auth, orderController.placeOrder);
router.get('/myorders', auth, orderController.getUserOrders);
router.get('/', auth, authorizeRoles('seller', 'admin'), orderController.getAllOrders);
router.put('/:id/status', auth, authorizeRoles('seller', 'admin'), orderController.updateOrderStatus);

module.exports = router;
