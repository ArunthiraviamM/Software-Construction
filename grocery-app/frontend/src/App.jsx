import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminSidebar from './components/admin/AdminSidebar';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Products from './pages/Products';
import ProductDetailPage from './pages/ProductDetailPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCoupons from './pages/admin/AdminCoupons';

// ─── Route Guards ─────────────────────────────────────────────────────────────

/** Redirect logged-in users away from auth pages */
const PublicRoute = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : <Outlet />;
};

/** Require login */
const PrivateRoute = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

/** Require admin role */
const AdminRoute = () => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-bg">
      <AdminSidebar />
      <Outlet />
    </div>
  );
};

// ─── Main Store Layout ─────────────────────────────────────────────────────────
const StoreLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => (
  <>
    {/* Global Toast Notifications */}
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'var(--toast-bg, #fff)',
          color: 'var(--toast-color, #111827)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />

    <Routes>
      {/* ── Public Auth Routes ── */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* ── Admin Routes ── */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="coupons" element={<AdminCoupons />} />
      </Route>

      {/* ── Main Store Routes ── */}
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<Cart />} />

        {/* Protected store routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="text-8xl mb-4">🫙</div>
            <h1 className="text-4xl font-extrabold mb-2">404</h1>
            <p className="text-gray-500 dark:text-dark-muted mb-6">Oops! This page doesn't exist.</p>
            <a href="/" className="btn-primary">Go Home</a>
          </div>
        } />
      </Route>
    </Routes>
  </>
);

export default App;
