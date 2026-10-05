// Ismailov Dental Clinic — Admin CRM ma'lumotlari

export const INITIAL_CLINIC = {
  id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  name: 'Ismailov Dental Clinic',
  phone: '+998 97 422 99 92',
  secondary_phone: '+998 33 121 21 31',
  email: 'info@ismailov-dental.uz',
  address: "Qo'shko'pir tumani, Al-Beruniy ko'chasi (Park oldida)",
  working_hours: '09:00 - 19:00 (Dushanba - Shanba)',
  telegram_bot: '@dentalclinicuzbot',
  telegram_admin_chat_id: '1433285502',
  currency: 'UZS'
};

export const INITIAL_DOCTORS = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    full_name: 'Dr. Ismailov Mansurbek',
    specialty: 'Bosh shifokor, Ortodont',
    experience_years: 12,
    room_number: '1-xona',
    phone: '+998 97 422 99 92',
    photo_url: null,
    bio: "Bosh shifokor, malakali ortodont. Barcha turdagi breketlar va zamonaviy tish qatorini to'g'rilash bo'yicha mutaxassis.",
    rating: 5.0,
    is_active: true
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    full_name: 'Dr. Ismailov Muhammad',
    specialty: 'Stomatolog-Terapevt',
    experience_years: 8,
    room_number: '2-xona',
    phone: '+998 33 121 21 31',
    photo_url: '/dr-muhammad.png',
    bio: "Estetik tish davolash, nurlanuvchi plomba, tish tozalash va tish sug'urish bo'yicha mutaxassis.",
    rating: 4.9,
    is_active: true
  }
];

export const INITIAL_SERVICES = [
  {
    id: 'c6666666-6666-6666-6666-666666666666',
    category: 'Ortodontiya',
    name: "Breket o'rnatish",
    description: "AQSH va Koreya breket tizimlari (bitta jag' uchun)",
    price_uzs: 3500000,
    duration_minutes: 60,
    is_active: true
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    category: 'Davolash',
    name: 'Svetovoy plomba',
    description: "Germaniya kompozit materiali, og'riqsiz va tabiiy rang",
    price_uzs: 280000,
    duration_minutes: 40,
    is_active: true
  },
  {
    id: 'c7777777-7777-7777-7777-777777777777',
    category: 'Implantatsiya',
    name: "Tish qo'ydirish (Implant)",
    description: "Titan dental implant o'rnatish (Osstem, Koreya)",
    price_uzs: 3200000,
    duration_minutes: 60,
    is_active: true
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    category: 'Jarrohlik',
    name: "Tish oldirish (Sug'urish)",
    description: "Zamonaviy anesteziya bilan og'riqsiz sug'urish",
    price_uzs: 200000,
    duration_minutes: 30,
    is_active: true
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    category: 'Gigiyena',
    name: 'Tish tozalash (Air Flow)',
    description: "Tish toshlarini tozalash va sayqallash",
    price_uzs: 300000,
    duration_minutes: 30,
    is_active: true
  },
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    category: 'Konsultatsiya',
    name: "Ko'rik va konsultatsiya",
    description: "Shifokor ko'rigi, diagnostika va davolash rejasi",
    price_uzs: 50000,
    duration_minutes: 20,
    is_active: true
  }
];

export const INITIAL_PATIENTS = [];

export const INITIAL_APPOINTMENTS = [];

export const INITIAL_DENTAL_RECORDS = {};
