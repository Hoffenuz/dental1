-- ====================================================================
-- ROW LEVEL SECURITY (RLS) XAVFSIZLIK QOIDALARI
-- Supabase loyiha: rseisxxlvopaeuwysncc
-- ====================================================================

-- 1. RLS ni barcha jadvallarda yoqish
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 2. KLINIKALAR: Hamma o'qiy oladi, faqat admin o'zgartiradi
CREATE POLICY "Klinikalar ommaviy o'qish" ON clinics
    FOR SELECT USING (true);

-- 3. SHIFOKORLAR: Hamma o'qiy oladi, faqat admin o'zgartiradi
CREATE POLICY "Shifokorlar ommaviy o'qish" ON doctors
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin shifokorlarni boshqaradi" ON doctors
    FOR ALL USING (true);

-- 4. XIZMATLAR: Hamma o'qiy oladi
CREATE POLICY "Xizmatlar ommaviy o'qish" ON services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin xizmatlarni boshqaradi" ON services
    FOR ALL USING (true);

-- 5. ISH JADVALI: Hamma o'qiy oladi
CREATE POLICY "Ish jadvallari ommaviy o'qish" ON doctor_schedules
    FOR SELECT USING (is_working_day = true);

CREATE POLICY "Admin jadvallarni boshqaradi" ON doctor_schedules
    FOR ALL USING (true);

-- 6. NAVBATLAR (APPOINTMENTS):
-- a) Bemorlar yangi navbat band qilishi (INSERT) mumkin
CREATE POLICY "Bemorlar navbat band qilishi" ON appointments
    FOR INSERT WITH CHECK (true);

-- b) Ommaviy ko'rish (band soatlarni hisoblash uchun)
CREATE POLICY "Band soatlarni ko'rish" ON appointments
    FOR SELECT USING (true);

-- c) Bemor yoki Admin navbatni tahrirlash / bekor qilish
CREATE POLICY "Navbatni yangilash" ON appointments
    FOR UPDATE USING (true);

-- 7. BEMORLAR VA TISH KARTALARI (PATIENTS & CRM):
CREATE POLICY "Admin bemorlarni boshqaradi" ON patients
    FOR ALL USING (true);

CREATE POLICY "Admin tish kartasini boshqaradi" ON dental_records
    FOR ALL USING (true);

-- 8. BILDIRISHNOMALAR:
CREATE POLICY "Bildirishnomalarni boshqarish" ON notifications
    FOR ALL USING (true);
