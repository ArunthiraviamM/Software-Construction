import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';
import Modal from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const emptyForm = {
  code: '', description: '', discountType: 'percentage', discountValue: '',
  minOrderAmount: '', maxDiscountAmount: '', usageLimit: '', perUserLimit: 1,
  validUntil: '', isActive: true,
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditCoupon(null); setModalOpen(true); };
  const openEdit = (c) => {
    setForm({
      ...c,
      validUntil: c.validUntil ? new Date(c.validUntil).toISOString().split('T')[0] : '',
      usageLimit: c.usageLimit ?? '',
      maxDiscountAmount: c.maxDiscountAmount ?? '',
    });
    setEditCoupon(c);
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: Number(form.perUserLimit),
      };
      if (editCoupon) {
        await api.put(`/coupons/${editCoupon._id}`, payload);
        toast.success('Coupon updated!');
      } else {
        await api.post('/coupons', payload);
        toast.success('Coupon created!');
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    } finally { setSaving(false); }
  };

  const deleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch { toast.error('Delete failed'); }
  };

  const toggleActive = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { ...coupon, isActive: !coupon.isActive });
      toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`);
      fetchCoupons();
    } catch { toast.error('Failed to toggle'); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold dark:text-dark-text">Coupons Management</h1>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Create Coupon</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {coupons.length === 0 && <p className="text-gray-400 col-span-3 text-center py-8">No coupons yet. Create your first one!</p>}
          {coupons.map((c) => (
            <div key={c._id} className={`card p-5 border-l-4 ${c.isActive ? 'border-l-primary-500' : 'border-l-gray-300'}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary-600" />
                    <span className="font-bold text-lg tracking-wide">{c.code}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">{c.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(c)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors">
                    {c.isActive ? <ToggleRight className="w-5 h-5 text-primary-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                  </button>
                  <button onClick={() => openEdit(c)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => deleteCoupon(c._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-2">
                  <p className="text-gray-400 mb-0.5">Discount</p>
                  <p className="font-bold text-primary-600">
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`} OFF
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-2">
                  <p className="text-gray-400 mb-0.5">Min Order</p>
                  <p className="font-bold">₹{c.minOrderAmount}</p>
                </div>
                <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-2">
                  <p className="text-gray-400 mb-0.5">Usage</p>
                  <p className="font-bold">{c.usageCount} / {c.usageLimit ?? '∞'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-2">
                  <p className="text-gray-400 mb-0.5">Expires</p>
                  <p className="font-bold">{formatDate(c.validUntil)}</p>
                </div>
              </div>

              <div className="mt-3">
                <span className={`badge text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.isActive ? '✓ Active' : '✗ Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coupon Form Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCoupon ? 'Edit Coupon' : 'Create Coupon'} size="md">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Coupon Code</label>
              <input name="code" value={form.code} onChange={handleChange} required placeholder="e.g. SAVE20" className="input text-sm uppercase" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <input name="description" value={form.description} onChange={handleChange} required className="input text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <select name="discountType" value={form.discountType} onChange={handleChange} className="input text-sm">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Value</label>
              <input name="discountValue" type="number" value={form.discountValue} onChange={handleChange} required min="0" className="input text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Order (₹)</label>
              <input name="minOrderAmount" type="number" value={form.minOrderAmount} onChange={handleChange} min="0" className="input text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Discount Cap (₹)</label>
              <input name="maxDiscountAmount" type="number" value={form.maxDiscountAmount} onChange={handleChange} min="0" placeholder="Optional" className="input text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Usage Limit (total)</label>
              <input name="usageLimit" type="number" value={form.usageLimit} onChange={handleChange} min="0" placeholder="Blank = unlimited" className="input text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Per User Limit</label>
              <input name="perUserLimit" type="number" value={form.perUserLimit} onChange={handleChange} min="1" className="input text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Valid Until</label>
              <input name="validUntil" type="date" value={form.validUntil} onChange={handleChange} required className="input text-sm" />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 accent-primary-600" />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <Spinner size="sm" /> : editCoupon ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCoupons;
