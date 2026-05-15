import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Users, Loader2, X, BookOpen } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

function ClassModal({ cls, programs, onClose, onSave }) {
  const [form, setForm] = useState(
    cls || { name: '', programId: '', teacherName: '', schedule: '', capacity: '' }
  );
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (cls) {
        const { data } = await api.put(`/classes/${cls.id}`, form);
        onSave(data, 'update');
        toast.success('Kelas diperbarui');
      } else {
        const { data } = await api.post('/classes', form);
        onSave(data, 'create');
        toast.success('Kelas berhasil dibuat');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan kelas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold">{cls ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Nama Kelas *</label>
            <input type="text" className="input-field" placeholder="cth: Kelas Iqro A" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="label">Program *</label>
            <select className="input-field" value={form.programId} onChange={set('programId')} required>
              <option value="">Pilih program...</option>
              {programs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Ustaz / Ustazah Pengampu *</label>
            <input type="text" className="input-field" placeholder="Nama lengkap" value={form.teacherName} onChange={set('teacherName')} required />
          </div>
          <div>
            <label className="label">Jadwal *</label>
            <input type="text" className="input-field" placeholder="cth: Senin, Rabu | 16:00-17:00" value={form.schedule} onChange={set('schedule')} required />
          </div>
          <div>
            <label className="label">Kapasitas *</label>
            <input type="number" className="input-field" placeholder="Jumlah maks santri" value={form.capacity} onChange={set('capacity')} required min="1" />
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

function AssignModal({ cls, onClose, onAssigned }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    api.get('/admin/registrations?status=PAYMENT_VERIFIED').then((r) => setRegistrations(r.data)).finally(() => setLoading(false));
  }, []);

  const handleAssign = async (regId) => {
    setAssigning(regId);
    try {
      await api.post(`/classes/${cls.id}/assign`, { registrationId: regId });
      toast.success('Santri berhasil ditempatkan di kelas');
      onAssigned();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menempatkan santri');
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold">Tempatkan Santri ke {cls.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary-600" size={24} /></div>
          ) : registrations.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Tidak ada santri yang menunggu penempatan kelas.<br /><span className="text-xs">Santri harus berstatus "Pembayaran Diverifikasi" terlebih dahulu.</span></p>
          ) : (
            <div className="space-y-2">
              {registrations.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.santriName}</p>
                    <p className="text-xs text-gray-500">{r.program.name} · {r.readingLevel}</p>
                  </div>
                  <button
                    onClick={() => handleAssign(r.id)}
                    disabled={!!assigning}
                    className="btn-primary text-xs py-1.5"
                  >
                    {assigning === r.id ? <Loader2 size={12} className="animate-spin" /> : 'Tempatkan'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminClassManagement() {
  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCls, setEditCls] = useState(null);
  const [assignCls, setAssignCls] = useState(null);

  const fetchClasses = () => {
    api.get('/classes').then((r) => setClasses(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClasses();
    api.get('/programs').then((r) => setPrograms(r.data));
  }, []);

  const handleSave = (data, type) => {
    if (type === 'create') setClasses((prev) => [data, ...prev]);
    else setClasses((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)));
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus kelas ini? Semua penugasan santri akan ikut terhapus.')) return;
    try {
      await api.delete(`/classes/${id}`);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      toast.success('Kelas dihapus');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus kelas');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Manajemen Kelas</h1>
          <p className="page-subtitle">Buat kelas dan tempatkan santri yang sudah diterima</p>
        </div>
        <button onClick={() => { setEditCls(null); setShowModal(true); }} className="btn-primary">
          <Plus size={18} />
          Tambah Kelas
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
      ) : classes.length === 0 ? (
        <div className="card text-center py-14">
          <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">Belum ada kelas</p>
          <button onClick={() => { setEditCls(null); setShowModal(true); }} className="btn-primary">Buat Kelas Pertama</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{cls.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{cls.program?.name}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditCls(cls); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(cls.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">👤 {cls.teacherName}</p>
              <p className="text-sm text-gray-600 mb-3">🕐 {cls.schedule}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Users size={15} />
                  <span>{cls._count.assignments} / {cls.capacity} santri</span>
                </div>
                <button
                  onClick={() => setAssignCls(cls)}
                  disabled={cls._count.assignments >= cls.capacity}
                  className="btn-secondary text-xs py-1.5 disabled:opacity-40"
                >
                  + Tempatkan Santri
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ClassModal
          cls={editCls}
          programs={programs}
          onClose={() => { setShowModal(false); setEditCls(null); }}
          onSave={handleSave}
        />
      )}

      {assignCls && (
        <AssignModal
          cls={assignCls}
          onClose={() => setAssignCls(null)}
          onAssigned={fetchClasses}
        />
      )}
    </div>
  );
}
