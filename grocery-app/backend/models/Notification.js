const mongoose = require('mongoose');

/**
 * Notification Schema
 * In-app notifications for users
 */
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['order', 'promotion', 'system', 'delivery'],
      default: 'system',
    },
    isRead: { type: Boolean, default: false },
    link: String, // optional navigation link
    data: mongoose.Schema.Types.Mixed, // extra payload
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
