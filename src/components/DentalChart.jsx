import React, { useState } from 'react';
import { Sparkles, Save, X, AlertCircle } from 'lucide-react';

// FDI World Dental Federation 32 tish raqamlanishi
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT  = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_LEFT  = [31, 32, 33, 34, 35, 36, 37, 38];

const CONDITIONS = {
  soglom: { label: "Sog'lom", color: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-300', bgLight: 'bg-emerald-50' },
  kariyes: { label: 'Kariyes', color: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-300', bgLight: 'bg-amber-50' },
  karies: { label: 'Kariyes', color: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-300', bgLight: 'bg-amber-50' },
  plomba: { label: 'Plomba', color: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-300', bgLight: 'bg-blue-50' },
  pulpa: { label: 'Ildiz kanali / Pulpa', color: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-300', bgLight: 'bg-rose-50' },
  pulpar_davolangan: { label: 'Ildiz kanali', color: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-300', bgLight: 'bg-rose-50' },
  koronka: { label: 'Koronka / Qoplama', color: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-300', bgLight: 'bg-purple-50' },
  'toj (koronka)': { label: 'Koronka', color: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-300', bgLight: 'bg-purple-50' },
  implant: { label: 'Dental Implant', color: 'bg-cyan-500', text: 'text-cyan-700', border: 'border-cyan-300', bgLight: 'bg-cyan-50' },
  olingan: { label: 'Tish olingan', color: 'bg-slate-700', text: 'text-slate-700', border: 'border-slate-400', bgLight: 'bg-slate-100' },
  olib_tashlangan: { label: 'Olib tashlangan', color: 'bg-slate-700', text: 'text-slate-700', border: 'border-slate-400', bgLight: 'bg-slate-100' }
};

export default function DentalChart({ patientId, patientName, records = {}, onUpdateTooth }) {
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [condition, setCondition] = useState('soglom');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [cost, setCost] = useState('');

  const safeRecords = records && typeof records === 'object' ? records : {};

  const openToothModal = (toothNumber) => {
    const existing = safeRecords[toothNumber] || {};
    setSelectedTooth(toothNumber);
    const cond = existing.condition || existing.status || 'soglom';
    setCondition(CONDITIONS[cond] ? cond : 'soglom');
    setDiagnosis(existing.diagnosis || '');
    setTreatment(existing.treatment_applied || existing.treatment || '');
    setCost(existing.cost || existing.cost_uzs || '');
  };

  const handleSaveTooth = (e) => {
    e.preventDefault();
    if (!selectedTooth) return;

    onUpdateTooth(patientId, selectedTooth, {
      condition,
      status: condition,
      diagnosis,
      treatment_applied: treatment,
      cost: Number(cost) || 0,
      updated_at: new Date().toISOString()
    });

    setSelectedTooth(null);
  };

  const renderToothBox = (toothNum) => {
    const data = safeRecords[toothNum];
    const toothCondition = data?.condition || data?.status || 'soglom';
    const condConfig = CONDITIONS[toothCondition] || CONDITIONS.soglom;

    return (
      <button
        key={toothNum}
        type="button"
        onClick={() => openToothModal(toothNum)}
        className={`w-10 h-14 rounded-xl border flex flex-col items-center justify-between p-1 transition-all hover:scale-105 cursor-pointer shadow-2xs ${
          data ? `${condConfig.bgLight} ${condConfig.border} ring-1 ring-${condConfig.color}/30` : 'bg-white border-slate-200 hover:border-slate-400'
        }`}
        title={`Tish #${toothNum}: ${condConfig.label}`}
      >
        <span className="text-[10px] font-bold text-slate-700">{toothNum}</span>
        <div className={`w-3.5 h-3.5 rounded-full ${condConfig.color} shadow-xs`}></div>
        <span className="text-[8px] font-medium text-slate-400 uppercase tracking-tighter truncate max-w-full">
          {toothCondition === 'soglom' ? '—' : toothCondition.slice(0, 3)}
        </span>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <span>🦷 32 Tish Xaritasi (FDI Dental Formula)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Har bir tish holatini belgilash va davolash tarixini saqlash
          </p>
        </div>

        {/* Holatlar bo'yicha ranglar shkalasi */}
        <div className="hidden lg:flex items-center gap-2.5 text-[11px]">
          {Object.entries(CONDITIONS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-full ${val.color}`}></span>
              <span className="text-slate-600 font-medium">{val.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tishlar jadvali */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
        {/* YUQORI JAG' (MAXILLA) */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
            <span>O'ng tomon (Yuqori)</span>
            <span className="bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded">Yuqori Jag' (Maxilla)</span>
            <span>Chap tomon (Yuqori)</span>
          </div>

          <div className="flex justify-center items-center gap-2 overflow-x-auto py-1">
            <div className="flex gap-1">
              {UPPER_RIGHT.map(renderToothBox)}
            </div>
            <div className="w-px h-12 bg-slate-300 mx-1"></div>
            <div className="flex gap-1">
              {UPPER_LEFT.map(renderToothBox)}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200"></div>

        {/* PASTKI JAG' (MANDIBLE) */}
        <div>
          <div className="flex justify-center items-center gap-2 overflow-x-auto py-1">
            <div className="flex gap-1">
              {LOWER_RIGHT.map(renderToothBox)}
            </div>
            <div className="w-px h-12 bg-slate-300 mx-1"></div>
            <div className="flex gap-1">
              {LOWER_LEFT.map(renderToothBox)}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-2 px-1">
            <span>O'ng tomon (Pastki)</span>
            <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded">Pastki Jag' (Mandible)</span>
            <span>Chap tomon (Pastki)</span>
          </div>
        </div>
      </div>

      {/* Tish tahrirlash modali */}
      {selectedTooth && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
                  #{selectedTooth}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">
                    Tish #{selectedTooth} Holatini Belgilash
                  </h4>
                  <p className="text-[11px] text-slate-500">Bemor: {patientName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTooth(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTooth} className="space-y-3.5 mt-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tish Holati (Status):
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(CONDITIONS).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCondition(key)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        condition === key
                          ? `${item.bgLight} ${item.border} ring-2 ring-${item.color}/40 ${item.text} font-bold`
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tashxis (Tish holati tavsifi):
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Masalan: O'rta kariyes, distal soha zararlangan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Qo'llanilgan muolaja / reja:
                </label>
                <textarea
                  rows={2}
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="Masalan: Anesteziya qilindi, kavitet tozalab svetovoy plomba qo'yildi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Xizmat qiymati (so'm):
                </label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="280000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTooth(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
