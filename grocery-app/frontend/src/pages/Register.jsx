import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Spinner';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    const result = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    if (result.success) navigate('/');
  };

  const strengthScore = (pw) => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = strengthScore(form.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-dark-bg">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="card p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🛒</div>
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="text-gray-500 dark:text-dark-muted mt-1 text-sm">Join thousands of happy GroceryGo customers</p>
          </div>

          {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input id="name" name="name" required value={form.name} onChange={handleChange} placeholder="John Doe" className="input pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="9876543210" className="input pl-10" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={form.password} onChange={handleChange} placeholder="••••••••" className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map((i) => <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColors[strength] : 'bg-gray-200 dark:bg-dark-border'}`} />)}
                  </div>
                  <span className="text-xs text-gray-500">{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} required value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" className="input pl-10 pr-10" />
                {form.confirmPassword && (
                  <CheckCircle className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${form.password === form.confirmPassword ? 'text-green-500' : 'text-red-400'}`} />
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500">By registering, you agree to our <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.</p>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <Spinner size="sm" /> : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-dark-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
