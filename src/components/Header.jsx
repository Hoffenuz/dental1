import React from 'react';
import { Bell, Search, Calendar, UserCheck, Plus } from 'lucide-react';

export default function Header({ clinic, onOpenNewBooking, todayDate }) {
  const currentDateFormatted = new Date().toLocaleDateString('uz-UZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <Calendar className="w-3.5 h-3.5 text-cyan-600" />
          <span className="capitalize">{currentDateFormatted}</span>
        </div>
        <span className="text-xs text-slate-400">|</span>
        <span className="text-xs font-semibold text-slate-800">
          {clinic?.name || 'Ismailov Dental Clinic'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenNewBooking}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tezkor Navbat Qo'shish</span>
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div className="text-left hidden md:block">
            <span className="text-xs font-bold text-slate-800 block leading-tight">Administrator</span>
            <span className="text-[10px] text-teal-600 font-medium leading-none">Faol sessiya</span>
          </div>
        </div>
      </div>
    </header>
  );
}
