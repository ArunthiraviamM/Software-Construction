const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product',
    'name thumbnail price discountedPrice inStock stock'
  );

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.json({ success: true, data: cart });
});

/**
 * @desc    Add item to cart or update quantity
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (!product.inStock || product.stock < quantity) {
    res.status(400);
    throw new Error('Product is out of stock or insufficient quantity');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const price = product.discountedPrice || product.price;
  const existingItem = cart.items.find((i) => i.product.toString() === productId);

  if (existingItem) {
    existingItem.quantity += Number(quantity);
    existingItem.price = price;
  } else {
    cart.items.push({ product: productId, quantity: Number(quantity), price });
  }

  await cart.save();
  await cart.populate('items.product', 'name thumbnail price discountedPrice inStock');
  res.json({ success: true, message: 'Cart updated', data: cart });
});

/**
 * @desc    Update item quantity in cart
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product', 'name thumbnail price discountedPrice inStock');
  res.json({ success: true, message: 'Cart updated', data: cart });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
  await cart.save();
  res.json({ success: true, message: 'Item removed from cart', data: cart });
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], coupon: null },
    { new: true }
  );
  res.json({ success: true, message: 'Cart cleared' });
});

/**
 * @desc    Apply coupon to cart
 * @route   POST /api/cart/coupon
 * @access  Private
 */
const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon || !coupon.isValid()) {
    res.status(400);
    throw new Error('Invalid or expired coupon code');
  }

  // Check if user already used this coupon
  if (coupon.usedBy.includes(req.user._id)) {
    res.status(400);
    throw new Error('You have already used this coupon');
  }

  const cartTotal = cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  if (cartTotal < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order amount is ₹${coupon.minOrderAmount}`);
  }

  let discountAmount =
    coupon.discountType === 'percentage'
      ? (cartTotal * coupon.discountValue) / 100
      : coupon.discountValue;

  // Cap the discount
  if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
    discountAmount = coupon.maxDiscountAmount;
  }

  cart.coupon = { code: coupon.code, discountAmount: Math.round(discountAmount) };
  await cart.save();

  res.json({
    success: true,
    message: `Coupon applied! You saved ₹${discountAmount.toFixed(0)}`,
    data: { discountAmount, coupon: { code: coupon.code, description: coupon.description } },
  });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon };
