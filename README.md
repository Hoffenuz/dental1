# 🦷 DentaCare — Admin Dashboard & Supabase Backend

Ushbu repozitoriy **DentaCare Zamonaviy Stomatologiya Markazi** boshqaruv tizimi (CRM) hamda **Supabase Cloud Backend** infratuzilmasini o'z ichiga oladi.

## 🚀 Repozitoriy Tarkibi

```
admin-dashboard/
├── src/                          # Admin Dashboard CRM (React + Vite + Tailwind CSS)
│   ├── components/               # UI Komponentlar (Sidebar, DentalChart, Header, va b.)
│   ├── pages/                    # CRM Sahifalari (LiveQueue, PatientsCRM, DashboardOverview)
│   ├── supabase.js               # Supabase JS mijoz va relational so'rovlar
│   ├── main.jsx                  # ErrorBoundary va kirish nuqtasi
│   └── index.css                 # Asosiy stillar
├── supabase/                     # Supabase Cloud Database & Edge Functions
│   ├── functions/
│   │   └── telegram-bot/         # 24/7 Telegram Bot Edge Function (Deno)
│   │       └── index.ts
│   ├── FULL_DATABASE_SETUP.sql   # To'liq 8 ta jadval, triggerlar, RLS va namunaviy ma'lumotlar
│   ├── schema.sql                # Asosiy jadvallar sxemasi
│   ├── seed.sql                  # Boshlang'ich klinika, shifokorlar va xizmatlar
│   └── rls.sql                   # Row Level Security xavfsizlik qoidalari
├── bot-backend/                  # Telegram Bot Node.js servisi (alternativ server)
│   ├── bot.js                    # Bot mantiqi
│   ├── server.js                 # Express API
│   ├── package.json
│   └── .env.example
├── .env.example                  # Muhit o'zgaruvchilari shabloni
├── package.json
└── vite.config.js
```

---

## ⚡ Asosiy Imkoniyatlar

1. **Jonli Navbatlar Boshqaruvi (Live Queue):**
   * Telegram Bot va WebApp orqali olingan barcha navbatlarni real vaqtda kuzatish.
   * Holatlarni boshqarish: *Kutilmoqda*, *Tasdiqlandi*, *Qabulda*, *Yakunlandi*, *Bekor qilindi*.
   * Holat o'zgarganda bemorga Telegram orqali avtomatik bildirishnoma yuborish.

2. **Bemorlar CRM (Patients CRM):**
   * Har bir bemorning tashriflari tarixi, shikoyatlari va to'lovlari.
   * Telefon va Telegram ID bo'yicha qidiruv.

3. **Interaktiv 32-Tish FDI Dental Formulari:**
   * Kattalar tish formulasi (11-48 tishlar).
   * Har bir tish holati: *Sog'lom*, *Karies*, *Plomba*, *Pulpar davolangan*, *Implant*, *Toj (koronka)* va h.k.

4. **24/7 Telegram Bot Edge Function:**
   * Supabase bulut serverlarida serverless rejimda ishlaydi.
   * WebApp bilan to'liq integratsiya qilingan: [@dentalclinicuzbot](https://t.me/dentalclinicuzbot).
   * WebApp tugmasi Netlify manziliga ulangan: `https://dentaluz2.netlify.app/`.

---

## ⚙️ O'rnatish va Ishga Tushirish

### 1. Bog'liqliklarni o'rnatish
```bash
npm install
```

### 2. Muhit o'zgaruvchilarini sozlash
`.env.example` faylidan `.env` nusxasini oling:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Dasturni ishga tushirish
```bash
npm run dev
```
Dastur `http://localhost:3001` manzilida ishga tushadi.

---

## 🌐 Bog'liq Loyihalar

* **Mijoz Web-ilovasi (User WebApp):** [https://github.com/Hoffenuz/dental2](https://github.com/Hoffenuz/dental2)
* **Jonli WebApp (Production):** [https://dentaluz2.netlify.app/](https://dentaluz2.netlify.app/)
* **Telegram Bot:** [t.me/dentalclinicuzbot](https://t.me/dentalclinicuzbot)
