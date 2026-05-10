import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import { formatPrice } from '../../utils/helpers';
import Modal from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['Fruits & Vegetables','Dairy & Eggs','Meat & Seafood','Bakery','Beverages','Snacks','Pantry','Frozen Foods','Personal Care','Household','Baby Products','Pet Supplies'];

const emptyForm = { name: '', description: '', category: '', price: '', discountedPrice: '', unit: '', brand: '', stock: '', thumbnail: '', isFeatured: false, isOrganic: false };

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products?limit=15&page=${page}${search ? '&keyword='+search : ''}`);
      setProducts(data.data);
      setTotalPages(data.pagination.totalPages);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const openCreate = () => { setForm(emptyForm); setEditProduct(null); setModalOpen(true); };
  const openEdit = (p) => { setForm({ ...p, price: p.price, discountedPrice: p.discountedPrice || '' }); setEditProduct(p); setModalOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, form);
        toast.success('Product updated!');
      } else {
        await api.post('/products', form);
        toast.success('Product created!');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally { setSaving(false); }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Delete failed'); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold dark:text-dark-text">Products Management</h1>
        <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Product</button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="input pl-10 text-sm" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-400" /></button>}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-bg border-b dark:border-dark-border">
              <tr>{['Image','Name','Category','Price','Stock','Status','Actions'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8"><Spinner className="mx-auto" /></td></tr>
              ) : products.map((p) => (
                <tr key={p._id} className="border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
                  <td className="px-4 py-3"><img src={p.thumbnail} alt={p.name} className="w-10 h-10 rounded-lg object-cover" onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1506617420156-8e4536971650?w=40';}} /></td>
                  <td className="px-4 py-3 max-w-[180px]">
                    <p className="font-medium truncate">{p.name}</p>
                    {p.isFeatured && <span className="badge bg-yellow-100 text-yellow-700 text-xs">Featured</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{formatPrice(p.discountedPrice || p.price)}</p>
                    {p.discountedPrice && <p className="text-xs text-gray-400 line-through">{formatPrice(p.price)}</p>}
                  </td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.inStock ? 'In Stock' : 'Out'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteProduct(p._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 flex gap-2 justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm ${p === page ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-dark-border hover:bg-primary-50'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editProduct ? 'Edit Product' : 'Add New Product'} size="lg">
        <form onSubmit={save} className="grid grid-cols-2 gap-4">
          {[['name','Product Name','text',2],['description','Description','text',2],['category','Category','select',2],['price','Price (₹)','number',1],['discountedPrice','Discounted Price (₹)','number',1],['unit','Unit (e.g. 1kg)','text',1],['brand','Brand','text',1],['stock','Stock','number',1],['thumbnail','Thumbnail URL','text',2]].map(([field, label, type, span]) => (
            <div key={field} className={span === 2 ? 'col-span-2' : ''}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              {type === 'select' ? (
                <select name={field} value={form[field]} onChange={handleChange} required className="input text-sm">
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : field === 'description' ? (
                <textarea name={field} value={form[field]} onChange={handleChange} required rows={3} className="input resize-none text-sm" />
              ) : (
                <input name={field} type={type} value={form[field]} onChange={handleChange} required={['name','price','unit','stock'].includes(field)} className="input text-sm" step={['price','discountedPrice'].includes(field) ? '0.01' : undefined} min={['price','stock'].includes(field) ? '0' : undefined} />
              )}
            </div>
          ))}
          <div className="col-span-2 flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 accent-primary-600" />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isOrganic" checked={form.isOrganic} onChange={handleChange} className="w-4 h-4 accent-primary-600" />
              <span className="text-sm">Organic</span>
            </label>
          </div>
          <div className="col-span-2 flex gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <Spinner size="sm" /> : editProduct ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProducts;
