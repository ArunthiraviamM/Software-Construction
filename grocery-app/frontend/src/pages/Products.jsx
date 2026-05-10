import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import api from '../api/axios';
import ProductGrid from '../components/product/ProductGrid';
import { categoryIcons } from '../utils/helpers';

const CATEGORIES = ['Fruits & Vegetables', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery', 'Beverages', 'Snacks', 'Pantry', 'Frozen Foods', 'Personal Care', 'Household'];
const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'discount', label: 'Best Discount' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = Number(searchParams.get('page') || 1);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (category) params.append('category', category);
      if (sort) params.append('sort', sort);
      if (page > 1) params.append('page', page);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);
      params.append('limit', 20);

      const { data } = await api.get(`/products?${params}`);
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [keyword, category, sort, page, priceRange]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange({ min: '', max: '' });
  };

  const hasFilters = keyword || category || sort || priceRange.min || priceRange.max;

  return (
    <div className="page-container">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-dark-text">
            {category || keyword ? (category || `Results for "${keyword}"`) : 'All Products'}
          </h1>
          {pagination.total > 0 && <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">{pagination.total} items found</p>}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort */}
          <div className="relative">
            <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}
              className="input text-sm py-2 pr-8 appearance-none cursor-pointer">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter toggle (mobile) */}
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary px-3 py-2 text-sm flex items-center gap-1">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          {/* Clear filters */}
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-red-500 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear All
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-56 flex-shrink-0 space-y-6`}>
          {/* Categories */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm mb-3">Category</h3>
            <div className="space-y-1.5">
              <button onClick={() => updateParam('category', '')}
                className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${!category ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 font-medium' : 'hover:bg-gray-50 dark:hover:bg-dark-bg'}`}>
                🛒 All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => updateParam('category', cat)}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${category === cat ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 font-medium' : 'hover:bg-gray-50 dark:hover:bg-dark-bg'}`}>
                  {categoryIcons[cat]} <span className="truncate">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="card p-4">
            <h3 className="font-semibold text-sm mb-3">Price Range (₹)</h3>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} className="input text-sm py-2" />
              <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} className="input text-sm py-2" />
            </div>
            <button onClick={fetchProducts} className="btn-primary w-full mt-2 py-2 text-sm">Apply</button>
          </div>
        </aside>

        {/* Products + Pagination */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} loading={loading} />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 flex-wrap">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => updateParam('page', p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-primary-600 text-white' : 'bg-white dark:bg-dark-card border dark:border-dark-border hover:bg-primary-50'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
