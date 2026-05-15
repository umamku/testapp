import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, CheckCircle, XCircle, Clock, BarChart2, Download, Loader2 } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import api from '../../api/axios';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    window.open('/api/admin/export', '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Dashboard Admin</h1>
          <p className="page-subtitle">Ringkasan aktivitas Lembaga Qur'an</p>
        </div>
        <button onClick={handleExport} className="btn-secondary text-sm">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} value={stats.total} label="Total Pendaftaran" color="bg-blue-500" />
        <StatCard icon={Clock} value={stats.pending} label="Menunggu Verifikasi" color="bg-yellow-500" />
        <StatCard icon={CheckCircle} value={stats.accepted} label="Diterima" color="bg-green-500" />
        <StatCard icon={XCircle} value={stats.rejected} label="Ditolak" color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Users} value={stats.userCount} label="Total Wali/Santri" color="bg-purple-500" />
        <StatCard icon={BarChart2} value={stats.programCount} label="Program Aktif" color="bg-indigo-500" />
        <StatCard icon={Clock} value={stats.paymentVerified + stats.placementScheduled} label="Sedang Diproses" color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program stats */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Pendaftar per Program</h2>
          <div className="space-y-3">
            {stats.programStats.map((p) => (
              <div key={p.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 truncate">{p.name}</span>
                  <span className="font-semibold text-gray-900 ml-2">{p._count.registrations}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{
                      width: stats.total > 0 ? `${(p._count.registrations / stats.total) * 100}%` : '0%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent registrations */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Pendaftaran Terbaru</h2>
            <Link to="/admin/pendaftaran" className="text-xs text-primary-600 hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentRegistrations.map((r) => (
              <Link
                key={r.id}
                to={`/admin/pendaftaran/${r.id}`}
                className="flex items-start justify-between gap-3 hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.santriName}</p>
                  <p className="text-xs text-gray-500 truncate">{r.program.name}</p>
                </div>
                <StatusBadge status={r.status} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
