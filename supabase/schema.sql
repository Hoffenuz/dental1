-- ====================================================================
-- STOMATOLOGIYA NAVBAT VA BEMORLAR CRM TIZIMI - SUPABASE DATABASE SXEMASI
-- Loyiha: Telegram WebApp Navbat Tizimi
-- Muallif: Antigravity AI
-- Sana: 2026-09-22
-- ====================================================================

-- 1. UUID kengaytmasini faollashtirish
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. KLINIKALAR JADVALI (Multi-tenant SaaS uchun tayyorlangan)
CREATE TABLE IF NOT EXISTS clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Toshkent',
    working_hours VARCHAR(100) DEFAULT '09:00 - 20:00 (Dushanba - Shanba)',
    telegram_bot_username VARCHAR(100),
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
    specialty VARCHAR(150) NOT NULL, -- Terapevt, Ortodont, Jarroh-Implantolog, Bolalar stomatologi
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
    category VARCHAR(100) NOT NULL, -- Konsultatsiya, Davolash, Jarrohlik, Ortodontiya, Estetika, Bolalar
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_uzs NUMERIC(12, 2) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30, -- 30, 45, 60 daqiqa
    icon VARCHAR(50) DEFAULT 'tooth',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SHIFOKORLAR ISH JADVALI (Schedules)
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1: Dushanba, 7: Yakshanba
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
    telegram_id BIGINT UNIQUE, -- Telegram foydalanuvchi IDsi
    telegram_username VARCHAR(100),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    birth_date DATE,
    gender VARCHAR(10) CHECK (gender IN ('erkak', 'ayol', 'boshqa')),
    allergies TEXT, -- Dori yoki anestetik vositalarga allergiya
    medical_notes TEXT, -- Umumiy kasalliklar (diabet, gipertoniya va h.k.)
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
    
    -- Bemor ma'lumotlari tezkor kiritish uchun (agar bemor hali ro'yxatdan o'tmagan bo'lsa)
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(50) NOT NULL,
    patient_telegram_id BIGINT,
    
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Holatlar: kutilmoqda, tasdiqlandi, qabulda, bajarildi, bekor_qilindi
    status VARCHAR(50) DEFAULT 'kutilmoqda' CHECK (status IN ('kutilmoqda', 'tasdiqlandi', 'qabulda', 'bajarildi', 'bekor_qilindi')),
    
    patient_complaint TEXT, -- Bemor shikoyati yoki izohi
    doctor_notes TEXT,      -- Shifokor yozuvi
    price_charged NUMERIC(12, 2), -- Yakuniy to'lov summasi
    
    created_via VARCHAR(20) DEFAULT 'webapp' CHECK (created_via IN ('webapp', 'telegram_bot', 'admin', 'phone')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Bir shifokorga bir vaqtda bitta tasdiqlangan navbat cheklovi
    CONSTRAINT unique_doctor_slot UNIQUE(doctor_id, appointment_date, start_time)
);

-- 8. TISH KARTASI VA TASHXISLAR (DENTAL RECORDS / CRM)
-- FDI xalqaro tish raqamlanishi: 11-18, 21-28, 31-38, 41-48
CREATE TABLE IF NOT EXISTS dental_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    tooth_number INT NOT NULL CHECK (tooth_number BETWEEN 11 AND 48),
    -- Holat: soglom, kariyes, plomba, olingan, koronka, implant, ildiz_davolangan, pulpa
    condition VARCHAR(50) NOT NULL DEFAULT 'soglom',
    diagnosis TEXT,
    treatment_applied TEXT,
    cost NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. BILDIRISHNOMALAR VA XABARLAR TARIXI
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    recipient_telegram_id BIGINT,
    recipient_type VARCHAR(20) DEFAULT 'patient' CHECK (recipient_type IN ('patient', 'doctor', 'admin')),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'kutilmoqda' CHECK (status IN ('kutilmoqda', 'yuborildi', 'xatolik')),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. INDEKSLAR (Tezkor qidiruv va tekshirish uchun)
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_telegram ON patients(telegram_id);
CREATE INDEX IF NOT EXISTS idx_dental_records_patient ON dental_records(patient_id);

-- 11. TRIGGER: Bemor tashriflar sonini avtomatik oshirish
CREATE OR REPLACE FUNCTION update_patient_visits()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'bajarildi' AND OLD.status != 'bajarildi') THEN
        UPDATE patients 
        SET total_visits = total_visits + 1, updated_at = NOW() 
        WHERE id = NEW.patient_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_patient_visits ON appointments;
CREATE TRIGGER trg_update_patient_visits
AFTER UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_patient_visits();
