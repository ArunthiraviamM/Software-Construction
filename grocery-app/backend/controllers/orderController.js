const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 499;

// @desc  Place a new order | POST /api/orders | Private
const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, deliverySlot, notes } = req.body;
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) { res.status(400); throw new Error('Your cart is empty'); }

  const orderItems = [];
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    if (!product || !product.inStock || product.stock < item.quantity) {
      res.status(400); throw new Error(`${item.product.name} is out of stock`);
    }
    orderItems.push({ product: product._id, name: product.name, image: product.thumbnail, price: item.price, quantity: item.quantity });
    product.stock -= item.quantity;
    if (product.stock === 0) product.inStock = false;
    await product.save();
  }

  const itemsPrice = cart.items.reduce((a, i) => a + i.price * i.quantity, 0);
  const deliveryFee = itemsPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  let discount = 0, couponCode = null;

  if (cart.coupon?.code) {
    discount = cart.coupon.discountAmount;
    couponCode = cart.coupon.code;
    await Coupon.findOneAndUpdate({ code: couponCode }, { $inc: { usageCount: 1 }, $push: { usedBy: req.user._id } });
  }

  const totalPrice = itemsPrice + deliveryFee - discount;
  const order = await Order.create({
    user: req.user._id, items: orderItems, shippingAddress, paymentMethod, deliverySlot,
    itemsPrice, deliveryFee, discount, couponCode, totalPrice, notes,
    statusHistory: [{ status: 'Placed', note: 'Order placed successfully' }],
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  });

  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null });
  await Notification.create({
    user: req.user._id, title: 'Order Placed! 🎉',
    message: `Your order ${order.orderNumber} has been placed.`, type: 'order', link: `/orders/${order._id}`,
  });

  res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
});

// @desc  Get logged-in user orders | GET /api/orders | Private
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments({ user: req.user._id });
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  res.json({ success: true, data: orders, pagination: { currentPage: Number(page), totalPages: Math.ceil(total / Number(limit)), total } });
});

// @desc  Get single order | GET /api/orders/:id | Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized to view this order');
  }
  res.json({ success: true, data: order });
});

// @desc  Cancel order | PUT /api/orders/:id/cancel | Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  if (['Delivered', 'Cancelled'].includes(order.orderStatus)) {
    res.status(400); throw new Error(`Order cannot be cancelled in ${order.orderStatus} status`);
  }

  order.orderStatus = 'Cancelled';
  order.statusHistory.push({ status: 'Cancelled', note: req.body.reason || 'Cancelled by user' });
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity }, inStock: true });
  }
  await order.save();

  await Notification.create({
    user: req.user._id, title: 'Order Cancelled',
    message: `Your order ${order.orderNumber} has been cancelled.`, type: 'order', link: `/orders/${order._id}`,
  });
  res.json({ success: true, message: 'Order cancelled', data: order });
});

module.exports = { placeOrder, getMyOrders, getOrder, cancelOrder };
