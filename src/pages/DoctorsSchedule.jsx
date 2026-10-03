import React, { useState } from 'react';
import { UserCog, Plus, Clock, Star, Phone, Award, MapPin, X, Save, Check } from 'lucide-react';

export default function DoctorsSchedule({ doctors, onSaveDoctor }) {
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState(5);
  const [roomNumber, setRoomNumber] = useState('Xona 1');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');

  const openAddModal = () => {
    setEditingDoctor(null);
    setFullName('');
    setSpecialty('');
    setExperience(5);
    setRoomNumber('Xona 1');
    setPhone('');
    setPhotoUrl('https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80');
    setBio('');
    setShowModal(true);
  };

  const openEditModal = (doctor) => {
    setEditingDoctor(doctor);
    setFullName(doctor.full_name);
    setSpecialty(doctor.specialty);
    setExperience(doctor.experience_years);
    setRoomNumber(doctor.room_number || 'Xona 1');
    setPhone(doctor.phone || '');
    setPhotoUrl(doctor.photo_url || '');
    setBio(doctor.bio || '');
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!fullName || !specialty) return;

    onSaveDoctor({
      id: editingDoctor?.id,
      full_name: fullName,
      specialty,
      experience_years: Number(experience) || 1,
      room_number: roomNumber,
      phone,
      photo_url: photoUrl,
      bio,
      rating: editingDoctor?.rating || 5.0,
      is_active: true
    });

    setShowModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Shifokorlar va Ish Jadvallari
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Stomatolog mutaxassislar ro'yxati va ularning ish vaqti
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Shifokor Qo'shish</span>
        </button>
      </div>

      {/* Shifokorlar kartochkalari to'plami */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map(doctor => (
          <div
            key={doctor.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
          >
            <div className="flex items-start gap-4">
              <img
                src={doctor.photo_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'}
                alt={doctor.full_name}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-2xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800 truncate">
                    {doctor.full_name}
                  </h3>
                  <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {doctor.rating}
                  </span>
                </div>

                <p className="text-xs font-medium text-cyan-700 mt-0.5">
                  {doctor.specialty}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    {doctor.experience_years} yillik tajriba
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {doctor.room_number || 'Xona 1'}
                  </span>
                </div>
              </div>
            </div>

            {doctor.bio && (
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                {doctor.bio}
              </p>
            )}

            {/* Ish jadvali qisqacha ko'rinishi */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>09:00 - 18:00 (Dush - Shan)</span>
              </div>

              <button
                onClick={() => openEditModal(doctor)}
                className="text-xs font-bold text-cyan-600 hover:text-cyan-700 hover:underline cursor-pointer"
              >
                Tahrirlash
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Shifokor qo'shish / tahrirlash modali */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">
                {editingDoctor ? 'Shifokor Ma\'lumotlarini Tahrirlash' : 'Yangi Shifokor Qo\'shish'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 mt-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  F.I.SH (Shifokor ismi) *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Sardor Karimov"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mutaxassisligi *
                </label>
                <input
                  type="text"
                  required
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Terapevt-Stomatolog, Ortodont..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tajriba (yil)
                  </label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Xona Raqami
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="Xona 2"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Telefon Raqami
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Fotosurat URL manzili
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Qisqacha Ma'lumot (Bio)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Shifokor sertifikatlari va tajribasi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
