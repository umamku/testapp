import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, CheckCircle, Clock, XCircle, FileText, Upload, Loader2 } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const TIMELINE = [
  { status: 'PENDING', label: 'Pendaftaran Diterima', desc: 'Data Anda sedang menunggu verifikasi admin.' },
  { status: 'PAYMENT_VERIFIED', label: 'Pembayaran Diverifikasi', desc: 'Bukti bayar Anda telah dikonfirmasi.' },
  { status: 'PLACEMENT_SCHEDULED', label: 'Tes Placement Dijadwalkan', desc: 'Jadwal tes kemampuan bacaan telah ditetapkan.' },
  { status: 'ACCEPTED', label: 'Diterima & Kelas Ditentukan', desc: 'Selamat! Anda telah diterima dan ditempatkan di kelas.' },
];

const STATUS_ORDER = ['PENDING', 'PAYMENT_VERIFIED', 'PLACEMENT_SCHEDULED', 'ACCEPTED'];

export default function RegistrationDetail() {
  const { id } = useParams();
  const [reg, setReg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    api.get(`/registrations/${id}`).then((r) => setReg(r.data)).finally(() => setLoading(false));
  }, [id]);

  const handleUploadPayment = async () => {
    if (!file) return toast.error('Pilih file terlebih dahulu');
    setUploading(true);
    const fd = new FormData();
    fd.append('paymentProof', file);
    try {
      const { data } = await api.post(`/registrations/${id}/payment`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReg((r) => ({ ...r, paymentProofUrl: data.paymentProofUrl }));
      setFile(null);
      toast.success('Bukti bayar berhasil diunggah!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal upload');
    } finally {
      setUploading(false);
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
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-500">Pendaftaran tidak ditemukan.</p>
        <Link to="/dashboard" className="btn-primary mt-4">Kembali</Link>
      </div>
    );
  }

  const isRejected = reg.status === 'REJECTED';
  const currentIdx = STATUS_ORDER.indexOf(reg.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link to="/dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft size={16} /> Kembali ke Dashboard
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="page-title">{reg.santriName}</h1>
          <p className="text-gray-500 text-sm">{reg.program.name}</p>
        </div>
        <StatusBadge status={reg.status} />
      </div>

      {/* Timeline */}
      {!isRejected && (
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Status Pendaftaran</h2>
          <div className="space-y-4">
            {TIMELINE.map((item, i) => {
              const done = currentIdx >= i;
              const current = currentIdx === i;
              return (
                <div key={item.status} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${done ? 'bg-primary-600' : 'bg-gray-200'}`}>
                    {done ? <CheckCircle size={14} className="text-white" /> : <Clock size={12} className="text-gray-400" />}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>{item.label}</p>
                    {(done || current) && <p className="text-xs text-gray-500">{item.desc}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isRejected && (
        <div className="card mb-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
            <XCircle size={18} />
            Pendaftaran Ditolak
          </div>
          {reg.adminNotes && <p className="text-sm text-red-600">Catatan admin: {reg.adminNotes}</p>}
        </div>
      )}

      {/* Class info */}
      {reg.status === 'ACCEPTED' && reg.classAssignment && (
        <div className="card mb-6 border-green-200 bg-green-50">
          <h2 className="text-sm font-semibold text-green-800 mb-2">🎉 Informasi Kelas</h2>
          <p className="text-sm text-green-700 font-medium">{reg.classAssignment.class.name}</p>
          <p className="text-xs text-green-600">Ustaz/ah: {reg.classAssignment.class.teacherName}</p>
          <p className="text-xs text-green-600">Jadwal: {reg.classAssignment.class.schedule}</p>
        </div>
      )}

      {/* Placement test info */}
      {reg.placementTest && (
        <div className="card mb-6 border-purple-200 bg-purple-50">
          <h2 className="text-sm font-semibold text-purple-800 mb-2">📋 Tes Placement</h2>
          <p className="text-sm text-purple-700">
            Tanggal: {new Date(reg.placementTest.scheduledDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="text-xs text-purple-600">Metode: {reg.placementTest.method}</p>
          {reg.placementTest.result && (
            <p className="text-xs text-purple-600 mt-1">
              Hasil: {reg.placementTest.result}
              {reg.placementTest.score != null && ` (Skor: ${reg.placementTest.score})`}
            </p>
          )}
          {reg.placementTest.notes && <p className="text-xs text-purple-600">Catatan: {reg.placementTest.notes}</p>}
        </div>
      )}

      {/* Data santri */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Data Santri</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Program', reg.program.name],
            ['Nama Santri', reg.santriName],
            ['Jenis Kelamin', reg.santriGender],
            ['Tanggal Lahir', new Date(reg.santriDOB).toLocaleDateString('id-ID')],
            ['Pendidikan', reg.education],
            ['Nama Wali', reg.parentName],
            ['No. WA Wali', reg.parentPhone],
            ['Level Bacaan', reg.readingLevel],
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
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Dokumen</h2>
        <div className="space-y-2">
          {reg.documentUrl ? (
            <a href={reg.documentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
              <FileText size={16} />
              Lihat Dokumen Pendukung
            </a>
          ) : (
            <p className="text-sm text-gray-400">Belum ada dokumen</p>
          )}

          {reg.paymentProofUrl ? (
            <a href={reg.paymentProofUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
              <FileText size={16} />
              Lihat Bukti Pembayaran
            </a>
          ) : (
            <div>
              <p className="text-sm text-red-500 mb-2">⚠️ Bukti pembayaran belum diunggah</p>
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="text-xs"
                />
                <button onClick={handleUploadPayment} disabled={uploading || !file} className="btn-primary text-xs py-1.5">
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  Upload
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
