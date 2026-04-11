import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-emerald-500 p-5 flex flex-col gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-emerald-900">{value}</p>
        <p className="text-sm text-emerald-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ActivityRow({ name, action, time }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-emerald-50 last:border-0">
      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-semibold shrink-0">
        {name.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700">{name}</p>
        <p className="text-xs text-slate-400">{action}</p>
      </div>
      <span className="text-xs text-slate-300 shrink-0">{time}</span>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthenticatedLayout title="Dashboard">
      <Head title="Dashboard" />

      {/* Welcome banner */}
      <div className="rounded-2xl bg-emerald-600 p-6 mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <p className="text-emerald-100 text-sm mb-1">Assalamu'alaikum 👋</p>
          <h2 className="text-white text-xl font-bold">Ahmad Hasan</h2>
          <p className="text-emerald-100 text-sm mt-1">
            Selamat datang di NurStore — Toko Perlengkapan Muslim Digital
          </p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-emerald-100 text-xs">Waktu Sholat Berikutnya</p>
          <p className="text-white text-2xl font-bold mt-1">Ashar · 15:22</p>
          <p className="text-emerald-100 text-xs mt-0.5">Sisa 1 jam 14 menit</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Produk"     value="486"        icon="🛍️" />
        <StatCard label="Pesanan Hari Ini" value="24"         icon="📦" />
        <StatCard label="Pendapatan"       value="Rp 8,2 jt"  icon="💰" />
        <StatCard label="Pelanggan"        value="1.340"      icon="👥" />
      </div>

      {/* Content row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-emerald-500 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-emerald-900">Pesanan Terbaru</h3>
            <button className="text-xs text-emerald-500 hover:underline">Lihat semua</button>
          </div>
          <ActivityRow name="Budi Santoso"   action="Memesan Sajadah Premium · Rp 150.000"  time="2 mnt lalu" />
          <ActivityRow name="Siti Rahmah"    action="Memesan Al-Qur'an Tajwid · Rp 85.000"  time="18 mnt lalu" />
          <ActivityRow name="Agus Prayitno"  action="Memesan Gamis Pria Koko · Rp 320.000"  time="1 jam lalu" />
          <ActivityRow name="Rina Wulandari" action="Memesan Mukena Bordir · Rp 210.000"    time="2 jam lalu" />
          <ActivityRow name="Hendra Kusuma"  action="Memesan Tasbih Kayu 99 · Rp 45.000"   time="3 jam lalu" />
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-emerald-500 p-5">
          <h3 className="text-sm font-semibold text-emerald-900 mb-4">Aksi Cepat</h3>
          <div className="space-y-2">
            {[
              { label: 'Tambah Produk Baru',  emoji: '➕' },
              { label: 'Kelola Pesanan',       emoji: '📦' },
              { label: 'Lihat Stok Menipis',  emoji: '⚠️' },
              { label: 'Buat Promo',           emoji: '🏷️' },
              { label: 'Cetak Laporan',        emoji: '🖨️' },
            ].map(({ label, emoji }) => (
              <button
                key={label}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-500 text-emerald-700 text-sm font-medium transition-colors text-left"
              >
                <span className="text-base">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </AuthenticatedLayout>
  );
}
