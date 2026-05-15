import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, DollarSign, ChevronRight, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/programs').then((r) => setPrograms(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="page-title">Program Pembelajaran</h1>
        <p className="page-subtitle">Pilih program yang sesuai dengan kemampuan dan kebutuhan Anda</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((p) => (
            <div key={p.id} className="card hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-primary-100 rounded-xl">
                  <BookOpen className="text-primary-600" size={22} />
                </div>
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                  Tersedia
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{p.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">{p.description}</p>
              <div className="space-y-2 mb-5 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={15} className="text-gray-400 shrink-0" />
                  <span>{p.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={15} className="text-gray-400 shrink-0" />
                  <span>Kapasitas: {p.capacity} santri</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-primary-700">
                  <DollarSign size={15} />
                  <span>Infaq: {fmt(p.fee)}/bulan</span>
                </div>
              </div>
              <Link
                to={`/daftar?program=${p.id}`}
                className="btn-primary mt-auto"
              >
                Daftar Program Ini
                <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
