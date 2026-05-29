const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { auth, authorizeRoles } = require('../middleware/auth');

router.get('/', foodController.getAllFood);
router.post('/', auth, authorizeRoles('seller', 'admin'), foodController.addFood);
router.put('/:id', auth, authorizeRoles('seller', 'admin'), foodController.updateFood);
router.delete('/:id', auth, authorizeRoles('seller', 'admin'), foodController.deleteFood);

module.exports = router;
