import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProductGrid from '../components/product/ProductGrid';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/wishlist');
      setWishlist(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 dark:text-dark-text">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" /> My Wishlist
        {wishlist.length > 0 && <span className="text-sm font-normal text-gray-400">({wishlist.length} items)</span>}
      </h1>

      {!loading && wishlist.length === 0 && (
        <div className="text-center py-24">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 dark:text-dark-muted mb-6">Save items you love for later!</p>
          <Link to="/products" className="btn-primary inline-flex">Browse Products</Link>
        </div>
      )}

      <ProductGrid products={wishlist} loading={loading} onWishlistToggle={fetch} />
    </div>
  );
};

export default Wishlist;
