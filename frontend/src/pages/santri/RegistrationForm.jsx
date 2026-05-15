import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Upload, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const READING_LEVELS = [
  'Belum bisa sama sekali',
  "Iqro' Jilid 1",
  "Iqro' Jilid 2",
  "Iqro' Jilid 3",
  "Iqro' Jilid 4",
  "Iqro' Jilid 5",
  "Iqro' Jilid 6",
  "Al-Qur'an (lancar tapi perlu tajwid)",
  "Al-Qur'an Juz 1-5",
  "Al-Qur'an Juz 6-15",
  "Al-Qur'an Juz 16-30",
];

const EDUCATION = [
  'Belum Sekolah',
  'TK / PAUD',
  'SD / MI (Kelas 1-3)',
  'SD / MI (Kelas 4-6)',
  'SMP / MTs',
  'SMA / SMK / MA',
  'Perguruan Tinggi',
  'Umum / Dewasa',
];

const STEPS = ['Pilih Program', 'Data Santri', 'Dokumen & Pembayaran'];

export default function RegistrationForm() {
  const [step, setStep] = useState(0);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    programId: searchParams.get('program') || '',
    santriName: '',
    santriDOB: '',
    santriGender: '',
    santriAddress: '',
    education: '',
    parentName: '',
    parentPhone: '',
    readingLevel: '',
  });
  const [files, setFiles] = useState({ document: null, paymentProof: null });

  useEffect(() => {
    api.get('/programs').then((r) => setPrograms(r.data));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setFile = (k) => (e) => setFiles((f) => ({ ...f, [k]: e.target.files[0] || null }));

  const canNext = () => {
    if (step === 0) return !!form.programId;
    if (step === 1)
      return (
        form.santriName && form.santriDOB && form.santriGender &&
        form.santriAddress && form.education && form.parentName &&
        form.parentPhone && form.readingLevel
      );
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (files.document) fd.append('document', files.document);
      if (files.paymentProof) fd.append('paymentProof', files.paymentProof);

      await api.post('/registrations', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Pendaftaran berhasil dikirim!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  const selectedProgram = programs.find((p) => p.id === form.programId);
  const fmt = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="page-title mb-2">Formulir Pendaftaran</h1>
      <p className="page-subtitle mb-8">Lengkapi semua data dengan benar</p>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i < step
                    ? 'bg-primary-600 text-white'
                    : i === step
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i < step ? <CheckCircle size={16} /> : i + 1}
              </div>
              <p className={`text-xs mt-1 font-medium ${i === step ? 'text-primary-600' : 'text-gray-400'}`}>
                {label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${i < step ? 'bg-primary-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="card">
        {/* Step 0: Choose program */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Pilih Program</h2>
            {programs.map((p) => (
              <label
                key={p.id}
                className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                  form.programId === p.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="program"
                  value={p.id}
                  checked={form.programId === p.id}
                  onChange={set('programId')}
                  className="mt-1 accent-primary-600"
                />
                <div>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.schedule}</p>
                  <p className="text-sm font-bold text-primary-700 mt-1">{fmt(p.fee)}/bulan</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Step 1: Santri & parent data */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Data Santri & Orang Tua</h2>
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-gray-700 border-b pb-2 mb-3 w-full">Data Santri</legend>
              <div>
                <label className="label">Nama Lengkap Santri *</label>
                <input type="text" className="input-field" placeholder="Nama lengkap" value={form.santriName} onChange={set('santriName')} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tanggal Lahir *</label>
                  <input type="date" className="input-field" value={form.santriDOB} onChange={set('santriDOB')} required />
                </div>
                <div>
                  <label className="label">Jenis Kelamin *</label>
                  <select className="input-field" value={form.santriGender} onChange={set('santriGender')} required>
                    <option value="">Pilih...</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Alamat *</label>
                <textarea className="input-field" rows={2} placeholder="Alamat lengkap" value={form.santriAddress} onChange={set('santriAddress')} required />
              </div>
              <div>
                <label className="label">Jenjang Pendidikan *</label>
                <select className="input-field" value={form.education} onChange={set('education')} required>
                  <option value="">Pilih...</option>
                  {EDUCATION.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-gray-700 border-b pb-2 mb-3 w-full">Data Orang Tua / Wali</legend>
              <div>
                <label className="label">Nama Orang Tua / Wali *</label>
                <input type="text" className="input-field" placeholder="Nama lengkap" value={form.parentName} onChange={set('parentName')} required />
              </div>
              <div>
                <label className="label">Nomor WhatsApp *</label>
                <input type="tel" className="input-field" placeholder="08xxxxxxxxxx" value={form.parentPhone} onChange={set('parentPhone')} required />
              </div>
            </fieldset>

            <div>
              <label className="label">Riwayat Bacaan Al-Qur'an (Self-Assessment) *</label>
              <p className="text-xs text-gray-500 mb-2">Pilih kemampuan bacaan saat ini untuk membantu penempatan kelas yang tepat</p>
              <select className="input-field" value={form.readingLevel} onChange={set('readingLevel')} required>
                <option value="">Pilih kemampuan...</option>
                {READING_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Documents & Payment */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Dokumen & Bukti Pembayaran</h2>

            {selectedProgram && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm font-semibold text-blue-800">Program: {selectedProgram.name}</p>
                <p className="text-sm text-blue-700">
                  Biaya Pendaftaran:{' '}
                  <span className="font-bold">
                    {fmt(selectedProgram.fee)}
                  </span>
                </p>
                <p className="text-xs text-blue-600 mt-1">Transfer ke: BRI 1234-5678-9012 a.n. Lembaga Qur'an</p>
              </div>
            )}

            <div>
              <label className="label">Dokumen Pendukung</label>
              <p className="text-xs text-gray-500 mb-2">Upload Akta Kelahiran, Kartu Keluarga, atau pas foto (JPG/PNG/PDF, maks 5MB)</p>
              <label className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                <Upload size={24} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {files.document ? files.document.name : 'Klik untuk upload dokumen'}
                </span>
                <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={setFile('document')} />
              </label>
            </div>

            <div>
              <label className="label">Bukti Transfer Pembayaran *</label>
              <p className="text-xs text-gray-500 mb-2">Upload foto/screenshot bukti transfer (JPG/PNG/PDF, maks 5MB)</p>
              <label className={`flex flex-col items-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${
                files.paymentProof ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
              }`}>
                {files.paymentProof ? (
                  <CheckCircle size={24} className="text-green-500" />
                ) : (
                  <Upload size={24} className="text-gray-400" />
                )}
                <span className="text-sm text-gray-600">
                  {files.paymentProof ? files.paymentProof.name : 'Klik untuk upload bukti bayar'}
                </span>
                <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={setFile('paymentProof')} />
              </label>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
              ⚠️ Pendaftaran dapat dikirim tanpa bukti bayar, namun verifikasi admin memerlukan bukti pembayaran yang valid.
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="btn-secondary disabled:opacity-30"
        >
          <ChevronLeft size={18} />
          Kembali
        </button>

        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} className="btn-primary">
            Lanjut
            <ChevronRight size={18} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading || !canNext()} className="btn-primary">
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Kirim Pendaftaran'}
          </button>
        )}
      </div>
    </div>
  );
}
