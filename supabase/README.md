# Supabase Database Sozlamalari (Stomatologiya Navbat Tizimi)

Loyihangiz uchun yangi Supabase loyihasi:
- **Project Ref:** `jvzghreavlzjpxhnasxd`
- **Dashboard havolasi:** [https://supabase.com/dashboard/project/jvzghreavlzjpxhnasxd](https://supabase.com/dashboard/project/jvzghreavlzjpxhnasxd)

## Ishga Tushirish Bosqichlari:

1. **Supabase Dashboard** ga kiring:
   - Chap menyudan **SQL Editor** bo'limini oching.
2. **Jadvallarni yaratish:**
   - `schema.sql` fayli mazmunini nusxalab, SQL Editor'da **Run** tugmasini bosing.
3. **Namunaviy ma'lumotlarni yuklash:**
   - `seed.sql` fayli mazmunini SQL Editor'da **Run** qiling.
4. **Xavfsizlik qoidalarini (RLS) yoqish:**
   - `rls.sql` faylini SQL Editor'da **Run** qiling.

## API Kalitlarini olish:
- **Project Settings -> API** bo'limiga kiring:
  - `Project URL`: `https://jvzghreavlzjpxhnasxd.supabase.co`
  - `anon / public key`: Nusxalab, `user-webapp/.env` va `admin-dashboard/.env` fayllariga qo'ying (`VITE_SUPABASE_ANON_KEY=...`).
  - `service_role key`: `bot-backend/.env` fayliga qo'ying (`SUPABASE_SERVICE_ROLE_KEY=...`).
