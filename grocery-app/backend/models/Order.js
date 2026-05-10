const mongoose = require('mongoose');

/**
 * Order Schema
 * Tracks a placed order through its lifecycle
 */
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const deliverySlotSchema = new mongoose.Schema({
  date: { type: String, required: true }, // e.g., "2024-01-15"
  slot: { type: String, required: true }, // e.g., "10:00 AM - 12:00 PM"
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    deliverySlot: deliverySlotSchema,
    paymentMethod: {
      type: String,
      enum: ['COD', 'UPI', 'Card', 'Wallet'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    itemsPrice: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: String,
    totalPrice: { type: Number, required: true },
    estimatedDelivery: Date,
    deliveredAt: Date,
    notes: String,
  },
  { timestamps: true }
);

// Auto-generate order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `GRO-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
