import { useState, useEffect } from 'react';
import { Search, X, UserCheck, UserX } from 'lucide-react';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/users?page=${page}&limit=15${search ? '&search=' + search : ''}`);
      setUsers(data.data);
      setTotalPages(data.pagination.totalPages);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const toggleStatus = async (id) => {
    setTogglingId(id);
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle`);
      toast.success(data.message);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally { setTogglingId(null); }
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold dark:text-dark-text">User Management</h1>
        <span className="badge bg-primary-100 text-primary-700 text-sm px-3 py-1">
          {users.length} users shown
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="input pl-10 text-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-bg border-b dark:border-dark-border">
              <tr>
                {['User', 'Email', 'Phone', 'Role', 'Joined', 'Last Login', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8"><Spinner className="mx-auto" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className="border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium truncate max-w-[100px]">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{u.lastLogin ? formatDate(u.lastLogin) : 'Never'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => toggleStatus(u._id)}
                        disabled={togglingId === u._id}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          u.isActive
                            ? 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100'
                            : 'text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100'
                        }`}
                      >
                        {togglingId === u._id ? <Spinner size="sm" /> : u.isActive ? <><UserX className="w-3 h-3" /> Deactivate</> : <><UserCheck className="w-3 h-3" /> Activate</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 flex gap-2 justify-center flex-wrap">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-dark-border hover:bg-primary-50'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
