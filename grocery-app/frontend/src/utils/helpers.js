/**
 * Shared utility helpers for the frontend
 */

// Format price in Indian Rupees
export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

// Truncate text with ellipsis
export const truncate = (str, maxLen = 60) =>
  str?.length > maxLen ? str.slice(0, maxLen) + '…' : str;

// Calculate discount percentage
export const calcDiscount = (original, discounted) =>
  Math.round(((original - discounted) / original) * 100);

// Generate star rating array for rendering
export const getStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= Math.round(rating) ? 'full' : 'empty');
  }
  return stars;
};

// Format date using native Intl
export const formatDate = (dateStr) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));

// Format date + time
export const formatDateTime = (dateStr) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));

// Order status → color map
export const statusColor = (status) => {
  const map = {
    Placed: 'bg-blue-100 text-blue-700',
    Confirmed: 'bg-purple-100 text-purple-700',
    Packed: 'bg-yellow-100 text-yellow-700',
    'Out for Delivery': 'bg-orange-100 text-orange-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
    Pending: 'bg-gray-100 text-gray-600',
    Paid: 'bg-green-100 text-green-700',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
};

// Delivery slot options
export const deliverySlots = [
  { date: 'Today', slots: ['10:00 AM - 12:00 PM', '02:00 PM - 04:00 PM', '06:00 PM - 08:00 PM'] },
  { date: 'Tomorrow', slots: ['08:00 AM - 10:00 AM', '12:00 PM - 02:00 PM', '04:00 PM - 06:00 PM', '08:00 PM - 10:00 PM'] },
];

// Category icons map (emoji)
export const categoryIcons = {
  'Fruits & Vegetables': '🥦',
  'Dairy & Eggs': '🥛',
  'Meat & Seafood': '🥩',
  'Bakery': '🍞',
  'Beverages': '🧃',
  'Snacks': '🍿',
  'Pantry': '🫙',
  'Frozen Foods': '🧊',
  'Personal Care': '🧴',
  'Household': '🧹',
  'Baby Products': '👶',
  'Pet Supplies': '🐾',
};
