import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle, XCircle, FileText, Loader2, ExternalLink } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const STATUSES = [
  { value: 'PENDING', label: 'Menunggu Verifikasi' },
  { value: 'PAYMENT_VERIFIED', label: 'Verifikasi Pembayaran' },
  { value: 'PLACEMENT_SCHEDULED', label: 'Jadwal Placement Test' },
  { value: 'ACCEPTED', label: 'Terima' },
  { value: 'REJECTED', label: 'Tolak' },
];

export default function AdminApplicationDetail() {
  const { id } = useParams();
  const [reg, setReg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [placementForm, setPlacementForm] = useState({ scheduledDate: '', method: '', notes: '' });
  const [updatingPlacement, setUpdatingPlacement] = useState(false);

  useEffect(() => {
    api.get(`/registrations/${id}`).then((r) => {
      setReg(r.data);
      setNewStatus(r.data.status);
      setAdminNotes(r.data.adminNotes || '');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      const { data } = await api.patch(`/admin/registrations/${id}/status`, { status: newStatus, adminNotes });
      setReg((r) => ({ ...r, status: data.status, adminNotes: data.adminNotes }));
      toast.success('Status berhasil diperbarui');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSchedulePlacement = async (e) => {
    e.preventDefault();
    setUpdatingPlacement(true);
    try {
      const { data } = await api.post(`/admin/registrations/${id}/placement-test`, placementForm);
      setReg((r) => ({ ...r, status: 'PLACEMENT_SCHEDULED', placementTest: data }));
      toast.success('Jadwal tes placement berhasil disimpan');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menjadwalkan');
    } finally {
      setUpdatingPlacement(false);
    }
  };

  const handleUpdateTestResult = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const result = fd.get('result');
    const score = fd.get('score');
    const notes = fd.get('notes');
    try {
      const { data } = await api.patch(`/admin/placement-tests/${reg.placementTest.id}`, { result, score, notes });
      setReg((r) => ({ ...r, placementTest: { ...r.placementTest, ...data } }));
      toast.success('Hasil tes disimpan');
    } catch (err) {
      toast.error('Gagal menyimpan hasil tes');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  if (!reg) {
    return <div className="p-6">Pendaftaran tidak ditemukan.</div>;
  }

  return (
    <div className="p-6 max-w-4xl">
      <Link to="/admin/pendaftaran" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft size={16} /> Kembali ke Daftar
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title">{reg.santriName}</h1>
          <p className="text-gray-500 text-sm">{reg.program.name} · Didaftarkan {new Date(reg.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <StatusBadge status={reg.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Data santri */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Data Santri</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Nama Santri', reg.santriName],
                ['Jenis Kelamin', reg.santriGender],
                ['Tanggal Lahir', new Date(reg.santriDOB).toLocaleDateString('id-ID')],
                ['Pendidikan', reg.education],
                ['Level Bacaan', reg.readingLevel],
                ['Nama Wali', reg.parentName],
                ['No. WA Wali', reg.parentPhone],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="font-medium text-gray-900">{v}</dd>
                </div>
              ))}
              <div className="col-span-2">
                <dt className="text-gray-500">Alamat</dt>
                <dd className="font-medium text-gray-900">{reg.santriAddress}</dd>
              </div>
            </dl>
          </div>

          {/* Documents */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Dokumen Unggahan</h2>
            <div className="space-y-2">
              {reg.documentUrl ? (
                <a href={reg.documentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                  <FileText size={16} />
                  Lihat Dokumen Pendukung
                  <ExternalLink size={12} />
                </a>
              ) : (
                <p className="text-sm text-gray-400">Belum ada dokumen pendukung</p>
              )}
              {reg.paymentProofUrl ? (
                <a href={reg.paymentProofUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                  <FileText size={16} />
                  Lihat Bukti Pembayaran
                  <ExternalLink size={12} />
                </a>
              ) : (
                <p className="text-sm text-red-500 font-medium">⚠️ Bukti pembayaran belum diunggah</p>
              )}
            </div>
          </div>

          {/* Placement test */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Placement Test</h2>
            {reg.placementTest ? (
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm">
                  <p><span className="text-gray-500">Tanggal:</span> <strong>{new Date(reg.placementTest.scheduledDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
                  <p><span className="text-gray-500">Metode:</span> <strong>{reg.placementTest.method}</strong></p>
                  {reg.placementTest.result && (
                    <>
                      <p><span className="text-gray-500">Hasil:</span> <strong>{reg.placementTest.result}</strong></p>
                      {reg.placementTest.score != null && <p><span className="text-gray-500">Skor:</span> <strong>{reg.placementTest.score}</strong></p>}
                    </>
                  )}
                </div>
                <form onSubmit={handleUpdateTestResult} className="space-y-3">
                  <p className="text-xs font-semibold text-gray-600">Update Hasil Tes:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="label text-xs">Hasil</label>
                      <select name="result" className="input-field text-sm" defaultValue={reg.placementTest.result || ''}>
                        <option value="">Pilih...</option>
                        <option value="Lulus">Lulus</option>
                        <option value="Tidak Lulus">Tidak Lulus</option>
                        <option value="Perlu Evaluasi">Perlu Evaluasi</option>
                      </select>
                    </div>
                    <div>
                      <label className="label text-xs">Skor (opsional)</label>
                      <input name="score" type="number" min="0" max="100" className="input-field text-sm" defaultValue={reg.placementTest.score || ''} placeholder="0-100" />
                    </div>
                  </div>
                  <div>
                    <label className="label text-xs">Catatan</label>
                    <input name="notes" type="text" className="input-field text-sm" defaultValue={reg.placementTest.notes || ''} placeholder="Catatan tes..." />
                  </div>
                  <button type="submit" className="btn-primary text-sm">Simpan Hasil</button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleSchedulePlacement} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Tanggal Tes *</label>
                    <input type="date" className="input-field text-sm" required value={placementForm.scheduledDate} onChange={(e) => setPlacementForm((f) => ({ ...f, scheduledDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label text-xs">Metode *</label>
                    <select className="input-field text-sm" required value={placementForm.method} onChange={(e) => setPlacementForm((f) => ({ ...f, method: e.target.value }))}>
                      <option value="">Pilih...</option>
                      <option value="Offline (Langsung)">Offline (Langsung)</option>
                      <option value="Online (Zoom)">Online (Zoom)</option>
                      <option value="Online (WhatsApp Video)">Online (WhatsApp Video)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Catatan (opsional)</label>
                  <input type="text" className="input-field text-sm" placeholder="Lokasi, link, dll..." value={placementForm.notes} onChange={(e) => setPlacementForm((f) => ({ ...f, notes: e.target.value }))} />
                </div>
                <button type="submit" disabled={updatingPlacement} className="btn-primary text-sm">
                  {updatingPlacement ? <Loader2 size={14} className="animate-spin" /> : 'Jadwalkan Tes Placement'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar: Status update */}
        <div className="space-y-5">
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Update Status</h2>
            <div className="space-y-3">
              <div>
                <label className="label text-xs">Status Baru</label>
                <select className="input-field text-sm" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-xs">Catatan Admin</label>
                <textarea
                  className="input-field text-sm"
                  rows={3}
                  placeholder="Alasan penolakan, catatan, dll..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className={`flex-1 text-sm ${newStatus === 'REJECTED' ? 'btn-danger' : newStatus === 'ACCEPTED' ? 'btn-success' : 'btn-primary'}`}
                >
                  {updating ? <Loader2 size={14} className="animate-spin" /> : (
                    <>
                      {newStatus === 'REJECTED' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      Simpan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Class assignment info */}
          {reg.classAssignment && (
            <div className="card border-green-200 bg-green-50">
              <h2 className="text-sm font-semibold text-green-800 mb-2">Kelas Saat Ini</h2>
              <p className="text-sm text-green-700 font-medium">{reg.classAssignment.class.name}</p>
              <p className="text-xs text-green-600">Ustaz/ah: {reg.classAssignment.class.teacherName}</p>
              <Link to="/admin/kelas" className="text-xs text-primary-600 hover:underline mt-2 block">
                Kelola kelas →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
