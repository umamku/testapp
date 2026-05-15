import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ChevronRight, Shield, Award, Users, Star } from 'lucide-react';
import api from '../api/axios';

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export default function LandingPage() {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    api
      .get('/programs')
      .then((res) => setPrograms(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPrograms([]));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-green-500 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm mb-6">
            <Star size={14} className="text-yellow-300" />
            Lembaga Qur'an Terpercaya
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Belajar Al-Qur'an dengan <br />
            <span className="text-yellow-300">Metode Terbaik</span>
          </h1>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Bergabunglah bersama ratusan santri yang telah merasakan manfaat program pembelajaran Al-Qur'an kami.
            Daftar sekarang dan mulai perjalanan spiritual Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors text-base">
              Daftar Sekarang
            </Link>
            <Link to="/program" className="border border-white/50 text-white px-8 py-3 rounded-xl hover:bg-white/10 transition-colors text-base">
              Lihat Program
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: '500+', label: 'Santri Aktif' },
            { val: '4', label: 'Program Unggulan' },
            { val: '98%', label: 'Tingkat Kepuasan' },
            { val: '10+', label: 'Tahun Berpengalaman' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-primary-600">{s.val}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs preview */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Program Unggulan</h2>
            <p className="text-gray-500 mt-2">Pilih program yang sesuai dengan kebutuhan Anda</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {programs.slice(0, 4).map((p) => (
              <div key={p.id} className="card hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <BookOpen className="text-primary-600" size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900">{p.name}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">{p.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Clock size={13} />
                  <span>{p.schedule}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary-700">{formatRupiah(p.fee)}/bln</span>
                  <Link to={`/daftar?program=${p.id}`} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                    Daftar <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/program" className="btn-secondary">
              Lihat Semua Program
            </Link>
          </div>
        </div>
      </section>

      {/* Alur Pendaftaran */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Alur Pendaftaran</h2>
            <p className="text-gray-500 mt-2">Mudah, cepat, dan transparan</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: '1', icon: Users, title: 'Buat Akun', desc: 'Daftar menggunakan email dan nomor WhatsApp Anda.' },
              { n: '2', icon: BookOpen, title: 'Isi Formulir', desc: 'Pilih program, lengkapi data santri, dan unggah dokumen.' },
              { n: '3', icon: Award, title: 'Verifikasi & Masuk Kelas', desc: 'Admin memverifikasi, jadwal tes placement, dan Anda resmi diterima.' },
            ].map((step) => (
              <div key={step.n} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-2xl mb-4">
                  <step.icon className="text-primary-600" size={28} />
                </div>
                <div className="inline-block bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 leading-5 mb-2">
                  {step.n}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-700 text-white py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <Shield size={48} className="mx-auto mb-4 text-primary-200" />
          <h2 className="text-3xl font-bold mb-3">Mulai Perjalanan Qur'ani Anda</h2>
          <p className="text-primary-200 mb-6">Daftarkan diri atau anak Anda sekarang dan dapatkan bimbingan terbaik dari tenaga pengajar berpengalaman.</p>
          <Link to="/register" className="bg-white text-primary-700 font-bold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
            Daftar Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-sm py-8 px-4 text-center">
        <p>© 2026 Lembaga Qur'an. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
}
