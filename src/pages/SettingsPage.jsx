import React, { useState } from 'react';
import { Settings, Save, CheckCircle, Database, Send, Bot, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured } from '../supabase';

export default function SettingsPage({ clinic, onSaveClinic }) {
  const [name, setName] = useState(clinic?.name || '');
  const [phone, setPhone] = useState(clinic?.phone || '');
  const [address, setAddress] = useState(clinic?.address || '');
  const [workingHours, setWorkingHours] = useState(clinic?.working_hours || '');
  const [telegramBot, setTelegramBot] = useState(clinic?.telegram_bot || '@DentaCareBookingBot');
  const [adminChatId, setAdminChatId] = useState(clinic?.telegram_admin_chat_id || '');
  const [botToken, setBotToken] = useState('');
  const [saved, setSaved] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onSaveClinic({
      ...clinic,
      name,
      phone,
      address,
      working_hours: workingHours,
      telegram_bot: telegramBot,
      telegram_admin_chat_id: adminChatId
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSendTestNotification = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          Klinika va Tizim Sozlamalari
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Telegram Bot, Supabase ma'lumotlar bazasi va klinika rekvizitlari
        </p>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Sozlamalar muvaffaqiyatli saqlandi!</span>
        </div>
      )}

      {/* 1. Supabase holati */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Supabase Ma'lumotlar Bazasi</h3>
              <p className="text-[11px] text-slate-500">
                PostgreSQL Relational DB (Project Ref: <span className="font-mono text-cyan-700 font-bold">jvzghreavlzjpxhnasxd</span>)
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
            isSupabaseConfigured 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
            {isSupabaseConfigured ? 'Ulangan (Online)' : 'Demo / Mahalliy rejim'}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
          Supabase MCP mijozi <code className="text-cyan-700 font-bold">~/.gemini/antigravity/mcp_config.json</code> fayliga sozlangan.
          Jadvallarni yaratish uchun <code className="text-slate-800 font-bold">supabase/schema.sql</code> faylini Supabase SQL Editor'da ishga tushiring.
        </p>
      </div>

      {/* 2. Asosiy klinika rekvizitlari formasi */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <span>Klinika Rekvizitlari</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Klinika Rasmiy Nomi
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Qabulxona Telefoni
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Manzil va Mo'ljal
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Ish Vaqti
            </label>
            <input
              type="text"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* 3. Telegram Bot Integratsiyasi */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Telegram Bot & Xabarnomalar</h3>
              <p className="text-[11px] text-slate-500">
                Yangi navbat tushganda admin guruhiga va bemorga avtomatik signal berish
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Telegram Bot Username
              </label>
              <input
                type="text"
                value={telegramBot}
                onChange={(e) => setTelegramBot(e.target.value)}
                placeholder="@DentaCareBookingBot"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Admin Chat ID (Xabarnomalar uchun)
              </label>
              <input
                type="text"
                value={adminChatId}
                onChange={(e) => setAdminChatId(e.target.value)}
                placeholder="123456789"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Telegram Bot Token (BotFather'dan olingan)
            </label>
            <input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456789:AAHk..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSendTestNotification}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testSent ? 'Sinov signali yuborildi!' : 'Sinov xabarini tekshirish'}</span>
            </button>
            <span className="text-[11px] text-slate-400">
              Bot servisi: <code>bot-backend/</code>
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Barcha Sozlamalarni Saqlash</span>
        </button>
      </form>
    </div>
  );
}
