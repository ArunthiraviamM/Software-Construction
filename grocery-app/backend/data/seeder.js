/**
 * Database Seeder
 * Usage: npm run seed        (import data)
 *        npm run seed -- -d  (destroy data)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const products = require('./products');

connectDB();

const importData = async () => {
  try {
    // Clear existing data
    await Product.deleteMany();
    await User.deleteMany();
    await Coupon.deleteMany();

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@grocerygo.com',
      password: 'admin123',
      role: 'admin',
      phone: '9876543210',
    });

    // Create a sample regular user
    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'user123',
      phone: '9876543211',
    });

    // Seed products
    await Product.insertMany(products);

    // Seed sample coupons
    await Coupon.insertMany([
      {
        code: 'WELCOME10',
        description: '10% off on your first order',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 200,
        maxDiscountAmount: 100,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        usageLimit: null,
      },
      {
        code: 'FLAT50',
        description: 'Flat ₹50 off on orders above ₹500',
        discountType: 'fixed',
        discountValue: 50,
        minOrderAmount: 500,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 500,
      },
      {
        code: 'FRESH20',
        description: '20% off on Fruits & Vegetables',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 100,
        maxDiscountAmount: 150,
        applicableCategories: ['Fruits & Vegetables'],
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('✅ Data imported successfully!');
    console.log('📧 Admin: admin@grocerygo.com | Password: admin123');
    console.log('📧 User:  john@example.com    | Password: user123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();
    await Coupon.deleteMany();
    console.log('🗑️  Data destroyed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Destroy Error:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
