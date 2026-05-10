import ProductCard from './ProductCard';
import { Spinner } from '../ui/Spinner';

/**
 * Responsive product grid with loading/empty states
 */
const ProductGrid = ({ products, loading, onWishlistToggle }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-dark-border" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-2/3" />
              <div className="h-4 bg-gray-200 dark:bg-dark-border rounded" />
              <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-text">No products found</h3>
        <p className="text-gray-500 dark:text-dark-muted mt-1">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} onWishlistToggle={onWishlistToggle} />
      ))}
    </div>
  );
};

export default ProductGrid;
