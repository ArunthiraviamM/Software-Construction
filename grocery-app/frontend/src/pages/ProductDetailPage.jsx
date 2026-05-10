import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ArrowLeft, Plus, Minus, Leaf, Package } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';
import { Spinner } from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartLoading } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.data);
      } catch { navigate('/products'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleAddToCart = () => { if (product.inStock) addToCart(product._id, qty); };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login'); return; }
    try {
      const { data } = await api.post(`/users/wishlist/${product._id}`);
      setWishlisted(data.added);
      toast.success(data.added ? 'Added to wishlist ❤️' : 'Removed from wishlist');
    } catch { toast.error('Failed'); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed');
    } finally { setSubmittingReview(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!product) return null;

  const images = product.images?.length ? product.images : [product.thumbnail];
  const discount = product.discountedPrice ? Math.round(((product.price - product.discountedPrice) / product.price) * 100) : 0;

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 text-sm"><ArrowLeft className="w-4 h-4" /> Back</button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="card overflow-hidden rounded-2xl h-80 mb-3">
            <img src={images[activeImg] || product.thumbnail} alt={product.name} className="w-full h-full object-contain p-4"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=400'; }} />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-primary-500' : 'border-gray-200 dark:border-dark-border'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <div className="flex gap-2 flex-wrap mb-2">
              <Badge variant="primary">{product.category}</Badge>
              {product.isOrganic && <Badge variant="organic"><Leaf className="w-3 h-3 mr-1" />Organic</Badge>}
              {discount > 0 && <Badge variant="discount">{discount}% OFF</Badge>}
            </div>
            <h1 className="text-2xl font-bold dark:text-dark-text">{product.name}</h1>
            <p className="text-gray-500 dark:text-dark-muted text-sm mt-1">{product.unit} {product.brand && `• ${product.brand}`}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1,2,3,4,5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.ratings) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
            </div>
            <span className="text-sm font-medium">{product.ratings?.toFixed(1)}</span>
            <span className="text-sm text-gray-400">({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-dark-text">{formatPrice(product.discountedPrice || product.price)}</span>
            {product.discountedPrice && <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>}
            {discount > 0 && <span className="text-green-600 text-sm font-medium">You save {formatPrice(product.price - product.discountedPrice)}</span>}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-500'}`}>
              {product.inStock ? `In Stock (${product.stock} left)` : 'Out of Stock'}
            </span>
          </div>

          {/* Qty + Add */}
          {product.inStock && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border dark:border-dark-border rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"><Minus className="w-4 h-4" /></button>
                <span className="px-4 font-bold text-lg">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={handleAddToCart} disabled={cartLoading} className="btn-primary flex-1 py-3">
                {cartLoading ? <Spinner size="sm" /> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
              </button>
              <button onClick={handleWishlist} className={`p-3 rounded-xl border-2 transition-all ${wishlisted ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-dark-border hover:border-red-300'}`}>
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            </div>
          )}

          {/* Description */}
          <div className="border-t dark:border-dark-border pt-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600 dark:text-dark-muted text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Nutrition */}
          {product.nutritionInfo?.calories && (
            <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4">
              <h3 className="font-semibold text-sm mb-2 text-green-800 dark:text-green-300">Nutrition Info (per 100g)</h3>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                {[['Calories', product.nutritionInfo.calories + ' kcal'], ['Protein', product.nutritionInfo.protein], ['Carbs', product.nutritionInfo.carbs], ['Fat', product.nutritionInfo.fat]].map(([k, v]) => v && (
                  <div key={k} className="bg-white dark:bg-dark-card rounded-lg p-2">
                    <p className="font-bold text-gray-800 dark:text-dark-text">{v}</p>
                    <p className="text-gray-400 text-xs">{k}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="section-heading mb-6">Customer Reviews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Review list */}
          <div className="space-y-4">
            {product.reviews?.length === 0 && <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>}
            {product.reviews?.map((review, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">{review.name}</p>
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-dark-muted">{review.comment}</p>
              </div>
            ))}
          </div>

          {/* Add review form */}
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Write a Review</h3>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                      <Star className={`w-6 h-6 cursor-pointer transition-colors ${s <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Comment</label>
                <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} required rows={3} placeholder="Share your experience..." className="input resize-none" />
              </div>
              <button type="submit" disabled={submittingReview} className="btn-primary w-full">
                {submittingReview ? <Spinner size="sm" /> : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
