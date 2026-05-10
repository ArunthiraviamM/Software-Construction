import { useState } from 'react';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, calcDiscount } from '../../utils/helpers';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Badge from '../ui/Badge';

const ProductCard = ({ product, onWishlistToggle }) => {
  const { addToCart, cartLoading } = useCart();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discount = product.discountedPrice
    ? calcDiscount(product.price, product.discountedPrice)
    : product.discount;

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to add to wishlist'); return; }
    try {
      const { data } = await api.post(`/users/wishlist/${product._id}`);
      setWishlisted(data.added);
      toast.success(data.added ? 'Added to wishlist ❤️' : 'Removed from wishlist');
      onWishlistToggle?.();
    } catch { toast.error('Failed to update wishlist'); }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!product.inStock) return;
    addToCart(product._id, 1);
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card block animate-fade-in">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 dark:bg-dark-bg h-48">
        <img
          src={imgError ? 'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=400' : product.thumbnail}
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && <Badge variant="discount">{discount}% OFF</Badge>}
          {product.isOrganic && <Badge variant="organic">Organic</Badge>}
        </div>
        {/* Wishlist btn */}
        <button onClick={handleWishlist} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white dark:bg-dark-card shadow flex items-center justify-center transition-all hover:scale-110">
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
        {/* Quick view */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye className="w-4 h-4 text-white mr-1" />
          <span className="text-white text-xs font-medium">Quick View</span>
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 dark:bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-xs text-gray-400 dark:text-dark-muted mb-0.5">{product.category}</p>
        <h3 className="font-semibold text-sm line-clamp-2 text-gray-800 dark:text-dark-text mb-1">{product.name}</h3>
        <p className="text-xs text-gray-500 dark:text-dark-muted">{product.unit}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 my-1.5">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">{product.ratings?.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({product.numReviews})</span>
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="font-bold text-gray-900 dark:text-dark-text">{formatPrice(product.discountedPrice || product.price)}</span>
            {product.discountedPrice && (
              <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.price)}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || cartLoading}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              product.inStock
                ? 'bg-primary-600 hover:bg-primary-700 text-white active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-3 h-3" />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
