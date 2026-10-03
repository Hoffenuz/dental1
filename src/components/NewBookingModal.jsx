import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Stethoscope, Save } from 'lucide-react';

export default function NewBookingModal({
  isOpen,
  onClose,
  doctors,
  services,
  onCreateBooking
}) {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('11:00');
  const [complaint, setComplaint] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patientName || !patientPhone) return;

    const doctor = doctors.find(d => d.id === doctorId) || doctors[0];
    const service = services.find(s => s.id === serviceId) || services[0];

    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + (service?.duration_minutes || 30);
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    onCreateBooking({
      doctor_id: doctor.id,
      doctor_name: doctor.full_name,
      doctor_specialty: doctor.specialty,
      service_id: service.id,
      service_name: service.name,
      service_price: service.price_uzs,
      appointment_date: appointmentDate,
      start_time: startTime,
      end_time: endTime,
      patient_name: patientName,
      patient_phone: patientPhone,
      patient_complaint: complaint,
      status: 'tasdiqlandi', // Admin qo'shganda avtomatik tasdiqlangan
      created_via: 'admin'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Tezkor Navbat Kiritish</h3>
            <p className="text-[11px] text-slate-500">Telefon orqali yoki qabulxonaga kelgan bemor</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Bemor Ism va Familiyasi *
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Masalan: Nodir Alimov"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Telefon Raqami *
            </label>
            <input
              type="tel"
              required
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Shifokor
              </label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Xizmat
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Qabul Sanasi
              </label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Qabul Soati
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Shikoyat / Izoh
            </label>
            <textarea
              rows={2}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="Og'riq yoki konsultatsiya maqsadi..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            ></textarea>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Navbatni Saqlash</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
