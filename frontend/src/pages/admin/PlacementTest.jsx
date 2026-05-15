import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, CalendarDays } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminPlacementTest() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('need_schedule'); // need_schedule | scheduled

  useEffect(() => {
    const status = tab === 'need_schedule' ? 'PAYMENT_VERIFIED' : 'PLACEMENT_SCHEDULED';
    setLoading(true);
    api.get(`/admin/registrations?status=${status}`).then((r) => setRegistrations(r.data)).finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="page-title">Manajemen Placement Test</h1>
        <p className="page-subtitle">Jadwalkan dan pantau tes kemampuan bacaan santri</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        {[
          { key: 'need_schedule', label: 'Perlu Dijadwalkan' },
          { key: 'scheduled', label: 'Sudah Dijadwalkan' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : registrations.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <CalendarDays size={40} className="mx-auto mb-3 text-gray-300" />
          <p>Tidak ada pendaftaran di kategori ini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map((r) => (
            <div key={r.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{r.santriName}</p>
                  <p className="text-sm text-gray-500">{r.program.name} · Level: {r.readingLevel}</p>
                  <p className="text-xs text-gray-400">Wali: {r.parentName} ({r.parentPhone})</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={r.status} />
                  <Link to={`/admin/pendaftaran/${r.id}`} className="btn-primary text-sm py-1.5">
                    {tab === 'need_schedule' ? 'Jadwalkan Tes' : 'Lihat Detail'}
                  </Link>
                </div>
              </div>

              {r.placementTest && (
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Tanggal</p>
                    <p className="font-medium">{new Date(r.placementTest.scheduledDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Metode</p>
                    <p className="font-medium">{r.placementTest.method}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Hasil</p>
                    <p className="font-medium">{r.placementTest.result || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Skor</p>
                    <p className="font-medium">{r.placementTest.score != null ? r.placementTest.score : '—'}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
