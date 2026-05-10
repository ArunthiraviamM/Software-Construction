const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Product Schema
 * Represents a grocery item in the store
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    slug: { type: String, unique: true },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Fruits & Vegetables',
        'Dairy & Eggs',
        'Meat & Seafood',
        'Bakery',
        'Beverages',
        'Snacks',
        'Pantry',
        'Frozen Foods',
        'Personal Care',
        'Household',
        'Baby Products',
        'Pet Supplies',
      ],
    },
    subCategory: { type: String, trim: true },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountedPrice: {
      type: Number,
      min: [0, 'Discounted price cannot be negative'],
    },
    discount: { type: Number, default: 0, min: 0, max: 100 }, // percentage
    unit: { type: String, required: true }, // e.g., "500g", "1L", "dozen"
    brand: { type: String, trim: true },
    images: [{ type: String }],
    thumbnail: { type: String },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 100,
    },
    inStock: { type: Boolean, default: true },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    isOrganic: { type: Boolean, default: false },
    nutritionInfo: {
      calories: Number,
      protein: String,
      carbs: String,
      fat: String,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  // Auto-calculate discount
  if (this.discountedPrice && this.price > 0) {
    this.discount = Math.round(((this.price - this.discountedPrice) / this.price) * 100);
  }
  next();
});

// Virtual for effective price
productSchema.virtual('effectivePrice').get(function () {
  return this.discountedPrice || this.price;
});

// Index for full-text search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
