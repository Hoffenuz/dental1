import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  UserCheck, 
  Plus,
  Phone,
  MessageSquare
} from 'lucide-react';

export default function LiveQueue({
  appointments,
  doctors,
  services,
  onUpdateStatus,
  onOpenNewBooking
}) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatPrice = (p) => new Intl.NumberFormat('uz-UZ').format(p) + " so'm";

  const filteredAppointments = appointments.filter(app => {
    const matchesDate = !selectedDate || app.appointment_date === selectedDate;
    const matchesDoctor = selectedDoctor === 'all' || app.doctor_id === selectedDoctor;
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    const matchesSearch = app.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.patient_phone.includes(searchQuery);
    return matchesDate && matchesDoctor && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'tasdiqlandi':
        return { label: 'Tasdiqlangan', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'qabulda':
        return { label: 'Hozir qabulda', bg: 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse' };
      case 'yakunlandi':
        return { label: 'Yakunlangan', bg: 'bg-slate-100 text-slate-600 border-slate-200' };
      case 'bekor_qilindi':
        return { label: 'Bekor qilingan', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'kutilmoqda':
      default:
        return { label: 'Kutilmoqda', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  return (
    <div className="space-y-5">
      {/* Sarlavha va tezkor qo'shish */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Jonli Navbatlar Doskasi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Barcha sanalar va shifokorlar bo'yicha qabullarni boshqarish
          </p>
        </div>

        <button
          onClick={onOpenNewBooking}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Navbat qo'shish (Telefon/Qabulxona)</span>
        </button>
      </div>

      {/* Filterlar paneli */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Sana tanlash */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Sana
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
            />
          </div>

          {/* Shifokor tanlash */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Shifokor
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Barcha shifokorlar</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.full_name}</option>
              ))}
            </select>
          </div>

          {/* Holat tanlash */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Holati
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Barcha holatlar</option>
              <option value="kutilmoqda">Kutilmoqda</option>
              <option value="tasdiqlandi">Tasdiqlangan</option>
              <option value="qabulda">Hozir qabulda</option>
              <option value="yakunlandi">Yakunlangan</option>
              <option value="bekor_qilindi">Bekor qilingan</option>
            </select>
          </div>

          {/* Qidiruv */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Bemor qidirish
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ism yoki telefon..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navbatlar ro'yxati */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-700">
            Topilgan qabullar: <span className="text-cyan-700">{filteredAppointments.length} ta</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {selectedDate || "Barcha sanalar"}
          </span>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Ushbu filter bo'yicha hech qanday navbat topilmadi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Sana va Soat</th>
                  <th className="py-3 px-4">Bemor ma'lumotlari</th>
                  <th className="py-3 px-4">Xizmat va Narx</th>
                  <th className="py-3 px-4">Shifokor</th>
                  <th className="py-3 px-4">Manba</th>
                  <th className="py-3 px-4">Holati</th>
                  <th className="py-3 px-4 text-right">Harakatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAppointments.map((app) => {
                  const badge = getStatusBadge(app.status);

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 block text-sm">
                          {app.start_time} - {app.end_time}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {app.appointment_date}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{app.patient_name}</span>
                        <a 
                          href={`tel:${app.patient_phone}`}
                          className="text-[11px] text-cyan-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          {app.patient_phone}
                        </a>
                        {app.patient_complaint && (
                          <span className="text-[10px] text-slate-500 italic block mt-0.5 max-w-[200px] truncate">
                            "{app.patient_complaint}"
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{app.service_name}</span>
                        <span className="text-[11px] font-bold text-teal-700">
                          {formatPrice(app.service_price)}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-700 block">{app.doctor_name}</span>
                        <span className="text-[10px] text-slate-400">{app.doctor_specialty}</span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          app.created_via === 'webapp' 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-purple-50 text-purple-700'
                        }`}>
                          {app.created_via === 'webapp' ? 'Telegram WebApp' : 'Qabulxona/Tel'}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {app.status === 'kutilmoqda' && (
                            <button
                              onClick={() => onUpdateStatus(app.id, 'tasdiqlandi')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                              title="Tasdiqlash"
                            >
                              Tasdiqlash
                            </button>
                          )}
                          {app.status === 'tasdiqlandi' && (
                            <button
                              onClick={() => onUpdateStatus(app.id, 'qabulda')}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                              title="Qabul boshlandi"
                            >
                              Qabulga olish
                            </button>
                          )}
                          {app.status === 'qabulda' && (
                            <button
                              onClick={() => onUpdateStatus(app.id, 'yakunlandi')}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                              title="Davolash yakunlandi"
                            >
                              Yakunlash
                            </button>
                          )}
                          {app.status !== 'bekor_qilindi' && app.status !== 'yakunlandi' && (
                            <button
                              onClick={() => onUpdateStatus(app.id, 'bekor_qilindi')}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold cursor-pointer"
                              title="Navbatni bekor qilish"
                            >
                              Bekor qilish
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
