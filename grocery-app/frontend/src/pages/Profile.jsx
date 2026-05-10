import { useState, useEffect } from 'react';
import { User, Mail, Phone, Camera, Bell, BellOff } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/helpers';
import { Spinner } from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(true);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    api.get('/users/notifications').then(({ data }) => setNotifications(data.data)).finally(() => setNotifsLoading(false));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/update-profile', form);
      updateUser({ ...user, name: data.data.name, phone: data.data.phone });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  const markRead = async (id) => {
    await api.put(`/users/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold mb-6 dark:text-dark-text">My Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile form */}
        <div className="card p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full gradient-green flex items-center justify-center text-white text-2xl font-bold relative">
              {user?.name?.charAt(0).toUpperCase()}
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-dark-card border-2 border-white dark:border-dark-card flex items-center justify-center shadow">
                <Camera className="w-3 h-3 text-gray-500" />
              </button>
            </div>
            <div>
              <p className="font-bold text-lg">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className={`badge text-xs mt-1 ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{user?.role}</span>
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input value={user?.email} disabled className="input pl-10 opacity-60 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input pl-10" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? <Spinner size="sm" /> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Change Password</h2>
          <form onSubmit={changePassword} className="space-y-4">
            {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirmPassword', 'Confirm New Password']].map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1.5">{label}</label>
                <input type="password" value={pwForm[field]} onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })} required className="input" />
              </div>
            ))}
            <button type="submit" disabled={savingPw} className="btn-primary w-full">
              {savingPw ? <Spinner size="sm" /> : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Notifications */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-primary-600" /> Notifications</h2>
          {notifsLoading ? <Spinner className="mx-auto" /> : (
            <div className="space-y-3">
              {notifications.length === 0 && <p className="text-gray-400 text-sm">No notifications yet.</p>}
              {notifications.map((n) => (
                <div key={n._id} onClick={() => !n.isRead && markRead(n._id)}
                  className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors ${n.isRead ? 'opacity-60' : 'bg-primary-50 dark:bg-primary-900/10'}`}>
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    {n.type === 'order' ? '📦' : n.type === 'promotion' ? '🎁' : '🔔'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-600 mt-2 flex-shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
