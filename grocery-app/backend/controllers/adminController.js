const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc  Admin dashboard stats | GET /api/admin/stats | Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalOrders, totalProducts, revenueData] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Order.countDocuments(),
    Product.countDocuments(),
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' }, avgOrderValue: { $avg: '$totalPrice' } } },
    ]),
  ]);

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);

  // Revenue over last 7 days
  const last7Days = await Order.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, orderStatus: { $ne: 'Cancelled' } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Top selling products
  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ]);

  // Category sales
  const categorySales = await Order.aggregate([
    { $unwind: '$items' },
    { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $group: { _id: '$product.category', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    { $sort: { revenue: -1 } },
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      avgOrderValue: revenueData[0]?.avgOrderValue || 0,
      ordersByStatus,
      last7Days,
      topProducts,
      categorySales,
    },
  });
});

// @desc  Get all users (Admin) | GET /api/admin/users | Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
  const total = await User.countDocuments(query);
  const users = await User.find(query).sort({ createdAt: -1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
  res.json({ success: true, data: users, pagination: { currentPage: Number(page), totalPages: Math.ceil(total / Number(limit)), total } });
});

// @desc  Toggle user active status | PUT /api/admin/users/:id/toggle | Private/Admin
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.role === 'admin') { res.status(400); throw new Error('Cannot deactivate an admin account'); }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
});

// @desc  Admin get all orders | GET /api/admin/orders | Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { orderStatus: status } : {};
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
  res.json({ success: true, data: orders, pagination: { currentPage: Number(page), totalPages: Math.ceil(total / Number(limit)), total } });
});

// @desc  Update order status (Admin) | PUT /api/admin/orders/:id/status | Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  const validTransitions = {
    Placed: ['Confirmed', 'Cancelled'],
    Confirmed: ['Packed', 'Cancelled'],
    Packed: ['Out for Delivery'],
    'Out for Delivery': ['Delivered'],
    Delivered: [],
    Cancelled: [],
  };

  if (!validTransitions[order.orderStatus]?.includes(status)) {
    res.status(400); throw new Error(`Cannot transition from ${order.orderStatus} to ${status}`);
  }

  order.orderStatus = status;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
  if (status === 'Delivered') {
    order.deliveredAt = new Date();
    order.paymentStatus = 'Paid';
  }
  await order.save();

  const Notification = require('../models/Notification');
  await Notification.create({
    user: order.user, title: `Order ${status}`,
    message: `Your order ${order.orderNumber} is now ${status}.`, type: 'order', link: `/orders/${order._id}`,
  });

  res.json({ success: true, message: 'Order status updated', data: order });
});

module.exports = { getDashboardStats, getAllUsers, toggleUserStatus, getAllOrders, updateOrderStatus };
