import React, { useState } from 'react';
import { Receipt, Plus, Clock, Check, X, Edit2 } from 'lucide-react';

export default function ServicesManager({ services, onSaveService }) {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [category, setCategory] = useState('Davolash');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceUzs, setPriceUzs] = useState('');
  const [duration, setDuration] = useState(30);

  const formatPrice = (p) => new Intl.NumberFormat('uz-UZ').format(p) + " so'm";

  const openAddModal = () => {
    setEditingService(null);
    setCategory('Davolash');
    setName('');
    setDescription('');
    setPriceUzs('');
    setDuration(30);
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setEditingService(s);
    setCategory(s.category);
    setName(s.name);
    setDescription(s.description || '');
    setPriceUzs(s.price_uzs);
    setDuration(s.duration_minutes || 30);
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name || !priceUzs) return;

    onSaveService({
      id: editingService?.id,
      category,
      name,
      description,
      price_uzs: Number(priceUzs) || 0,
      duration_minutes: Number(duration) || 30,
      is_active: true
    });

    setShowModal(false);
  };

  const toggleStatus = (s) => {
    onSaveService({
      ...s,
      is_active: !s.is_active
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Xizmatlar va Narxlar Katalogi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Stomatologik muolajalar, narxlar va qabul davomiyligi
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Xizmat Qo'shish</span>
        </button>
      </div>

      {/* Xizmatlar ro'yxati jadvali */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Kategoriya</th>
                <th className="py-3 px-4">Xizmat Nomi</th>
                <th className="py-3 px-4">Narxi (UZS)</th>
                <th className="py-3 px-4">Davomiyligi</th>
                <th className="py-3 px-4">Holati</th>
                <th className="py-3 px-4 text-right">Tahrirlash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md uppercase">
                      {s.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 block text-sm">{s.name}</span>
                    {s.description && (
                      <span className="text-[11px] text-slate-400 block max-w-sm truncate mt-0.5">
                        {s.description}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-extrabold text-slate-900 text-sm">
                    {formatPrice(s.price_uzs)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      ~{s.duration_minutes} daqiqa
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(s)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                        s.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {s.is_active ? 'Faol' : 'Nofaol'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-1.5 text-slate-400 hover:text-cyan-600 rounded-lg hover:bg-slate-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Xizmat qo'shish / tahrirlash modali */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">
                {editingService ? 'Xizmatni Tahrirlash' : 'Yangi Xizmat Qo\'shish'}
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
                  Kategoriya
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Konsultatsiya">Konsultatsiya</option>
                  <option value="Gigiyena">Gigiyena</option>
                  <option value="Davolash">Davolash</option>
                  <option value="Jarrohlik">Jarrohlik</option>
                  <option value="Ortodontiya">Ortodontiya</option>
                  <option value="Implantatsiya">Implantatsiya</option>
                  <option value="Estetika">Estetika</option>
                  <option value="Bolalar">Bolalar</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Xizmat Nomi *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Tish oqartirish"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Narxi (UZS) *
                  </label>
                  <input
                    type="number"
                    required
                    value={priceUzs}
                    onChange={(e) => setPriceUzs(e.target.value)}
                    placeholder="250000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Vaqti (daqiqa)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Xizmat haqida tavsif
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Muolaja tafsilotlari va kafolati..."
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
