const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, forgotPassword, resetPassword, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidators, loginValidators, validate } = require('../utils/validators');

router.post('/register', registerValidators, validate, registerUser);
router.post('/login', loginValidators, validate, loginUser);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
