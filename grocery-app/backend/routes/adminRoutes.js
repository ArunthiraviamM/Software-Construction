const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, toggleUserStatus, getAllOrders, updateOrderStatus } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.use(protect, admin);
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
