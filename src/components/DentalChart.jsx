import React, { useState } from 'react';
import { 
  Sparkles, 
  Save, 
  X, 
  AlertCircle, 
  Check, 
  Trash2, 
  RotateCcw, 
  Stethoscope,
  Info,
  DollarSign,
  Calendar,
  User,
  Plus
} from 'lucide-react';

// FDI World Dental Federation 32 tish xalqaro raqamlanishi
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT  = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_LEFT  = [31, 32, 33, 34, 35, 36, 37, 38];

export const TOOTH_NAMES = {
  18: "Yuqori o'ng 3-molyar (aql tishi)",
  17: "Yuqori o'ng 2-molyar",
  16: "Yuqori o'ng 1-molyar",
  15: "Yuqori o'ng 2-premolyar",
  14: "Yuqori o'ng 1-premolyar",
  13: "Yuqori o'ng qoziq tish",
  12: "Yuqori o'ng yon kurak tish",
  11: "Yuqori o'ng markaziy kurak tish",

  21: "Yuqori chap markaziy kurak tish",
  22: "Yuqori chap yon kurak tish",
  23: "Yuqori chap qoziq tish",
  24: "Yuqori chap 1-premolyar",
  25: "Yuqori chap 2-premolyar",
  26: "Yuqori chap 1-molyar",
  27: "Yuqori chap 2-molyar",
  28: "Yuqori chap 3-molyar (aql tishi)",

  31: "Pastki chap markaziy kurak tish",
  32: "Pastki chap yon kurak tish",
  33: "Pastki chap qoziq tish",
  34: "Pastki chap 1-premolyar",
  35: "Pastki chap 2-premolyar",
  36: "Pastki chap 1-molyar",
  37: "Pastki chap 2-molyar",
  38: "Pastki chap 3-molyar (aql tishi)",

  48: "Pastki o'ng 3-molyar (aql tishi)",
  47: "Pastki o'ng 2-molyar",
  46: "Pastki o'ng 1-molyar",
  45: "Pastki o'ng 2-premolyar",
  44: "Pastki o'ng 1-premolyar",
  43: "Pastki o'ng qoziq tish",
  42: "Pastki o'ng yon kurak tish",
  41: "Pastki o'ng markaziy kurak tish"
};

export const CONDITIONS = {
  soglom: { 
    label: "Sog'lom", 
    color: 'bg-emerald-500', 
    text: 'text-emerald-700', 
    border: 'border-emerald-300', 
    bgLight: 'bg-emerald-50',
    dotColor: 'bg-emerald-400'
  },
  karies: { 
    label: 'Kariyes', 
    color: 'bg-amber-500', 
    text: 'text-amber-700', 
    border: 'border-amber-300', 
    bgLight: 'bg-amber-50',
    dotColor: 'bg-amber-400'
  },
  plomba: { 
    label: 'Plomba', 
    color: 'bg-blue-500', 
    text: 'text-blue-700', 
    border: 'border-blue-300', 
    bgLight: 'bg-blue-50',
    dotColor: 'bg-blue-400'
  },
  ildiz_kanali: { 
    label: 'Ildiz kanali / Pulpa', 
    color: 'bg-rose-500', 
    text: 'text-rose-700', 
    border: 'border-rose-300', 
    bgLight: 'bg-rose-50',
    dotColor: 'bg-rose-400'
  },
  koronka: { 
    label: 'Koronka / Qoplama', 
    color: 'bg-purple-500', 
    text: 'text-purple-700', 
    border: 'border-purple-300', 
    bgLight: 'bg-purple-50',
    dotColor: 'bg-purple-400'
  },
  implant: { 
    label: 'Dental Implant', 
    color: 'bg-cyan-500', 
    text: 'text-cyan-700', 
    border: 'border-cyan-300', 
    bgLight: 'bg-cyan-50',
    dotColor: 'bg-cyan-400'
  },
  olingan: { 
    label: 'Olingan (yo\'q)', 
    color: 'bg-slate-700', 
    text: 'text-slate-700', 
    border: 'border-slate-400', 
    bgLight: 'bg-slate-100',
    dotColor: 'bg-slate-500'
  }
};

// Tezkor tashxis namunalari
const DIAGNOSIS_PRESETS = [
  "Boshlang'ich kariyes",
  "O'rta kariyes",
  "Chuqur kariyes",
  "Pulpit (kanal yallig'lanishi)",
  "Tish yo'qligi (adentiya)",
  "Plomba tushib ketgan",
  "Emal darz ketishi",
  "Periodontit"
];

// Tezkor muolaja namunalari
const TREATMENT_PRESETS = [
  "Svetovoy plomba qo'yildi",
  "Kanal tozalandi va plombalandi",
  "Titan implant o'rnatildi",
  "Tish o'rniga koronka o'rnatildi",
  "Og'riqsiz tish sug'urildi",
  "Vaqtincha dorili bog'lam qo'yildi",
  "Air Flow apparatida tozalash"
];

export default function DentalChart({ 
  patientId, 
  patientName, 
  records = {}, 
  doctors = [],
  onUpdateTooth,
  onDeleteTooth 
}) {
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [condition, setCondition] = useState('soglom');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [cost, setCost] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [saving, setSaving] = useState(false);

  const safeRecords = records && typeof records === 'object' ? records : {};

  // Hisob-kitoblar (Nechta tishda nima bor)
  const allTeethNumbers = [...UPPER_RIGHT, ...UPPER_LEFT, ...LOWER_RIGHT, ...LOWER_LEFT];
  
  const stats = {
    total: 32,
    healthy: 0,
    karies: 0,
    plomba: 0,
    ildiz_kanali: 0,
    koronka: 0,
    implant: 0,
    olingan: 0,
    problemTotal: 0,
    totalCost: 0
  };

  const problemTeethList = [];

  allTeethNumbers.forEach(num => {
    const rec = safeRecords[num];
    const rawCond = rec?.condition || rec?.status || 'soglom';
    // Standartlashtirish
    const normalizedCond = (rawCond === 'kariyes' ? 'karies' : 
      rawCond === 'pulpa' || rawCond === 'pulpar_davolangan' ? 'ildiz_kanali' :
      rawCond === 'olib_tashlangan' ? 'olingan' : 
      rawCond in CONDITIONS ? rawCond : 'soglom');

    if (!rec || normalizedCond === 'soglom') {
      stats.healthy++;
    } else {
      stats.problemTotal++;
      if (stats[normalizedCond] !== undefined) {
        stats[normalizedCond]++;
      }
      stats.totalCost += Number(rec.cost || rec.cost_uzs || 0);

      problemTeethList.push({
        toothNumber: num,
        name: TOOTH_NAMES[num] || `Tish #${num}`,
        condition: normalizedCond,
        diagnosis: rec.diagnosis || 'Tashxis kiritilmagan',
        treatment: rec.treatment_applied || rec.treatment || 'Muolaja belgilanmagan',
        cost: Number(rec.cost || rec.cost_uzs || 0),
        date: rec.treatment_date || rec.date || '—',
        doctorId: rec.doctor_id
      });
    }
  });

  // Tish modalini ochish
  const openToothModal = (toothNumber) => {
    const existing = safeRecords[toothNumber] || {};
    setSelectedTooth(toothNumber);
    const rawCond = existing.condition || existing.status || 'soglom';
    const normalized = rawCond === 'kariyes' ? 'karies' :
      rawCond === 'pulpa' || rawCond === 'pulpar_davolangan' ? 'ildiz_kanali' :
      rawCond === 'olib_tashlangan' ? 'olingan' :
      rawCond in CONDITIONS ? rawCond : 'soglom';

    setCondition(normalized);
    setDiagnosis(existing.diagnosis || '');
    setTreatment(existing.treatment_applied || existing.treatment || '');
    setCost(existing.cost || existing.cost_uzs || '');
    setSelectedDoctorId(existing.doctor_id || '');
  };

  // Tish holatini saqlash
  const handleSaveTooth = async (e) => {
    e.preventDefault();
    if (!selectedTooth) return;

    setSaving(true);
    try {
      await onUpdateTooth(patientId, selectedTooth, {
        condition,
        status: condition,
        diagnosis: condition === 'soglom' ? '' : diagnosis,
        treatment_applied: condition === 'soglom' ? '' : treatment,
        cost: condition === 'soglom' ? 0 : (Number(cost) || 0),
        doctor_id: selectedDoctorId || null,
        treatment_date: new Date().toISOString().split('T')[0]
      });
    } finally {
      setSaving(false);
      setSelectedTooth(null);
    }
  };

  // Tishni tozalash / Sog'lom qilish
  const handleResetToHealthy = async () => {
    if (!selectedTooth) return;
    setSaving(true);
    try {
      if (onDeleteTooth) {
        await onDeleteTooth(patientId, selectedTooth);
      } else {
        await onUpdateTooth(patientId, selectedTooth, { condition: 'soglom', status: 'soglom' });
      }
    } finally {
      setSaving(false);
      setSelectedTooth(null);
    }
  };

  // Har bir tish tugmachasi
  const renderToothBox = (toothNum) => {
    const data = safeRecords[toothNum];
    const rawCond = data?.condition || data?.status || 'soglom';
    const normCond = rawCond === 'kariyes' ? 'karies' :
      rawCond === 'pulpa' || rawCond === 'pulpar_davolangan' ? 'ildiz_kanali' :
      rawCond === 'olib_tashlangan' ? 'olingan' :
      normCondKey(rawCond);

    const isProblem = normCond !== 'soglom' && Boolean(data);
    const condConfig = CONDITIONS[normCond] || CONDITIONS.soglom;

    return (
      <button
        key={toothNum}
        type="button"
        onClick={() => openToothModal(toothNum)}
        className={`group relative flex flex-col items-center justify-between p-1.5 rounded-xl border transition-all cursor-pointer select-none active:scale-95 ${
          isProblem
            ? `${condConfig.bgLight} ${condConfig.border} ring-2 ring-${condConfig.color}/30 shadow-xs hover:brightness-95`
            : 'bg-white border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/30'
        } w-11 h-16 sm:w-12 sm:h-18`}
        title={`#${toothNum}: ${TOOTH_NAMES[toothNum] || ''} (${condConfig.label})`}
      >
        {/* Tish raqami */}
        <span className={`text-[11px] font-black tracking-tight ${isProblem ? condConfig.text : 'text-slate-600 group-hover:text-cyan-700'}`}>
          {toothNum}
        </span>

        {/* Stilistik tish shakli (Visual Tooth Shape) */}
        <div className="relative my-0.5">
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
            isProblem ? condConfig.color : 'bg-slate-100 group-hover:bg-cyan-100'
          }`}>
            <span className="text-[10px]">
              {normCond === 'olingan' ? '✖' : normCond === 'implant' ? '🔩' : normCond === 'koronka' ? '👑' : '🦷'}
            </span>
          </div>

          {isProblem && (
            <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${condConfig.dotColor} ring-1 ring-white animate-pulse`}></span>
          )}
        </div>

        {/* Holat yozuvi */}
        <span className={`text-[9px] font-bold uppercase tracking-tighter truncate max-w-full ${
          isProblem ? condConfig.text : 'text-slate-400'
        }`}>
          {normCond === 'soglom' ? 'SOG\'' : normCond.slice(0, 4)}
        </span>
      </button>
    );
  };

  function normCondKey(k) {
    if (k in CONDITIONS) return k;
    return 'soglom';
  }

  function formatUZS(val) {
    return new Intl.NumberFormat('uz-UZ').format(val) + " so'm";
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Sarlavha va Umumiy Statistika */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-100 text-cyan-700 text-lg">🦷</span>
            <div>
              <h3 className="font-extrabold text-base text-slate-800 tracking-tight">
                32 Tish Xaritasi va Bemor Tashxislari (FDI Formula)
              </h3>
              <p className="text-xs text-slate-500">
                Bemor: <span className="font-bold text-slate-800">{patientName || 'Tanlanmagan'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Asosiy ko'rsatkichlar (KPIs) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{stats.healthy} ta sog'lom</span>
          </div>

          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
            stats.problemTotal > 0 
              ? 'bg-amber-50 border-amber-200 text-amber-800' 
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <span className={`w-2 h-2 rounded-full ${stats.problemTotal > 0 ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
            <span>{stats.problemTotal} ta muolaja talab</span>
          </div>

          {stats.totalCost > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-cyan-600" />
              <span>{formatUZS(stats.totalCost)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Holatlar bo'yicha ranglar shkalasi va hisoblagichlar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {Object.entries(CONDITIONS).map(([key, val]) => {
          const count = key === 'soglom' ? stats.healthy : (stats[key] || 0);
          return (
            <div 
              key={key} 
              className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                count > 0 ? `${val.bgLight} ${val.border}` : 'bg-slate-50 border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${val.color}`}></span>
                <span className={`font-semibold text-[11px] truncate ${count > 0 ? val.text : 'text-slate-600'}`}>
                  {val.label}
                </span>
              </div>
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                count > 0 ? 'bg-white shadow-2xs text-slate-800' : 'text-slate-400'
              }`}>
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tishlar Formulasi (Anatomik grafik xarita) */}
      <div className="bg-gradient-to-b from-slate-50 to-slate-100/60 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-6">
        {/* 1. YUQORI JAG' (MAXILLA) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2">
            <span className="flex items-center gap-1">
              <span>◀</span> O'ng Tomon (Yuqori)
            </span>
            <span className="bg-cyan-600 text-white px-3 py-0.5 rounded-full text-[10px] font-extrabold shadow-xs">
              Yuqori Jag' (Maxilla)
            </span>
            <span className="flex items-center gap-1">
              Chap Tomon (Yuqori) <span>▶</span>
            </span>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="flex justify-center items-center gap-2 min-w-[580px] py-1">
              {/* O'ng tomon: 18 dan 11 gacha */}
              <div className="flex gap-1.5">
                {UPPER_RIGHT.map(renderToothBox)}
              </div>

              {/* Markaziy chiziq */}
              <div className="w-0.5 h-16 bg-cyan-400/40 rounded-full mx-1"></div>

              {/* Chap tomon: 21 dan 28 gacha */}
              <div className="flex gap-1.5">
                {UPPER_LEFT.map(renderToothBox)}
              </div>
            </div>
          </div>
        </div>

        {/* Ajratuvchi chiziq */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-300 w-full"></div>
          <span className="absolute bg-slate-200 text-slate-600 text-[10px] font-bold px-3 py-0.5 rounded-full">
            Tishlar kontakt chizig'i
          </span>
        </div>

        {/* 2. PASTKI JAG' (MANDIBLE) */}
        <div className="space-y-2">
          <div className="overflow-x-auto pb-1">
            <div className="flex justify-center items-center gap-2 min-w-[580px] py-1">
              {/* O'ng tomon: 48 dan 41 gacha */}
              <div className="flex gap-1.5">
                {LOWER_RIGHT.map(renderToothBox)}
              </div>

              {/* Markaziy chiziq */}
              <div className="w-0.5 h-16 bg-teal-400/40 rounded-full mx-1"></div>

              {/* Chap tomon: 31 dan 38 gacha */}
              <div className="flex gap-1.5">
                {LOWER_LEFT.map(renderToothBox)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2">
            <span className="flex items-center gap-1">
              <span>◀</span> O'ng Tomon (Pastki)
            </span>
            <span className="bg-teal-600 text-white px-3 py-0.5 rounded-full text-[10px] font-extrabold shadow-xs">
              Pastki Jag' (Mandible)
            </span>
            <span className="flex items-center gap-1">
              Chap Tomon (Pastki) <span>▶</span>
            </span>
          </div>
        </div>
      </div>

      {/* MUOLAJALAR VA TISHLAR JADVALI (TREATMENT & CONDITION TABLE) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-cyan-600" />
            <span>Bemor Tishlari Muolajalar Jadvali ({problemTeethList.length})</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-medium">
            Tishni tahrirlash uchun yuqoridagi kartadan bosing
          </span>
        </div>

        {problemTeethList.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-1">
            <p className="text-xs font-bold text-slate-700">
              🎉 Bemorning barcha tishlari sog'lom!
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Tish holatini (kariyes, plomba, implant...) rasmiylashtirish uchun yuqoridagi 32 ta tishdan birini tanlang.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-3.5">Tish #</th>
                  <th className="py-3 px-3">Holati</th>
                  <th className="py-3 px-3">Tashxis</th>
                  <th className="py-3 px-3">Muolaja</th>
                  <th className="py-3 px-3">Qiymati</th>
                  <th className="py-3 px-3">Sana</th>
                  <th className="py-3 px-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {problemTeethList.map(item => {
                  const condStyle = CONDITIONS[item.condition] || CONDITIONS.soglom;

                  return (
                    <tr key={item.toothNumber} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-slate-800 whitespace-nowrap">
                        <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-800 inline-flex items-center justify-center text-xs mr-2 font-black">
                          #{item.toothNumber}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                          {item.name}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${condStyle.bgLight} ${condStyle.border} ${condStyle.text}`}>
                          <span className={`w-2 h-2 rounded-full ${condStyle.color}`}></span>
                          {condStyle.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-700 max-w-[180px] truncate font-medium">
                        {item.diagnosis}
                      </td>

                      <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate">
                        {item.treatment}
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                        {item.cost > 0 ? formatUZS(item.cost) : '—'}
                      </td>

                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                        {item.date}
                      </td>

                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openToothModal(item.toothNumber)}
                            className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                          >
                            Tahrirlash
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTooth(item.toothNumber);
                              handleResetToHealthy();
                            }}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Sog'lom deb belgilash (o'chirish)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* TISH TAHRIRLASH MODALI */}
      {selectedTooth && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  #{selectedTooth}
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-800 leading-tight">
                    Tish #{selectedTooth} Holatini Rasmiylashtirish
                  </h4>
                  <p className="text-xs text-cyan-700 font-medium mt-0.5">
                    {TOOTH_NAMES[selectedTooth] || ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTooth(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTooth} className="space-y-4">
              {/* 1. Tish Holati tanlash */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Tish Holati (Status):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(CONDITIONS).map(([key, item]) => {
                    const isSelected = condition === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setCondition(key)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? `${item.bgLight} ${item.border} ring-2 ring-${item.color}/40 ${item.text} font-bold shadow-xs`
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full shrink-0 ${item.color}`}></span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {condition !== 'soglom' && (
                <>
                  {/* 2. Tashxis */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Tashxis:
                    </label>
                    <input
                      type="text"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="Masalan: O'rta kariyes, emal zararlangan"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />

                    {/* Tezkor tashxis tugmalari */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {DIAGNOSIS_PRESETS.map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setDiagnosis(p)}
                          className="text-[10px] bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-600 px-2 py-0.5 rounded-md transition-colors"
                        >
                          + {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Muolaja / Qo'llangan chora */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Qo'llanilgan muolaja / reja:
                    </label>
                    <input
                      type="text"
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                      placeholder="Masalan: Svetovoy plomba qo'yildi"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />

                    {/* Tezkor muolaja tugmalari */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {TREATMENT_PRESETS.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTreatment(t)}
                          className="text-[10px] bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 px-2 py-0.5 rounded-md transition-colors"
                        >
                          + {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Davolovchi shifokor va Qiymati */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Shifokor:
                      </label>
                      <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">Shifokorni tanlang...</option>
                        {doctors && doctors.length > 0 ? (
                          doctors.map(d => (
                            <option key={d.id} value={d.id}>{d.full_name}</option>
                          ))
                        ) : (
                          <>
                            <option value="d1111111-1111-1111-1111-111111111111">Dr. Ismailov Mansurbek</option>
                            <option value="d2222222-2222-2222-2222-222222222222">Dr. Ismailov Muhammad</option>
                          </>
                        )}
                      </select>
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
                  </div>
                </>
              )}

              {/* Tugmalar */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                {safeRecords[selectedTooth] && (
                  <button
                    type="button"
                    onClick={handleResetToHealthy}
                    disabled={saving}
                    className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Tishdagi barcha muammolarni tozalash"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Sog'lom qilish</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedTooth(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
