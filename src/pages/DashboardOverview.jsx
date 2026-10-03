import React from 'react';
import { 
  CalendarClock, 
  CheckCircle2, 
  Clock4, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  ArrowUpRight,
  Stethoscope,
  ChevronRight
} from 'lucide-react';

export default function DashboardOverview({
  appointments,
  patients,
  doctors,
  services,
  onNavigateToQueue,
  onUpdateStatus
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.appointment_date === todayStr);

  const pendingCount = todayAppointments.filter(a => a.status === 'kutilmoqda').length;
  const confirmedCount = todayAppointments.filter(a => a.status === 'tasdiqlandi').length;
  const inProgressCount = todayAppointments.filter(a => a.status === 'qabulda').length;
  const completedCount = todayAppointments.filter(a => a.status === 'yakunlandi').length;

  // Bugungi kutilayotgan umumiy daromad
  const estimatedRevenue = todayAppointments
    .filter(a => a.status !== 'bekor_qilindi')
    .reduce((sum, item) => sum + (Number(item.service_price) || 0), 0);

  const formatPrice = (p) => {
    return new Intl.NumberFormat('uz-UZ').format(p) + " so'm";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'tasdiqlandi':
        return { label: 'Tasdiqlangan', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'qabulda':
        return { label: 'Qabulda', bg: 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse' };
      case 'yakunlandi':
        return { label: 'Yakunlandi', bg: 'bg-slate-100 text-slate-600 border-slate-200' };
      case 'bekor_qilindi':
        return { label: 'Bekor', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'kutilmoqda':
      default:
        return { label: 'Kutilmoqda', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Sahifa sarlavhasi */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Klinika Umumiy Ko'rsatkichlari
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bugungi navbatlar, bemorlar oqimi va faoliyat monitoringi
          </p>
        </div>

        <button
          onClick={onNavigateToQueue}
          className="text-xs font-bold text-cyan-700 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100/80 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Jonli navbatlar doskasiga o'tish</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Kartochkalari */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bugungi Navbatlar</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-800">{todayAppointments.length}</span>
            <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md">
              Jami bandlik
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Kutilmoqda / Yangi</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock4 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              Tasdiqlash kerak
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Qabul Jarayonida</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-sky-600">{inProgressCount + confirmedCount}</span>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
              {inProgressCount} ta kresloda
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Kutilayotgan Tushum</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-emerald-600 truncate max-w-[180px]">
              {formatPrice(estimatedRevenue)}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              Bugun
            </span>
          </div>
        </div>
      </div>

      {/* 2-Ustun: Bugungi navbatlar jadvali va Shifokorlar holati */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bugungi qabullar */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-cyan-600" />
              <span>Bugungi Qabullar Jadvali ({todayAppointments.length})</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Sana: {todayStr}</span>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Bugun uchun hali navbatlar belgilanmagan
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-2.5">Vaqt</th>
                    <th className="pb-2.5">Bemor</th>
                    <th className="pb-2.5">Xizmat</th>
                    <th className="pb-2.5">Shifokor</th>
                    <th className="pb-2.5">Holati</th>
                    <th className="pb-2.5 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {todayAppointments.map((app) => {
                    const badge = getStatusBadge(app.status);
                    return (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 font-bold text-cyan-800 whitespace-nowrap">
                          {app.start_time} - {app.end_time}
                        </td>
                        <td className="py-3">
                          <span className="font-bold text-slate-800 block">{app.patient_name}</span>
                          <span className="text-[11px] text-slate-400">{app.patient_phone}</span>
                        </td>
                        <td className="py-3">
                          <span className="font-medium text-slate-700 block max-w-[160px] truncate">
                            {app.service_name}
                          </span>
                          <span className="text-[10px] text-slate-400">{formatPrice(app.service_price)}</span>
                        </td>
                        <td className="py-3 font-medium text-slate-600 whitespace-nowrap">
                          {app.doctor_name}
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">
                          {app.status === 'kutilmoqda' && (
                            <button
                              onClick={() => onUpdateStatus(app.id, 'tasdiqlandi')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
                            >
                              Tasdiqlash
                            </button>
                          )}
                          {app.status === 'tasdiqlandi' && (
                            <button
                              onClick={() => onUpdateStatus(app.id, 'qabulda')}
                              className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
                            >
                              Qabulga olish
                            </button>
                          )}
                          {app.status === 'qabulda' && (
                            <button
                              onClick={() => onUpdateStatus(app.id, 'yakunlandi')}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer"
                            >
                              Yakunlash
                            </button>
                          )}
                          {app.status === 'yakunlandi' && (
                            <span className="text-[11px] font-semibold text-emerald-600">✓ Bajarildi</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* O'ng taraf: Shifokorlar va qabulxona statusi */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center justify-between">
              <span>Shifokorlar Yuklamasi</span>
              <span className="text-xs font-semibold text-slate-400">{doctors.length} mutaxassis</span>
            </h3>

            <div className="space-y-3">
              {doctors.map((doc) => {
                const docAppointmentsCount = todayAppointments.filter(a => a.doctor_id === doc.id).length;
                return (
                  <div key={doc.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <img
                      src={doc.photo_url}
                      alt={doc.full_name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-800 truncate">{doc.full_name}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{doc.specialty}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-cyan-700 bg-cyan-100/60 px-2 py-0.5 rounded-md block">
                        {docAppointmentsCount} ta
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block">bugun</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-900 to-teal-900 text-white rounded-2xl p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
              Avtomatlashtirish
            </span>
            <h4 className="font-bold text-sm">Telegram Xabarnomalar</h4>
            <p className="text-xs text-cyan-100/80 leading-relaxed">
              Bemor navbat olganda yoki shifokor qabulni tasdiqlaganda, Telegram bot orqali avtomatik SMS/Bildirishnoma yuboriladi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
