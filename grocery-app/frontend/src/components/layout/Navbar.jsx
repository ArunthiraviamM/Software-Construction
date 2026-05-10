import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, User, Moon, Sun, Menu, X, Bell, Heart, ChevronDown, LogOut, Package, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/axios';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setUserDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;
    api.get('/users/notifications').then(({ data }) => {
      setNotifCount(data.data.filter((n) => !n.isRead).length);
    }).catch(() => {});
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🛒</span>
            <span className="text-xl font-extrabold text-primary-600">GroceryGo</span>
          </Link>

          {/* Search Bar (desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for groceries, brands..."
                className="input pl-10 pr-4 py-2.5 text-sm"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Dark mode toggle */}
            <button onClick={toggleTheme} className="btn-ghost p-2 rounded-xl" aria-label="Toggle dark mode">
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist */}
            {user && (
              <Link to="/wishlist" className="btn-ghost p-2 rounded-xl relative">
                <Heart className="w-5 h-5" />
              </Link>
            )}

            {/* Notifications */}
            {user && (
              <Link to="/profile" className="btn-ghost p-2 rounded-xl relative">
                <Bell className="w-5 h-5" />
                {notifCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="btn-ghost p-2 rounded-xl relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce-gentle">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center gap-2 btn-ghost px-3 py-2 rounded-xl">
                  <div className="w-7 h-7 rounded-full gradient-green flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-medium max-w-[80px] truncate">{user.name}</span>
                  <ChevronDown className="w-3 h-3 hidden md:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 card shadow-lg py-2 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-border">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-dark-bg text-primary-600 font-medium" onClick={() => setUserDropdownOpen(false)}>
                        <Settings className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-dark-bg" onClick={() => setUserDropdownOpen(false)}>
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-dark-bg" onClick={() => setUserDropdownOpen(false)}>
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <button onClick={() => { logout(); setUserDropdownOpen(false); navigate('/'); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary px-4 py-2 text-sm">Login</Link>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="btn-ghost p-2 md:hidden">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-3 animate-slide-up">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search groceries..." className="input pl-10 text-sm" />
              </div>
            </form>
            {/* Mobile nav links */}
            <div className="flex gap-4 mt-3 text-sm font-medium">
              <Link to="/products" className="text-primary-600" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
              <Link to="/orders" className="text-gray-600" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
              <Link to="/wishlist" className="text-gray-600" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
            </div>
          </div>
        )}

        {/* Category nav */}
        <nav className="hidden md:flex items-center gap-6 py-2 text-sm font-medium border-t border-gray-50 dark:border-dark-border overflow-x-auto hide-scrollbar">
          {['Fruits & Vegetables', 'Dairy & Eggs', 'Beverages', 'Snacks', 'Pantry', 'Bakery', 'Frozen Foods', 'Household'].map((cat) => (
            <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`}
              className="whitespace-nowrap text-gray-600 dark:text-dark-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {cat}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
