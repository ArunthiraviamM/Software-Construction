import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Spinner';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate(result.role === 'admin' ? '/admin' : '/');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — decorative */}
      <div className="hidden lg:flex flex-1 gradient-green items-center justify-center p-12">
        <div className="text-white text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-4xl font-extrabold mb-3">GroceryGo</h1>
          <p className="text-lg opacity-90 max-w-sm">Fresh groceries delivered to your door. Quality you can trust, prices you'll love.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            {['🥦 1000+ Products', '🚀 30-min Delivery', '🔒 Secure Payments', '⭐ 50K+ Happy Customers'].map((f) => (
              <div key={f} className="bg-white/20 rounded-xl px-4 py-3 font-medium">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-dark-bg">
        <div className="w-full max-w-md animate-fade-in">
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="text-4xl mb-2 lg:hidden">🛒</div>
              <h2 className="text-2xl font-bold">Welcome back!</h2>
              <p className="text-gray-500 dark:text-dark-muted mt-1 text-sm">Sign in to your GroceryGo account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input id="email" name="email" type="email" required value={form.email} onChange={handleChange}
                    placeholder="you@example.com" className="input pl-10" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={form.password} onChange={handleChange}
                    placeholder="••••••••" className="input pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3">
                {loading ? <Spinner size="sm" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-1">Demo Credentials:</p>
              <p>👤 User: john@example.com / user123</p>
              <p>🔑 Admin: admin@grocerygo.com / admin123</p>
            </div>

            <p className="text-center text-sm text-gray-600 dark:text-dark-muted mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
