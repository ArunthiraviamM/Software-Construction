import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import { Spinner } from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-dark-bg">
      <div className="w-full max-w-md animate-fade-in">
        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Check your email!</h2>
              <p className="text-gray-500 dark:text-dark-muted">We've sent a password reset link to <strong>{email}</strong></p>
              <p className="text-sm text-gray-400 mt-2">The link expires in 10 minutes.</p>
              <Link to="/login" className="btn-primary mt-6 inline-flex"><ArrowLeft className="w-4 h-4" /> Back to Login</Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🔑</div>
                <h2 className="text-2xl font-bold">Forgot Password?</h2>
                <p className="text-gray-500 dark:text-dark-muted mt-1 text-sm">Enter your email and we'll send you a reset link</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input pl-10" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? <Spinner size="sm" /> : <><span>Send Reset Link</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
              <div className="text-center mt-4">
                <Link to="/login" className="text-sm text-primary-600 hover:underline flex items-center justify-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
