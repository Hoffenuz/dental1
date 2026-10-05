import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  FileText, 
  Sparkles, 
  X,
  Save,
  CheckCircle2,
  Pencil,
  Trash2
} from 'lucide-react';
import DentalChart from '../components/DentalChart';

export default function PatientsCRM({
  patients = [],
  appointments = [],
  dentalRecords = {},
  doctors = [],
  onSavePatient,
  onDeletePatient,
  onUpdateTooth,
  onDeleteTooth
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(patients[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Tahrirlash formasi
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editGender, setEditGender] = useState('erkak');
  const [editAllergies, setEditAllergies] = useState('');
  const [editMedicalNotes, setEditMedicalNotes] = useState('');

  useEffect(() => {
    if (!selectedPatient && patients && patients.length > 0) {
      setSelectedPatient(patients[0]);
    }
  }, [patients, selectedPatient]);

  // Yangi bemor formasi
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newGender, setNewGender] = useState('erkak');
  const [newAllergies, setNewAllergies] = useState('');
  const [newMedicalNotes, setNewMedicalNotes] = useState('');

  const filteredPatients = (patients || []).filter(p => {
    const name = (p.full_name || '').toLowerCase();
    const phone = p.phone || '';
    const q = (searchQuery || '').toLowerCase();
    return name.includes(q) || phone.includes(q);
  });

  const handleCreatePatient = (e) => {
    e.preventDefault();
    if (!newFullName || !newPhone) return;

    const created = {
      full_name: newFullName,
      phone: newPhone,
      birth_date: newBirthDate,
      gender: newGender,
      allergies: newAllergies || 'Yo\'q',
      medical_notes: newMedicalNotes || ''
    };

    onSavePatient(created);
    setShowAddModal(false);
    setNewFullName('');
    setNewPhone('');
    setNewBirthDate('');
    setNewAllergies('');
    setNewMedicalNotes('');
  };

  const openEditModal = () => {
    if (!selectedPatient) return;
    setEditFullName(selectedPatient.full_name || '');
    setEditPhone(selectedPatient.phone || '');
    setEditBirthDate(selectedPatient.birth_date || '');
    setEditGender(selectedPatient.gender || 'erkak');
    setEditAllergies(selectedPatient.allergies === "Yo'q" ? '' : (selectedPatient.allergies || ''));
    setEditMedicalNotes(selectedPatient.medical_notes || '');
    setShowEditModal(true);
  };

  const handleUpdatePatient = (e) => {
    e.preventDefault();
    if (!selectedPatient || !editFullName || !editPhone) return;

    const updated = {
      ...selectedPatient,
      full_name: editFullName,
      phone: editPhone,
      birth_date: editBirthDate,
      gender: editGender,
      allergies: editAllergies || "Yo'q",
      medical_notes: editMedicalNotes || ''
    };

    onSavePatient(updated);
    setSelectedPatient(updated);
    setShowEditModal(false);
  };

  const handleDeleteCurrentPatient = () => {
    if (!selectedPatient) return;
    const confirmDelete = window.confirm(`"${selectedPatient.full_name}" bemor kartasi va barcha tish ma'lumotlarini bazadan o'chirishni tasdiqlaysizmi?`);
    if (confirmDelete) {
      const pId = selectedPatient.id;
      if (onDeletePatient) {
        onDeletePatient(pId);
      }
      const remaining = patients.filter(p => p.id !== pId);
      setSelectedPatient(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const patientAppointments = appointments.filter(a => 
    a.patient_id === selectedPatient?.id || a.patient_phone === selectedPatient?.phone
  );

  return (
    <div className="space-y-5">
      {/* Sarlavha va yangi bemor tugmasi */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Bemorlar Kartotekasi (Dental CRM)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bemorlar tarixi, 32 tish xaritasi va davolash ma'lumotlari
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Bemor Qo'shish</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chap qism: Bemorlar ro'yxati */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Bemor ismi yoki telefoni..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Bemor topilmadi
              </div>
            ) : (
              filteredPatients.map(patient => {
                const isSelected = selectedPatient?.id === patient.id;
                const pRecords = dentalRecords[patient.id] || {};
                const problemCount = Object.values(pRecords).filter(r => r && r.condition && r.condition !== 'soglom').length;

                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50/50 shadow-xs ring-1 ring-cyan-500/20'
                        : 'border-slate-100 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-800">{patient.full_name}</h4>
                      <span className="text-[10px] font-bold text-cyan-700 bg-cyan-100/70 px-1.5 py-0.5 rounded">
                        {patient.total_visits || 0} marta
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {patient.phone}
                    </p>

                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {problemCount > 0 ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/70 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <span>🦷</span>
                          <span>{problemCount} ta muammo</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <span>🦷</span>
                          <span>Sog'lom</span>
                        </span>
                      )}

                      {patient.allergies && patient.allergies !== 'Yo\'q' && (
                        <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {patient.allergies}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* O'ng qism: Tanlangan bemor kartasi va Tish xaritasi */}
        <div className="lg:col-span-8 space-y-5">
          {selectedPatient ? (
            <>
              {/* Bemor anketasi */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white font-black text-base flex items-center justify-center">
                      {selectedPatient.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        {selectedPatient.full_name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Jinsi: {selectedPatient.gender || 'Belgilanmagan'} • Tug'ilgan sana: {selectedPatient.birth_date || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-600 block">{selectedPatient.phone}</span>
                      {selectedPatient.telegram_username && (
                        <span className="text-[11px] text-cyan-600 font-medium block">
                          @{selectedPatient.telegram_username}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                      <button
                        type="button"
                        onClick={openEditModal}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-slate-200"
                        title="Bemor ma'lumotlarini tahrirlash"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Tahrirlash</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteCurrentPatient}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-rose-200"
                        title="Bemorni o'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tibbiy ogohlantirishlar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-1">
                    <span className="font-bold text-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Allergik sezgirlik:
                    </span>
                    <p className="text-rose-700 text-[11px]">
                      {selectedPatient.allergies || 'Allergiya qayd etilmagan'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-600" />
                      Umumiy kasalliklar / Izoh:
                    </span>
                    <p className="text-slate-600 text-[11px]">
                      {selectedPatient.medical_notes || 'Qo\'shimcha tashxislar kiritilmagan'}
                    </p>
                  </div>
                </div>
              </div>

              {/* INTERAKTIV 32 TISH XARITASI (DENTAL CHART) */}
              <DentalChart
                patientId={selectedPatient.id}
                patientName={selectedPatient.full_name}
                records={dentalRecords[selectedPatient.id] || {}}
                doctors={doctors}
                onUpdateTooth={onUpdateTooth}
                onDeleteTooth={onDeleteTooth}
              />

              {/* Bemorning qabullar tarixi */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Tashriflar Tarixi ({patientAppointments.length})
                </h4>

                {patientAppointments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">Ushbu bemor hali qabulga kelmagan</p>
                ) : (
                  <div className="space-y-2">
                    {patientAppointments.map(app => (
                      <div key={app.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div>
                          <span className="font-bold text-slate-800 block">{app.service_name}</span>
                          <span className="text-[11px] text-slate-500">{app.doctor_name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-slate-700 block">{app.appointment_date} {app.start_time}</span>
                          <span className="text-[10px] font-bold text-cyan-700 uppercase">{app.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Ko'rish uchun chap tomondan bemorni tanlang
            </div>
          )}
        </div>
      </div>

      {/* Yangi bemor qo'shish modali */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">Yangi Bemor Kartochkasi Ochish</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3 mt-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ism va Familiya *
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Masalan: Sardor Rustamov"
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
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tug'ilgan Sana
                  </label>
                  <input
                    type="date"
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Jinsi
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="erkak">Erkak</option>
                    <option value="ayol">Ayol</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Allergiya (Dori yoki anestezik vositalar)
                </label>
                <input
                  type="text"
                  value={newAllergies}
                  onChange={(e) => setNewAllergies(e.target.value)}
                  placeholder="Masalan: Penitsillinga allergiya yoki Yo'q"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Shikoyat yoki tibbiy yozuv
                </label>
                <textarea
                  rows={2}
                  value={newMedicalNotes}
                  onChange={(e) => setNewMedicalNotes(e.target.value)}
                  placeholder="Klinik tashxis yoki bemor shikoyati..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Bemor Kartasini Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bemor ma'lumotlarini tahrirlash modali */}
      {showEditModal && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">Bemor Ma'lumotlarini Tahrirlash</h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePatient} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Bemorning F.I.SH *
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Ism Familiya"
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
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tug'ilgan sana
                  </label>
                  <input
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Jinsi
                  </label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="erkak">Erkak</option>
                    <option value="ayol">Ayol</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Allergiya (Dori yoki anestezik vositalar)
                </label>
                <input
                  type="text"
                  value={editAllergies}
                  onChange={(e) => setEditAllergies(e.target.value)}
                  placeholder="Masalan: Penitsillinga allergiya yoki Yo'q"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Shikoyat yoki tibbiy yozuv
                </label>
                <textarea
                  rows={2}
                  value={editMedicalNotes}
                  onChange={(e) => setEditMedicalNotes(e.target.value)}
                  placeholder="Klinik tashxis yoki bemor shikoyati..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  O'zgarishlarni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
