import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Clock, Star, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import ProductGrid from '../components/product/ProductGrid';
import { categoryIcons } from '../utils/helpers';

const CATEGORIES = [
  'Fruits & Vegetables', 'Dairy & Eggs', 'Beverages', 'Snacks',
  'Pantry', 'Bakery', 'Frozen Foods', 'Personal Care', 'Household',
];

const BANNERS = [
  { bg: 'from-green-600 to-emerald-400', emoji: '🥦', title: 'Fresh Veggies', sub: 'Up to 40% off on all vegetables', cta: 'Shop Now', cat: 'Fruits & Vegetables' },
  { bg: 'from-orange-500 to-yellow-400', emoji: '🥛', title: 'Dairy Deals', sub: 'Best quality milk, eggs & more', cta: 'Explore', cat: 'Dairy & Eggs' },
  { bg: 'from-purple-600 to-pink-400', emoji: '🍫', title: 'Snack Attack', sub: 'Your favourite snacks at great prices', cta: 'Grab Now', cat: 'Snacks' },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products/recommended');
        setFeatured(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Auto-rotate banner
  useEffect(() => {
    const timer = setInterval(() => setActiveBanner((p) => (p + 1) % BANNERS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const banner = BANNERS[activeBanner];

  return (
    <div>
      {/* Hero Banner */}
      <section className={`bg-gradient-to-r ${banner.bg} text-white py-12 px-4 transition-all duration-700`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-6">
          <div className="animate-slide-up">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80 bg-white/20 px-3 py-1 rounded-full">Limited Time Offer</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-3 mb-2">{banner.title}</h1>
            <p className="text-lg opacity-90 mb-6">{banner.sub}</p>
            <Link to={`/products?category=${encodeURIComponent(banner.cat)}`} className="bg-white text-gray-800 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
              {banner.cta} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="text-8xl md:text-9xl animate-bounce-gentle">{banner.emoji}</div>
        </div>
        {/* Banner dots */}
        <div className="flex justify-center gap-2 mt-6">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setActiveBanner(i)} className={`w-2 h-2 rounded-full transition-all ${i === activeBanner ? 'bg-white w-6' : 'bg-white/50'}`} />
          ))}
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-white dark:bg-dark-card border-b dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Truck className="w-5 h-5 text-primary-600" />, title: 'Fast Delivery', sub: 'In 30-60 minutes' },
            { icon: <Shield className="w-5 h-5 text-primary-600" />, title: '100% Fresh', sub: 'Quality guaranteed' },
            { icon: <Clock className="w-5 h-5 text-primary-600" />, title: '24/7 Support', sub: 'Always here for you' },
            { icon: <Star className="w-5 h-5 text-primary-600" />, title: 'Best Prices', sub: 'Everyday low prices' },
          ].map(({ icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">{icon}</div>
              <div><p className="font-semibold text-sm">{title}</p><p className="text-xs text-gray-500 dark:text-dark-muted">{sub}</p></div>
            </div>
          ))}
        </div>
      </section>

      <div className="page-container space-y-10">
        {/* Categories grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-heading">Shop by Category</h2>
            <Link to="/products" className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3">
            {CATEGORIES.map((cat) => (
              <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`}
                className="card flex flex-col items-center gap-2 p-3 hover:border-primary-200 hover:border dark:hover:border-primary-700 cursor-pointer group transition-all">
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{categoryIcons[cat]}</span>
                <span className="text-[11px] font-medium text-center text-gray-600 dark:text-dark-muted leading-tight">{cat}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-heading">⭐ Featured Products</h2>
            <Link to="/products?featured=true" className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid products={featured} loading={loading} />
        </section>

        {/* Promotional Banner */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl p-8 text-white text-center">
          <p className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-1">Special Offer</p>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Free Delivery on Orders Above ₹499!</h2>
          <p className="opacity-90 mb-4">Use code <span className="bg-white text-primary-700 px-3 py-1 rounded-lg font-bold text-sm">WELCOME10</span> for 10% off your first order</p>
          <Link to="/products" className="bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition inline-flex items-center gap-2">
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Home;
