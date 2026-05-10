const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc  Toggle wishlist | POST /api/users/wishlist/:productId | Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;
  const idx = user.wishlist.indexOf(productId);

  if (idx > -1) {
    user.wishlist.splice(idx, 1);
  } else {
    user.wishlist.push(productId);
  }
  await user.save();
  res.json({ success: true, wishlist: user.wishlist, added: idx === -1 });
});

// @desc  Get wishlist | GET /api/users/wishlist | Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price discountedPrice thumbnail inStock ratings');
  res.json({ success: true, data: user.wishlist });
});

// @desc  Add or update address | POST /api/users/addresses | Private
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, data: user.addresses });
});

// @desc  Delete address | DELETE /api/users/addresses/:addressId | Private
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();
  res.json({ success: true, data: user.addresses });
});

// @desc  Get notifications | GET /api/users/notifications | Private
const getNotifications = asyncHandler(async (req, res) => {
  const Notification = require('../models/Notification');
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, data: notifications });
});

// @desc  Mark notification read | PUT /api/users/notifications/:id/read | Private
const markNotificationRead = asyncHandler(async (req, res) => {
  const Notification = require('../models/Notification');
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true, message: 'Marked as read' });
});

module.exports = { toggleWishlist, getWishlist, addAddress, deleteAddress, getNotifications, markNotificationRead };
