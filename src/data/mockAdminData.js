// Admin CRM uchun stomatologiya ma'lumotlari

export const INITIAL_CLINIC = {
  id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  name: 'DentaCare Zamonaviy Stomatologiya Markazi',
  phone: '+998 71 200 44 22',
  email: 'info@dentacare.uz',
  address: "Toshkent sh., Yunusobod tumani, Amir Temur ko'chasi, 45-uy",
  working_hours: '09:00 - 20:00 (Dushanba - Shanba)',
  telegram_bot: '@dentalclinicuzbot',
  telegram_admin_chat_id: '123456789',
  currency: 'UZS'
};

export const INITIAL_DOCTORS = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    full_name: 'Dr. Rustam Xoliqov',
    specialty: 'Bosh shifokor, Jarroh-Implantolog',
    experience_years: 14,
    room_number: 'Xona 1',
    phone: '+998 90 123 45 67',
    photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
    bio: 'Germaniya va Shveytsariya sertifikatlariga ega yuqori toifali jarroh-implantolog.',
    rating: 4.9,
    is_active: true
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    full_name: 'Dr. Nilufar Karimova',
    specialty: 'Terapevt-Restavrator',
    experience_years: 9,
    room_number: 'Xona 2',
    phone: '+998 93 987 65 43',
    photo_url: 'https://images.unsplash.com/photo-1594824813576-919c0840b991?w=400&auto=format&fit=crop&q=80',
    bio: "Estetik tish restavratsiyasi va ildiz kanallarini og'riqsiz davolash.",
    rating: 5.0,
    is_active: true
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    full_name: 'Dr. Jasur Bekmurodov',
    specialty: 'Ortodont (Breket va Eylaynerlar)',
    experience_years: 8,
    room_number: 'Xona 3',
    phone: '+998 97 555 12 34',
    photo_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80',
    bio: "Tish qatorini to'g'rilash, breket va shaffof eylaynerlar.",
    rating: 4.8,
    is_active: true
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    full_name: 'Dr. Madina Usmonova',
    specialty: 'Bolalar stomatologi',
    experience_years: 6,
    room_number: 'Xona 4',
    phone: '+998 99 888 77 66',
    photo_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
    bio: "Bolajonlar bilan qo'rquvsiz va og'riqsiz stomatologik muolajalar.",
    rating: 4.9,
    is_active: true
  }
];

export const INITIAL_SERVICES = [
  {
    id: 's1111111-0000-0000-0000-000000000001',
    category: 'Konsultatsiya',
    name: "Birlamchi ko'rik va konsultatsiya",
    description: "Shifokor ko'rigi, rentgen tahlili va individual davolash rejasi",
    price_uzs: 50000,
    duration_minutes: 20,
    is_active: true
  },
  {
    id: 's1111111-0000-0000-0000-000000000002',
    category: 'Gigiyena',
    name: 'Professional tozalash (Ultrasonik + Air Flow)',
    description: "Tish toshlari va qoraygan dog'larni zararsiz tozalash",
    price_uzs: 350000,
    duration_minutes: 40,
    is_active: true
  },
  {
    id: 's1111111-0000-0000-0000-000000000003',
    category: 'Davolash',
    name: 'Svetovoy plomba (Germaniya kompoziti)',
    description: 'Kariyesni tozalash va tabiiy estetik nurlanuvchi plomba',
    price_uzs: 280000,
    duration_minutes: 45,
    is_active: true
  },
  {
    id: 's1111111-0000-0000-0000-000000000004',
    category: 'Davolash',
    name: 'Kanal davolash (Pulpit/Periodontit)',
    description: 'Ildiz kanallarini tozalash va mikroskopik plombalash',
    price_uzs: 220000,
    duration_minutes: 50,
    is_active: true
  },
  {
    id: 's1111111-0000-0000-0000-000000000005',
    category: 'Jarrohlik',
    name: "Og'riqsiz tish sug'urish (Oddiy / Aql tishi)",
    description: 'Anesteziya bilan tishni travmasiz sug\'urish',
    price_uzs: 200000,
    duration_minutes: 30,
    is_active: true
  },
  {
    id: 's1111111-0000-0000-0000-000000000006',
    category: 'Ortodontiya',
    name: "Breket o'rnatish (Bitta jag' uchun)",
    description: 'AQSH va Koreya metall va estetik breketlari',
    price_uzs: 3500000,
    duration_minutes: 60,
    is_active: true
  },
  {
    id: 's1111111-0000-0000-0000-000000000007',
    category: 'Implantatsiya',
    name: "Dental Implant o'rnatish (Osstem / Koreya)",
    description: "Titan implant va jarrohlik o'rnatish amaliyoti",
    price_uzs: 3200000,
    duration_minutes: 60,
    is_active: true
  }
];

export const INITIAL_PATIENTS = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    full_name: 'Azamat Aliyev',
    phone: '+998 90 111 22 33',
    telegram_id: 12345678,
    telegram_username: 'azamat_aliev',
    birth_date: '1994-05-14',
    gender: 'erkak',
    allergies: 'Penitsillinga sezgirlik mavjud',
    medical_notes: '16-tish ildiz kanali davolangan, profilaktika tavsiya etilgan',
    total_visits: 3,
    last_visit: '2026-09-10'
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    full_name: 'Shahnoza Normurodova',
    phone: '+998 93 444 55 66',
    telegram_id: 87654321,
    telegram_username: 'shahnoza_n',
    birth_date: '1999-11-20',
    gender: 'ayol',
    allergies: 'Mavjud emas',
    medical_notes: "Yuqori va pastki jag'ga metall breket o'rnatilgan",
    total_visits: 5,
    last_visit: '2026-08-25'
  },
  {
    id: 'p3333333-3333-3333-3333-333333333333',
    full_name: 'Bobur Mirzayev',
    phone: '+998 97 777 88 99',
    telegram_id: null,
    telegram_username: null,
    birth_date: '1988-02-10',
    gender: 'erkak',
    allergies: "Yo'q",
    medical_notes: "46-tish o'rniga implant rejalashtirilmoqda",
    total_visits: 1,
    last_visit: '2026-09-01'
  },
  {
    id: 'p4444444-4444-4444-4444-444444444444',
    full_name: 'Dilnoza Karimova',
    phone: '+998 91 333 22 11',
    telegram_id: 45678912,
    telegram_username: 'dilnoza_k',
    birth_date: '2001-07-03',
    gender: 'ayol',
    allergies: 'Lidokainga allergiya (Artikain ishlatilsin)',
    medical_notes: "Estetik restavratsiya o'tkazilgan",
    total_visits: 2,
    last_visit: '2026-09-15'
  }
];

export const INITIAL_APPOINTMENTS = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    patient_id: 'p1111111-1111-1111-1111-111111111111',
    patient_name: 'Azamat Aliyev',
    patient_phone: '+998 90 111 22 33',
    doctor_id: 'd2222222-2222-2222-2222-222222222222',
    doctor_name: 'Dr. Nilufar Karimova',
    service_id: 's1111111-0000-0000-0000-000000000003',
    service_name: 'Svetovoy plomba (Germaniya kompoziti)',
    service_price: 280000,
    appointment_date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    end_time: '10:45',
    status: 'tasdiqlandi',
    patient_complaint: "Yuqori o'ng tishda shirin yeganda og'riq bor",
    created_via: 'webapp',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    patient_id: 'p2222222-2222-2222-2222-222222222222',
    patient_name: 'Shahnoza Normurodova',
    patient_phone: '+998 93 444 55 66',
    doctor_id: 'd3333333-3333-3333-3333-333333333333',
    doctor_name: 'Dr. Jasur Bekmurodov',
    service_id: 's1111111-0000-0000-0000-000000000006',
    service_name: "Breket o'rnatish (Bitta jag' uchun)",
    service_price: 3500000,
    appointment_date: new Date().toISOString().split('T')[0],
    start_time: '11:30',
    end_time: '12:30',
    status: 'kutilmoqda',
    patient_complaint: 'Breket profilaktik tekshiruvi va tortish',
    created_via: 'webapp',
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    patient_id: 'p3333333-3333-3333-3333-333333333333',
    patient_name: 'Bobur Mirzayev',
    patient_phone: '+998 97 777 88 99',
    doctor_id: 'd1111111-1111-1111-1111-111111111111',
    doctor_name: 'Dr. Rustam Xoliqov',
    service_id: 's1111111-0000-0000-0000-000000000007',
    service_name: "Dental Implant o'rnatish (Osstem / Koreya)",
    service_price: 3200000,
    appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    start_time: '14:30',
    end_time: '15:30',
    status: 'tasdiqlandi',
    patient_complaint: "Implantatsiya bo'yicha rentgen tahlili",
    created_via: 'phone',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export const INITIAL_DENTAL_RECORDS = {
  'p1111111-1111-1111-1111-111111111111': {
    16: { condition: 'plomba', diagnosis: "O'rta kariyes davolangan", date: '2026-05-10', doctor: 'Dr. Nilufar Karimova' },
    24: { condition: 'kariyes', diagnosis: "Boshlang'ich kariyes", date: '2026-09-10', doctor: 'Dr. Nilufar Karimova' },
    48: { condition: 'olingan', diagnosis: 'Distopik aql tishi olib tashlangan', date: '2025-11-20', doctor: 'Dr. Rustam Xoliqov' }
  },
  'p2222222-2222-2222-2222-222222222222': {
    11: { condition: 'koronka', diagnosis: 'Keramik vinir', date: '2026-01-15', doctor: 'Dr. Jasur Bekmurodov' }
  }
};
