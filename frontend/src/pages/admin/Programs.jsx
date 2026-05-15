import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

function ProgramModal({ program, onClose, onSave }) {
  const [form, setForm] = useState(
    program || { name: '', description: '', schedule: '', fee: '', capacity: '' }
  );
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (program) {
        const { data } = await api.put(`/programs/${program.id}`, { ...form, isActive: program.isActive });
        onSave(data, 'update');
        toast.success('Program diperbarui');
      } else {
        const { data } = await api.post('/programs', form);
        onSave(data, 'create');
        toast.success('Program berhasil dibuat');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan program');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold">{program ? 'Edit Program' : 'Tambah Program Baru'}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Nama Program *</label>
            <input type="text" className="input-field" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="label">Deskripsi *</label>
            <textarea className="input-field" rows={3} value={form.description} onChange={set('description')} required />
          </div>
          <div>
            <label className="label">Jadwal *</label>
            <input type="text" className="input-field" placeholder="cth: Senin, Rabu | 16:00-17:00 WIB" value={form.schedule} onChange={set('schedule')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Biaya (Rp/bulan) *</label>
              <input type="number" className="input-field" min="0" value={form.fee} onChange={set('fee')} required />
            </div>
            <div>
              <label className="label">Kapasitas *</label>
              <input type="number" className="input-field" min="1" value={form.capacity} onChange={set('capacity')} required />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Batal</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProg, setEditProg] = useState(null);

  useEffect(() => {
    api.get('/programs/all').then((r) => setPrograms(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSave = (data, type) => {
    if (type === 'create') setPrograms((prev) => [...prev, { ...data, _count: { registrations: 0, classes: 0 } }]);
    else setPrograms((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
  };

  const handleToggleActive = async (prog) => {
    try {
      const { data } = await api.put(`/programs/${prog.id}`, { ...prog, isActive: !prog.isActive });
      setPrograms((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
      toast.success(data.isActive ? 'Program diaktifkan' : 'Program dinonaktifkan');
    } catch {
      toast.error('Gagal mengubah status program');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus program ini? Semua data pendaftaran terkait akan ikut terhapus.')) return;
    try {
      await api.delete(`/programs/${id}`);
      setPrograms((prev) => prev.filter((p) => p.id !== id));
      toast.success('Program dihapus');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus program');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Manajemen Program</h1>
          <p className="page-subtitle">Kelola program pembelajaran yang ditawarkan</p>
        </div>
        <button onClick={() => { setEditProg(null); setShowModal(true); }} className="btn-primary">
          <Plus size={18} />
          Tambah Program
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Program</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Jadwal</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Biaya</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Kapasitas</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Pendaftar</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {programs.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{p.description}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-600 max-w-[200px]">{p.schedule}</td>
                  <td className="px-5 py-4 font-semibold text-primary-700">{fmt(p.fee)}</td>
                  <td className="px-5 py-4 text-gray-600">{p.capacity} santri</td>
                  <td className="px-5 py-4 text-gray-600">{p._count.registrations}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggleActive(p)} className="flex items-center gap-1.5 text-sm">
                      {p.isActive ? (
                        <><ToggleRight size={20} className="text-green-500" /><span className="text-green-600">Aktif</span></>
                      ) : (
                        <><ToggleLeft size={20} className="text-gray-400" /><span className="text-gray-400">Non-aktif</span></>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => { setEditProg(p); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ProgramModal
          program={editProg}
          onClose={() => { setShowModal(false); setEditProg(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
