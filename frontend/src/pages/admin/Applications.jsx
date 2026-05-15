import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Loader2, Download } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import api from '../../api/axios';

const STATUSES = [
  { value: '', label: 'Semua Status' },
  { value: 'PENDING', label: 'Menunggu Verifikasi' },
  { value: 'PAYMENT_VERIFIED', label: 'Pembayaran Diverifikasi' },
  { value: 'PLACEMENT_SCHEDULED', label: 'Jadwal Placement' },
  { value: 'ACCEPTED', label: 'Diterima' },
  { value: 'REJECTED', label: 'Ditolak' },
];

export default function AdminApplications() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [programs, setPrograms] = useState([]);
  const [programId, setProgramId] = useState('');

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    if (programId) params.set('programId', programId);
    api.get(`/admin/registrations?${params}`).then((r) => setRegistrations(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/programs/all').then((r) => setPrograms(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchData();
  }, [status, programId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    window.open(`/api/admin/export?${params}`, '_blank');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Manajemen Pendaftaran</h1>
          <p className="page-subtitle">
            {registrations.length} pendaftaran ditemukan
          </p>
        </div>
        <button onClick={handleExport} className="btn-secondary text-sm">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input-field pl-9"
                placeholder="Cari nama santri, orang tua, atau nomor WA..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary">Cari</button>
          </form>

          <select
            className="input-field md:w-48"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <select
            className="input-field md:w-48"
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
          >
            <option value="">Semua Program</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Santri</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Program</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Orang Tua</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dokumen</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      Tidak ada data pendaftaran
                    </td>
                  </tr>
                ) : (
                  registrations.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{r.santriName}</p>
                        <p className="text-xs text-gray-500">{r.santriGender} · {r.education}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{r.program.name}</td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700">{r.parentName}</p>
                        <p className="text-xs text-gray-500">{r.parentPhone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs ${r.documentUrl ? 'text-green-600' : 'text-gray-400'}`}>
                            {r.documentUrl ? '✓ Dokumen' : '— Dokumen'}
                          </span>
                          <span className={`text-xs ${r.paymentProofUrl ? 'text-green-600' : 'text-red-500'}`}>
                            {r.paymentProofUrl ? '✓ Bukti Bayar' : '✗ Bukti Bayar'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/admin/pendaftaran/${r.id}`} className="text-primary-600 hover:underline font-medium text-xs">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
