const mongoose = require('mongoose');

/**
 * Coupon Schema
 * Manages discount coupons for the store
 */
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, required: true },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount cannot be negative'],
    },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number }, // cap for percentage discounts
    usageLimit: { type: Number, default: null }, // null = unlimited
    usageCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    applicableCategories: [String], // empty = all categories
  },
  { timestamps: true }
);

// Check if coupon is currently valid
couponSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validUntil &&
    (this.usageLimit === null || this.usageCount < this.usageLimit)
  );
};

module.exports = mongoose.model('Coupon', couponSchema);
