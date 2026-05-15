import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, BookOpen, CheckCircle, Clock, PlusCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import api from '../../api/axios';

export default function SantriDashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/registrations/my').then((r) => setRegistrations(r.data)).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: registrations.length,
    pending: registrations.filter((r) => ['PENDING', 'PAYMENT_VERIFIED', 'PLACEMENT_SCHEDULED'].includes(r.status)).length,
    accepted: registrations.filter((r) => r.status === 'ACCEPTED').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="page-title">Assalamu'alaikum, {user?.name?.split(' ')[0]}!</h1>
        <p className="page-subtitle">Kelola pendaftaran santri Anda dari sini.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FileText className="text-blue-600" size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Pendaftaran</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-xl">
            <Clock className="text-yellow-600" size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-sm text-gray-500">Sedang Diproses</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <CheckCircle className="text-green-600" size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.accepted}</p>
            <p className="text-sm text-gray-500">Diterima</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/daftar" className="btn-primary">
          <PlusCircle size={18} />
          Daftar Program Baru
        </Link>
        <Link to="/program" className="btn-secondary">
          <BookOpen size={18} />
          Lihat Program
        </Link>
      </div>

      {/* Registrations */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Pendaftaran</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary-600" size={28} />
          </div>
        ) : registrations.length === 0 ? (
          <div className="card text-center py-14">
            <FileText className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 mb-4">Belum ada pendaftaran</p>
            <Link to="/daftar" className="btn-primary">
              Daftar Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((reg) => (
              <div key={reg.id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{reg.santriName}</p>
                    <p className="text-sm text-gray-500">{reg.program.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Didaftarkan:{' '}
                      {new Date(reg.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={reg.status} />
                    <Link to={`/pendaftaran/${reg.id}`} className="text-sm text-primary-600 hover:underline font-medium">
                      Detail →
                    </Link>
                  </div>
                </div>

                {/* Class info */}
                {reg.status === 'ACCEPTED' && reg.classAssignment && (
                  <div className="mt-3 pt-3 border-t border-gray-100 bg-green-50 -mx-6 -mb-6 px-6 pb-4 rounded-b-xl">
                    <p className="text-sm font-semibold text-green-800">
                      Kelas: {reg.classAssignment.class.name}
                    </p>
                    <p className="text-xs text-green-700">
                      Ustaz/ah: {reg.classAssignment.class.teacherName} · {reg.classAssignment.class.schedule}
                    </p>
                  </div>
                )}

                {/* Placement test info */}
                {reg.status === 'PLACEMENT_SCHEDULED' && reg.placementTest && (
                  <div className="mt-3 pt-3 border-t border-gray-100 bg-purple-50 -mx-6 -mb-6 px-6 pb-4 rounded-b-xl">
                    <p className="text-sm font-semibold text-purple-800">
                      Tes Placement:{' '}
                      {new Date(reg.placementTest.scheduledDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-purple-700">Metode: {reg.placementTest.method}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
