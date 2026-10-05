import React from 'react';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Users, 
  Receipt, 
  Settings, 
  ExternalLink 
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, counts }) {
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Boshqaruv Paneli', 
      icon: LayoutDashboard 
    },
    { 
      id: 'queue', 
      label: 'Jonli Navbatlar', 
      icon: CalendarClock,
      badge: counts?.pending ? counts.pending : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    { 
      id: 'patients', 
      label: 'Bemorlar & Tish Kartasi', 
      icon: Users,
      badge: counts?.patients ? counts.patients : null
    },
    { 
      id: 'services', 
      label: 'Xizmatlar & Narxlar', 
      icon: Receipt 
    },
    { 
      id: 'settings', 
      label: 'Tizim Sozlamalari', 
      icon: Settings 
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen">
      {/* Brand logo */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-sm">
          🦷
        </div>
        <div>
          <h1 className="font-extrabold text-base text-slate-800 tracking-tight leading-none">
            ORTHODONT<span className="text-cyan-600 font-bold text-sm">-M</span>
          </h1>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">Stomatologiya Boshqaruvi</p>
        </div>
      </div>

      {/* Shifokorlar haqida qisqa ma'lumot */}
      <div className="mx-3 mt-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-600">
        <div className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Shifokorlar (2 ta):</span>
        </div>
        <p className="text-[10px] text-slate-500">👨‍⚕️ Ismailov Mansurbek</p>
        <p className="text-[10px] text-slate-500">👨‍⚕️ Ismailov Muhammad</p>
      </div>

      {/* Navigation menu */}
      <div className="p-3 flex-1 space-y-1">
        <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Asosiy Bo'limlar
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-50 text-cyan-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  item.badgeColor || 'bg-slate-100 text-slate-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Status & Telegram Link */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-700">Telegram WebApp</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <p className="text-[10px] text-slate-400 leading-snug">
            Bemorlar uchun sodda navbat tizimi
          </p>
          <a
            href="https://dentaluz2.netlify.app/"
            target="_blank"
            rel="noreferrer"
            className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>User WebApp ochish</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>
    </aside>
  );
}
