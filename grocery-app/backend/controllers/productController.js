const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

/**
 * @desc    Get all products with filters, search, and pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, inStock, sort, page = 1, limit = 12, featured } = req.query;

  const query = {};

  // Full-text search
  if (keyword) query.$text = { $search: keyword };

  // Category filter
  if (category) query.category = category;

  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Stock filter
  if (inStock === 'true') query.inStock = true;

  // Featured filter
  if (featured === 'true') query.isFeatured = true;

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  else if (sort === 'price_desc') sortOption = { price: -1 };
  else if (sort === 'rating') sortOption = { ratings: -1 };
  else if (sort === 'discount') sortOption = { discount: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query).sort(sortOption).skip(skip).limit(Number(limit));

  res.json({
    success: true,
    data: products,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
      limit: Number(limit),
    },
  });
});

/**
 * @desc    Get a single product by ID or slug
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    $or: [{ _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null }, { slug: req.params.id }],
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, data: product });
});

/**
 * @desc    Get all unique categories
 * @route   GET /api/products/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.json({ success: true, data: categories });
});

/**
 * @desc    Get recommended/featured products
 * @route   GET /api/products/recommended
 * @access  Public
 */
const getRecommended = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, inStock: true })
    .sort({ ratings: -1 })
    .limit(8);
  res.json({ success: true, data: products });
});

/**
 * @desc    Create a new product (Admin)
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, message: 'Product created', data: product });
});

/**
 * @desc    Update a product (Admin)
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, message: 'Product updated', data: product });
});

/**
 * @desc    Delete a product (Admin)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, message: 'Product deleted' });
});

/**
 * @desc    Add a review to a product
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if already reviewed
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.numReviews = product.reviews.length;
  product.ratings = product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length;
  await product.save();

  res.status(201).json({ success: true, message: 'Review added' });
});

module.exports = { getProducts, getProduct, getCategories, getRecommended, createProduct, updateProduct, deleteProduct, addReview };
