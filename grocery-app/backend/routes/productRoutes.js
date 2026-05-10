const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getCategories, getRecommended, createProduct, updateProduct, deleteProduct, addReview } = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/recommended', getRecommended);
router.get('/:id', getProduct);
router.post('/:id/reviews', protect, addReview);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
