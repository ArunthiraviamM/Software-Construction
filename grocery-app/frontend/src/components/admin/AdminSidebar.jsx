import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, LogOut, X, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/coupons', icon: Tag, label: 'Coupons' },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b dark:border-dark-border">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🛒</span>
          <div>
            <p className="font-bold text-primary-600">GroceryGo</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-bg'}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t dark:border-dark-border">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 btn-ghost p-2 bg-white dark:bg-dark-card shadow rounded-xl">
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Mobile sidebar */}
      <div className={`fixed top-0 left-0 h-full w-56 bg-white dark:bg-dark-card border-r dark:border-dark-border flex flex-col z-50 transition-transform duration-300 lg:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setOpen(false)} className="absolute top-4 right-4 btn-ghost p-1"><X className="w-4 h-4" /></button>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 h-screen sticky top-0 bg-white dark:bg-dark-card border-r dark:border-dark-border">
        <SidebarContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
