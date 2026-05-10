const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

// @desc  Get all coupons | GET /api/coupons | Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data: coupons });
});

// @desc  Validate coupon (user-facing preview) | POST /api/coupons/validate | Private
const validateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.body.code?.toUpperCase() });
  if (!coupon || !coupon.isValid()) {
    res.status(400); throw new Error('Invalid or expired coupon code');
  }
  if (coupon.usedBy.includes(req.user._id)) {
    res.status(400); throw new Error('You have already used this coupon');
  }
  res.json({ success: true, data: { code: coupon.code, description: coupon.description, discountType: coupon.discountType, discountValue: coupon.discountValue, minOrderAmount: coupon.minOrderAmount } });
});

// @desc  Create coupon | POST /api/coupons | Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

// @desc  Update coupon | PUT /api/coupons/:id | Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  res.json({ success: true, data: coupon });
});

// @desc  Delete coupon | DELETE /api/coupons/:id | Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  res.json({ success: true, message: 'Coupon deleted' });
});

module.exports = { getCoupons, validateCoupon, createCoupon, updateCoupon, deleteCoupon };
