-- ====================================================================
-- STOMATOLOGIYA TIZIMI UCHUN NAMUNAVIY MA'LUMOTLAR (SEED DATA)
-- Loyiha: Telegram WebApp Stomatologiya Navbat Tizimi
-- Til: O'zbek tili
-- ====================================================================

-- 1. Asosiy Klinika
INSERT INTO clinics (id, name, phone, email, address, city, working_hours, telegram_bot_username, telegram_admin_chat_id, currency)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'ORTHODONT-M',
    '+998 97 422 99 92',
    'info@orthodont-m.uz',
    'Toshkent sh., Yunusobod tumani (Mo''ljal: Minor metro bekati)',
    'Toshkent',
    '09:00 - 19:00 (Dushanba - Shanba)',
    'dentalclinicuzbot',
    '123456789',
    'UZS'
) ON CONFLICT (id) DO NOTHING;

-- 2. Shifokorlar (Stomatologlar - 2 ta asosiy mutaxassis)
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
    'Bosh shifokor, malakali ortodont. Barcha turdagi breketlar va zamonaviy tish qatorini to''g''rilash bo''yicha yetakchi mutaxassis.',
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
);
ON CONFLICT (id) DO NOTHING;

-- 3. Xizmatlar (Stomatologiya narxlari UZS da)
INSERT INTO services (id, clinic_id, category, name, description, price_uzs, duration_minutes, icon)
VALUES
(
    's1111111-0000-0000-0000-000000000001',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Konsultatsiya',
    'Birlamchi ko''rik va konsultatsiya',
    'Shifokor ko''rigi, rentgen tahlili va individual davolash rejasini tuzish',
    50000,
    20,
    'clipboard-check'
),
(
    's1111111-0000-0000-0000-000000000002',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Gigiyena',
    'Professional tozalash (Ultrasonik + Air Flow)',
    'Tish toshlari va qoraygan dog''larni zararsiz olib tashlash, ftorlash',
    350000,
    40,
    'sparkles'
),
(
    's1111111-0000-0000-0000-000000000003',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Davolash',
    'Svetovoy plomba (Germaniya kompoziti)',
    'Kariyesni davolash va tabiiy tish rangiga mos yuqori sifatli nurlanuvchi plomba qo''yish',
    280000,
    45,
    'shield-plus'
),
(
    's1111111-0000-0000-0000-000000000004',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Davolash',
    'Kanal davolash (Pulpit/Periodontit)',
    'Ildiz kanallarini mikroskopik tozalash, dori qo''yish va plombalash (1 kanal)',
    220000,
    50,
    'activity'
),
(
    's1111111-0000-0000-0000-000000000005',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Jarrohlik',
    'Og''riqsiz tish sug''urish (Oddiy / Aql tishi)',
    'Kuchli zamonaviy anesteziya bilan tishni travmasiz sug''urish',
    200000,
    30,
    'scissors'
),
(
    's1111111-0000-0000-0000-000000000006',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Ortodontiya',
    'Breket o''rnatish (Bitta jag'' uchun)',
    'AQSH yoki Janubiy Koreya metall-ligatura tizimidagi sifatli breketlar',
    3500000,
    60,
    'smile'
),
(
    's1111111-0000-0000-0000-000000000007',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Implantatsiya',
    'Dental Implant o''rnatish (Osstem / Koreya)',
    'Yuqori biologik moslashuvchan titan implant va jarrohlik amaliyoti',
    3200000,
    60,
    'anchor'
),
(
    's1111111-0000-0000-0000-000000000008',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Estetika',
    'Tish oqartirish (Laser / Zoom texnologiyasi)',
    'Emalga zarar yetkazmasdan 4-8 tongacha oppoq qilish',
    1200000,
    60,
    'sun'
),
(
    's1111111-0000-0000-0000-000000000009',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Bolalar',
    'Bolalar suti tishini plombalash (Rangli/Kompomer)',
    'Bolajonlar uchun qiziqarli, tezkor va og''riqsiz plombalash',
    150000,
    30,
    'heart'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Shifokorlar Ish Jadvali (Dushanba - Shanba, 09:00 dan 18:00 gacha)
DO $$
DECLARE
    doc_id UUID;
    day INT;
BEGIN
    FOR doc_id IN SELECT id FROM doctors LOOP
        FOR day IN 1..6 LOOP
            INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, break_start, break_end, slot_duration_minutes, is_working_day)
            VALUES (doc_id, day, '09:00:00', '18:00:00', '13:00:00', '14:00:00', 30, TRUE)
            ON CONFLICT (doctor_id, day_of_week) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- 5. Namunaviy Bemorlar (Patients CRM)
INSERT INTO patients (id, clinic_id, telegram_id, telegram_username, full_name, phone, birth_date, gender, allergies, medical_notes, total_visits)
VALUES
(
    'p1111111-1111-1111-1111-111111111111',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    12345678,
    'azamat_aliev',
    'Azamat Aliyev',
    '+998 90 111 22 33',
    '1994-05-14',
    'erkak',
    'Penitsillinga allergiya mavjud',
    'Ildiz kanali davolangan (16-tish)',
    3
),
(
    'p2222222-2222-2222-2222-222222222222',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    87654321,
    'shahnoza_n',
    'Shahnoza Normurodova',
    '+998 93 444 55 66',
    '1999-11-20',
    'ayol',
    'Yo''q',
    'Breket o''rnatilgan (yuqori jag'')',
    5
),
(
    'p3333333-3333-3333-3333-333333333333',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    NULL,
    NULL,
    'Bobur Mirzayev',
    '+998 97 777 88 99',
    '1988-02-10',
    'erkak',
    'Yo''q',
    'Implantatsiya rejalashtirilmoqda',
    1
)
ON CONFLICT (id) DO NOTHING;

-- 6. Namunaviy Navbatlar (Appointments)
INSERT INTO appointments (
    id, clinic_id, patient_id, doctor_id, service_id, 
    patient_name, patient_phone, patient_telegram_id, 
    appointment_date, start_time, end_time, status, 
    patient_complaint, created_via
)
VALUES
(
    'b1111111-1111-1111-1111-111111111111',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'p1111111-1111-1111-1111-111111111111',
    'd2222222-2222-2222-2222-222222222222',
    's1111111-0000-0000-0000-000000000003',
    'Azamat Aliyev',
    '+998 90 111 22 33',
    12345678,
    CURRENT_DATE,
    '10:00:00',
    '10:45:00',
    'tasdiqlandi',
    'Yuqori o''ng tishda shirin yeganda og''riq bor',
    'webapp'
),
(
    'b2222222-2222-2222-2222-222222222222',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'p2222222-2222-2222-2222-222222222222',
    'd3333333-3333-3333-3333-333333333333',
    's1111111-0000-0000-0000-000000000006',
    'Shahnoza Normurodova',
    '+998 93 444 55 66',
    87654321,
    CURRENT_DATE,
    '11:30:00',
    '12:30:00',
    'kutilmoqda',
    'Breket profilaktik tekshiruvi va tortish',
    'webapp'
),
(
    'b3333333-3333-3333-3333-333333333333',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'p3333333-3333-3333-3333-333333333333',
    'd1111111-1111-1111-1111-111111111111',
    's1111111-0000-0000-0000-000000000007',
    'Bobur Mirzayev',
    '+998 97 777 88 99',
    NULL,
    CURRENT_DATE + INTERVAL '1 day',
    '14:30:00',
    '15:30:00',
    'tasdiqlandi',
    'Implantatsiya bo''yicha rentgen tahlili',
    'phone'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Namunaviy Tish Xaritasi (Dental Records)
INSERT INTO dental_records (patient_id, doctor_id, tooth_number, condition, diagnosis, treatment_applied, cost)
VALUES
('p1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 16, 'plomba', 'O''rta kariyes', 'Kompozit svetovoy plomba qo''yildi', 280000),
('p1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 24, 'kariyes', 'Boshlang''ich kariyes', 'Rejalashtirilgan davolash', 0),
('p1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 48, 'olingan', 'Distopik aql tishi', 'Jarrohlik yo''li bilan olib tashlangan', 300000),
('p2222222-2222-2222-2222-222222222222', 'd3333333-3333-3333-3333-333333333333', 11, 'soglom', 'Anomaliya', 'Metall breket o''rnatilgan', 0)
ON CONFLICT DO NOTHING;
