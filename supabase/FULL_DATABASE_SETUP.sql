-- ====================================================================
-- STOMATOLOGIYA NAVBAT VA CRM TIZIMI — YAGONA TO'LIQ BAZA SXEMASI
-- Loyiha: jvzghreavlzjpxhnasxd (https://jvzghreavlzjpxhnasxd.supabase.co)
-- ====================================================================

-- 1. Kengaytmalarni faollashtirish
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. KLINIKALAR JADVALI
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Toshkent',
    working_hours VARCHAR(100) DEFAULT '09:00 - 20:00 (Dushanba - Shanba)',
    telegram_bot_username VARCHAR(100) DEFAULT 'dentalclinicuzbot',
    telegram_admin_chat_id VARCHAR(100),
    logo_url TEXT,
    currency VARCHAR(10) DEFAULT 'UZS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SHIFOKORLAR JADVALI
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(150) NOT NULL,
    experience_years INT DEFAULT 5,
    room_number VARCHAR(20),
    phone VARCHAR(50),
    photo_url TEXT,
    bio TEXT,
    rating NUMERIC(2,1) DEFAULT 5.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. XIZMATLAR VA NARXLAR JADVALI
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_uzs NUMERIC(12, 2) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    icon VARCHAR(50) DEFAULT 'tooth',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SHIFOKORLAR ISH JADVALI (Schedules)
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL DEFAULT '09:00:00',
    end_time TIME NOT NULL DEFAULT '18:00:00',
    break_start TIME DEFAULT '13:00:00',
    break_end TIME DEFAULT '14:00:00',
    slot_duration_minutes INT NOT NULL DEFAULT 30,
    is_working_day BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(doctor_id, day_of_week)
);

-- 6. BEMORLAR (PATIENTS CRM) JADVALI
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
    telegram_id BIGINT UNIQUE,
    telegram_username VARCHAR(100),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    birth_date DATE,
    gender VARCHAR(10) CHECK (gender IN ('erkak', 'ayol', 'boshqa')),
    allergies TEXT,
    medical_notes TEXT,
    total_visits INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. NAVBATLAR / BAND QILISHLAR (APPOINTMENTS) JADVALI
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(50) NOT NULL,
    patient_telegram_id BIGINT,
    
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    status VARCHAR(50) DEFAULT 'kutilmoqda' 
        CHECK (status IN ('kutilmoqda', 'tasdiqlandi', 'bajarildi', 'bekor_qilindi', 'kelmadi')),
    
    booking_source VARCHAR(50) DEFAULT 'telegram_webapp' 
        CHECK (booking_source IN ('telegram_webapp', 'telegram_bot', 'admin_crm', 'telefon')),
    
    notes TEXT,
    price_uzs NUMERIC(12, 2) DEFAULT 0,
    paid_status BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TISH KARTALARI (32-TISH FDI FORMULASI VA AMBULLATOR KARTA)
CREATE TABLE IF NOT EXISTS dental_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    
    tooth_number INT NOT NULL CHECK (
        tooth_number BETWEEN 11 AND 18 OR
        tooth_number BETWEEN 21 AND 28 OR
        tooth_number BETWEEN 31 AND 38 OR
        tooth_number BETWEEN 41 AND 48
    ),
    
    status VARCHAR(50) NOT NULL CHECK (
        status IN ('soglom', 'karies', 'plomba', 'pulpar_davolangan', 'toj (koronka)', 'implant', 'olib_tashlangan', 'protez')
    ),
    diagnosis TEXT,
    treatment_applied TEXT,
    cost_uzs NUMERIC(12, 2) DEFAULT 0,
    treatment_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. BILDIRISHNOMALAR VA AUDIT JADVALI
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_telegram_id BIGINT NOT NULL,
    recipient_type VARCHAR(20) DEFAULT 'patient' CHECK (recipient_type IN ('patient', 'doctor', 'admin')),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'kutilmoqda' CHECK (status IN ('kutilmoqda', 'yuborildi', 'xatolik')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. AVTOMATIK TIMESTAMP UPDATE TRIGGER
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_clinics ON clinics;
CREATE TRIGGER set_timestamp_clinics BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_doctors ON doctors;
CREATE TRIGGER set_timestamp_doctors BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_services ON services;
CREATE TRIGGER set_timestamp_services BEFORE UPDATE ON services FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_patients ON patients;
CREATE TRIGGER set_timestamp_patients BEFORE UPDATE ON patients FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS set_timestamp_appointments ON appointments;
CREATE TRIGGER set_timestamp_appointments BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) & GRANTS
-- ====================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dental_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Klinikalar ommaviy" ON clinics;
CREATE POLICY "Klinikalar ommaviy" ON clinics FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Shifokorlar ommaviy" ON doctors;
CREATE POLICY "Shifokorlar ommaviy" ON doctors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Xizmatlar ommaviy" ON services;
CREATE POLICY "Xizmatlar ommaviy" ON services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Jadvallar ommaviy" ON doctor_schedules;
CREATE POLICY "Jadvallar ommaviy" ON doctor_schedules FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Bemorlar ommaviy" ON patients;
CREATE POLICY "Bemorlar ommaviy" ON patients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Navbatlar ommaviy" ON appointments;
CREATE POLICY "Navbatlar ommaviy" ON appointments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Tish kartalari ommaviy" ON dental_records;
CREATE POLICY "Tish kartalari ommaviy" ON dental_records FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Bildirishnomalar ommaviy" ON notifications;
CREATE POLICY "Bildirishnomalar ommaviy" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- NAMUNAVIY MA'LUMOTLAR (SEED DATA)
-- ====================================================================

-- 1. Klinika
INSERT INTO clinics (id, name, phone, email, address, city, working_hours, telegram_bot_username, currency)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'ORTHODONT-M',
    '+998 97 422 99 92',
    'info@orthodont-m.uz',
    'Toshkent sh., Yunusobod tumani (Mo''ljal: Minor metro)',
    'Toshkent',
    '09:00 - 19:00 (Dushanba - Shanba)',
    'dentalclinicuzbot',
    'UZS'
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, telegram_bot_username = EXCLUDED.telegram_bot_username;

-- 2. Shifokorlar (Faqat 2 ta mutaxassis)
INSERT INTO doctors (id, clinic_id, full_name, specialty, experience_years, room_number, phone, photo_url, bio, rating)
VALUES 
(
    'd1111111-1111-1111-1111-111111111111',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Dr. Ismailov Mansurbek',
    'Bosh shifokor, Ortodont',
    12,
    '1-xona',
    '+998 97 422 99 92',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    'Bosh shifokor, malakali ortodont. Barcha turdagi breketlar va tish qatorini to''g''rilash bo''yicha yetakchi mutaxassis.',
    5.0
),
(
    'd2222222-2222-2222-2222-222222222222',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Dr. Ismailov Muhammad',
    'Stomatolog-Terapevt',
    8,
    '2-xona',
    '+998 33 121 21 31',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
    'Estetik tish davolash, nurlanuvchi svetovoy plomba, tish toshlarini tozalash va og''riqsiz muolajalar ustasi.',
    4.9
)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, specialty = EXCLUDED.specialty, phone = EXCLUDED.phone;

-- 3. Xizmatlar
INSERT INTO services (id, clinic_id, category, name, description, price_uzs, duration_minutes, icon)
VALUES
('c1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Konsultatsiya', 'Birlamchi ko''rik va konsultatsiya', 'Og''iz bo''shlig''ini to''liq tekshirish va davolash rejasini tuzish', 50000.00, 30, 'check-circle'),
('c2222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Davolash', 'Svetovoy plomba (Germaniya)', 'Yuqori sifatli nurlanuvchi kompozit materialdan tish restavratsiyasi', 280000.00, 45, 'sparkles'),
('c3333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Gigiyena', 'Professional tish tozalash (Air Flow + Ultrasound)', 'Toshlarni ultratovushda olish va pigment dog''larni Air Flow qumi bilan tozalash', 350000.00, 45, 'smile'),
('c4444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Davolash', 'Ildiz kanallarini davolash (Pulpit/Periodontit)', 'Ildiz kanalini mexanik kengaytirish, antiseptik ishlov va zich guttamaterial bilan to''ldirish', 220000.00, 60, 'activity'),
('c5555555-5555-5555-5555-555555555555', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Jarrohlik', 'Og''riqsiz tish sug''urish (Oddiy / Aql tishi)', 'Zamonaviy anesteziya ostida murakkab va oddiy tishlarni shikastlamasdan olish', 200000.00, 30, 'scissors'),
('c6666666-6666-6666-6666-666666666666', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Ortodontiya', 'Breket tizimi o''rnatish (1 ta jag'')', 'Klassik metall yoki keramik qulfli breket tizimi', 3500000.00, 60, 'grid'),
('c7777777-7777-7777-7777-777777777777', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Implantatsiya', 'Titanium Dental Implant (Osstem, Janubiy Koreya)', 'Yuqori biosmoslashuvchan titan vinti o''rnatish jarrohlik amaliyoti', 3200000.00, 60, 'shield'),
('c8888888-8888-8888-8888-888888888888', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Bolalar', 'Bolalar sut tishini plombalash', 'Bolalarga mo''ljallangan rang-barang va xavfsiz plombalar', 150000.00, 30, 'heart')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price_uzs = EXCLUDED.price_uzs;

-- 4. Bemorlar
INSERT INTO patients (id, clinic_id, telegram_id, telegram_username, full_name, phone, birth_date, gender, allergies, medical_notes, total_visits)
VALUES
('b1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 998877661, 'anvar_sh', 'Anvar Shukurov', '+998 90 111 22 33', '1992-05-14', 'erkak', 'Yo''q', '2023-yilda 16-tish davolangan', 3),
('b2222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 998877662, 'feruza_88', 'Feruza Ahmedova', '+998 93 444 55 66', '1988-11-20', 'ayol', 'Penitsillinga sezuvchanlik', 'Homiladorlik davrida ehtiyotkor davolash', 5),
('b3333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 998877663, 'bobur_mirzo', 'Bobur Mirzayev', '+998 97 777 88 99', '2001-03-08', 'erkak', 'Yo''q', 'Ortodontik davolash rejalashtirilmoqda', 1)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- 5. Bugungi va ertangi Navbatlar
INSERT INTO appointments (clinic_id, patient_id, doctor_id, service_id, patient_name, patient_phone, patient_telegram_id, appointment_date, start_time, end_time, status, booking_source, notes, price_uzs)
VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'c7777777-7777-7777-7777-777777777777', 'Anvar Shukurov', '+998 90 111 22 33', 998877661, CURRENT_DATE, '10:00:00', '11:00:00', 'tasdiqlandi', 'telegram_webapp', 'Implantatsiya 2-bosqich ko''rigi', 3200000.00),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Feruza Ahmedova', '+998 93 444 55 66', 998877662, CURRENT_DATE, '11:30:00', '12:15:00', 'kutilmoqda', 'telegram_bot', 'Yuqori o''ng tishda og''riq bor', 280000.00),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'c6666666-6666-6666-6666-666666666666', 'Bobur Mirzayev', '+998 97 777 88 99', 998877663, CURRENT_DATE + 1, '15:00:00', '16:00:00', 'kutilmoqda', 'telegram_webapp', 'Breket o''rnatish konsultatsiyasi', 3500000.00);

-- 6. Tish Kartasi (Dental Record - FDI)
INSERT INTO dental_records (patient_id, doctor_id, tooth_number, status, diagnosis, treatment_applied, cost_uzs)
VALUES
('b1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 16, 'implant', 'Tish yo''qligi (adentiya)', 'Osstem 4.0x10mm titan implant o''rnatildi', 3200000.00),
('b1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 24, 'plomba', 'O''rta karies', 'Gradia Direct kompozit plomba qo''yildi', 280000.00),
('b2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 46, 'karies', 'Chuqur karies', 'Vaqtincha dorili bog''lam qo''yildi', 150000.00);
