import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => (
  <footer className="bg-gray-900 dark:bg-dark-card text-gray-300 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🛒</span>
            <span className="text-xl font-extrabold text-white">GroceryGo</span>
          </div>
          <p className="text-sm text-gray-400 mb-4">Fresh groceries delivered to your door in minutes. Quality you can trust, prices you'll love.</p>
          <div className="flex gap-3">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-full bg-gray-700 hover:bg-primary-600 flex items-center justify-center transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {[{ label: 'Shop Now', to: '/products' }, { label: 'My Orders', to: '/orders' }, { label: 'Wishlist', to: '/wishlist' }, { label: 'Profile', to: '/profile' }].map(({ label, to }) => (
              <li key={to}><Link to={to} className="hover:text-primary-400 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-white font-semibold mb-4">Categories</h3>
          <ul className="space-y-2 text-sm">
            {['Fruits & Vegetables', 'Dairy & Eggs', 'Beverages', 'Snacks', 'Pantry', 'Household'].map((cat) => (
              <li key={cat}><Link to={`/products?category=${encodeURIComponent(cat)}`} className="hover:text-primary-400 transition-colors">{cat}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact Us</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" /><span>123 Green Street, Mumbai, MH 400001</span></div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary-400 flex-shrink-0" /><a href="tel:+911800123456" className="hover:text-primary-400">+91 1800-123-456</a></div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-400 flex-shrink-0" /><a href="mailto:support@grocerygo.com" className="hover:text-primary-400">support@grocerygo.com</a></div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <p>© {new Date().getFullYear()} GroceryGo. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary-400">Privacy Policy</a>
          <a href="#" className="hover:text-primary-400">Terms of Service</a>
          <a href="#" className="hover:text-primary-400">Refund Policy</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
