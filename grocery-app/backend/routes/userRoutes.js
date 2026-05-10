const express = require('express');
const router = express.Router();
const { toggleWishlist, getWishlist, addAddress, deleteAddress, getNotifications, markNotificationRead } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', toggleWishlist);
router.post('/addresses', addAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

module.exports = router;
