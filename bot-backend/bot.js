// ====================================================================
// Ismailov Dental Clinic — Rasmiy Telegram Bot Servisi (@dentalclinicuzbot)
// Manzil: Qo'shko'pir tumani, Al-Beruniy ko'chasi, park oldida
// Lokatsiya: https://maps.app.goo.gl/sbZqccuTv1p9bKdK6
// Bosh shifokor: Dr. Ismailov Mansurbek (+998 97 422 99 92)
// Shifokor: Dr. Ismailov Muhammad (+998 33 121 21 31)
// WebApp: https://dentaluz2.netlify.app
// ====================================================================

import dotenv from 'dotenv';
import { supabase, logNotification } from './supabase.js';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const WEBAPP_URL = process.env.WEBAPP_URL || '';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '';
const MAPS_URL = 'https://maps.app.goo.gl/sbZqccuTv1p9bKdK6';

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const CLINIC_ID = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

// Foydalanuvchilarning bosqichma-bosqich navbat olish sessiyalari
const userSessions = new Map();

// Standart xizmatlar (Admin panelda yangilansa, bazadan avtomatik olinadi)
export const DEFAULT_SERVICES = [
  { id: 'c6666666-6666-6666-6666-666666666666', name: "Breket o'rnatish", price: 3500000, duration: 60 },
  { id: 'c2222222-2222-2222-2222-222222222222', name: "Svetovoy plomba", price: 280000, duration: 40 },
  { id: 'c7777777-7777-7777-7777-777777777777', name: "Tish qo'ydirish (Implant)", price: 3200000, duration: 60 },
  { id: 'c5555555-5555-5555-5555-555555555555', name: "Tish oldirish (Sug'urish)", price: 200000, duration: 30 },
  { id: 'c3333333-3333-3333-3333-333333333333', name: "Tish tozalash (Air Flow)", price: 300000, duration: 30 },
  { id: 'c1111111-1111-1111-1111-111111111111', name: "Ko'rik va maslahat", price: 50000, duration: 20 }
];

// Faqat 2 ta asosiy shifokor
export const DOCTORS_LIST = [
  { 
    id: 'd1111111-1111-1111-1111-111111111111', 
    name: 'Dr. Ismailov Mansurbek', 
    specialty: 'Ortodont / Bosh shifokor', 
    phone: '+998 97 422 99 92', 
    room: '1-xona',
    photo_url: null
  },
  { 
    id: 'd2222222-2222-2222-2222-222222222222', 
    name: 'Dr. Ismailov Muhammad', 
    specialty: 'Stomatolog-Terapevt', 
    phone: '+998 33 121 21 31', 
    room: '2-xona',
    photo_url: '/dr-muhammad.png'
  }
];

export const TIME_SLOTS = ['09:30', '10:30', '11:30', '14:30', '15:30', '16:30', '17:30'];

// Tezkor xotira keshi (Performance va qotishlarni oldini olish uchun)
let cachedServices = null;
let lastServicesFetch = 0;
const SERVICES_CACHE_TTL = 60 * 1000; // 60 soniya kesh

// Dinamik xizmatlar va narxlarni olish (Kesh orqali tezkor 0ms qaytadi)
export async function getServices(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedServices && (now - lastServicesFetch < SERVICES_CACHE_TTL)) {
    return cachedServices;
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, price, duration_minutes')
        .eq('is_active', true)
        .order('price', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        cachedServices = data.map(s => ({
          id: s.id,
          name: s.name,
          price: Number(s.price),
          duration: s.duration_minutes || 30
        }));
        lastServicesFetch = now;
        return cachedServices;
      }
    } catch (err) {
      console.warn('Supabase xizmatlarini yuklashda xato:', err.message);
    }
  }

  if (!cachedServices) {
    cachedServices = DEFAULT_SERVICES;
    lastServicesFetch = now;
  }
  return cachedServices;
}

// Telegram API ga tezkor va barqaror so'rov yuborish
export async function callTelegramApi(method, payload) {
  if (!BOT_TOKEN) return { ok: false, error: "Bot token kiritilmagan" };

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${TELEGRAM_API}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return await res.json();
    } catch (error) {
      if (attempt === 2) {
        console.error(`Telegram API xatosi (${method}):`, error.message);
        return { ok: false, error: error.message };
      }
      await new Promise(r => setTimeout(r, 300));
    }
  }
}

// Narxni chiroyli formatlash
function formatPrice(p) {
  return new Intl.NumberFormat('uz-UZ').format(p) + " so'm";
}

// Bot buyruqlari va pastki menyu tugmasini sozlash
export async function setupBotCommands() {
  await callTelegramApi('setMyName', { name: 'Ismailov Dental Clinic' });

  await callTelegramApi('setMyDescription', { 
    description: `🦷 Ismailov Dental Clinic — Stomatologiya Markazining rasmiy boti.\n\n` +
      `📍 Manzil: Qo'shko'pir tumani, Al-Beruniy ko'chasi, park oldida\n` +
      `🗺 Xaritada: ${MAPS_URL}\n\n` +
      `Bizning shifokorlarimiz:\n` +
      `👨‍⚕️ Dr. Ismailov Mansurbek (Ortodont / Bosh shifokor) — 📞 +998 97 422 99 92\n` +
      `👨‍⚕️ Dr. Ismailov Muhammad (Stomatolog-Terapevt) — 📞 +998 33 121 21 31\n\n` +
      `Online navbat olish uchun bot yoki WebApp'dan foydalaning!`
  });

  await callTelegramApi('setMyShortDescription', { 
    short_description: `Ismailov Dental Clinic — Online navbat olish boti` 
  });

  await callTelegramApi('setMyCommands', {
    commands: [
      { command: 'start', description: 'Botni ishga tushirish va asosiy menyu' },
      { command: 'navbat', description: 'Tezkor qabulga navbat olish' },
      { command: 'buyurtmalarim', description: 'Mening navbatlarim' },
      { command: 'manzil', description: 'Klinika manzili, lokatsiya va aloqa' },
      { command: 'bekor', description: 'Joriy amalni bekor qilish' }
    ]
  });

  await callTelegramApi('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: '🦷 Navbat Olish',
      web_app: { url: WEBAPP_URL }
    }
  });
}

// 1. Asosiy menyu va /start xabari
export async function sendWelcomeMessage(chatId, firstName = 'Hurmatli mijoz') {
  userSessions.delete(chatId);

  const text = `Assalomu alaykum, <b>${firstName}</b>!\n\n` +
    `🦷 <b>Ismailov Dental Clinic</b> stomatologiya markaziga xush kelibsiz.\n\n` +
    `Bizning shifokorlarimiz:\n` +
    `👨‍⚕️ <b>Dr. Ismailov Mansurbek</b> (Ortodont / Bosh shifokor) — 📞 +998 97 422 99 92\n` +
    `👨‍⚕️ <b>Dr. Ismailov Muhammad</b> (Stomatolog-Terapevt) — 📞 +998 33 121 21 31\n\n` +
    `📍 <b>Manzil:</b> Qo'shko'pir tumani, Al-Beruniy ko'chasi, park oldida\n` +
    `🗺 <a href="${MAPS_URL}">Google Xaritada ko'rish (Lokatsiya)</a>\n\n` +
    `👇 <b>Qabulga yozilish uchun qulay usulni tanlang:</b>`;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: '📱 WebApp orqali navbat olish',
          web_app: { url: WEBAPP_URL }
        }
      ],
      [
        {
          text: '⚡ Bot orqali tezkor navbat olish',
          callback_data: 'start_bot_booking'
        }
      ],
      [
        {
          text: '📋 Mening navbatlarim',
          callback_data: 'view_my_bookings'
        },
        {
          text: '📍 Manzil va Ish vaqti',
          callback_data: 'view_clinic_info'
        }
      ]
    ]
  };

  const mainKeyboard = {
    keyboard: [
      [{ text: '🦷 WebApp Mini App', web_app: { url: WEBAPP_URL } }, { text: '⚡ Tezkor Navbat Olish' }],
      [{ text: '📋 Mening Navbatlarim' }, { text: '📍 Manzil va Aloqa' }]
    ],
    resize_keyboard: true
  };

  return await callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: replyMarkup
  });
}

// 2. Bosqichma-bosqich navbat olish jarayoni

// 1-qadam: Xizmat tanlash (Admin paneldan o'zgartirilgan narxlar bilan)
export async function promptServiceSelection(chatId, messageId = null) {
  userSessions.set(chatId, { step: 'select_service' });

  const services = await getServices();
  const text = `📋 <b>1-Qadam: Kerakli xizmatni tanlang:</b>\n<i>(Narxlar klinika boshqaruv paneliga muvofiq)</i>`;

  const inline_keyboard = services.map(s => ([
    {
      text: `${s.name} — ${formatPrice(s.price)}`,
      callback_data: `service_${s.id}`
    }
  ]));

  inline_keyboard.push([{ text: '❌ Bekor qilish', callback_data: 'cancel_booking' }]);

  if (messageId) {
    return await callTelegramApi('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard }
    });
  }

  return await callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard }
  });
}

// 2-qadam: Shifokor tanlash (Faqat 2 ta shifokor)
export async function promptDoctorSelection(chatId, messageId = null) {
  const session = userSessions.get(chatId) || {};
  session.step = 'select_doctor';
  userSessions.set(chatId, session);

  const text = `👨‍⚕️ <b>2-Qadam: Qabul qiluvchi shifokorni tanlang:</b>`;

  const inline_keyboard = DOCTORS_LIST.map(d => ([
    {
      text: `${d.name} (${d.specialty})`,
      callback_data: `doctor_${d.id}`
    }
  ]));

  inline_keyboard.push([
    { text: '⬅️ Ortga', callback_data: 'back_to_services' },
    { text: '❌ Bekor qilish', callback_data: 'cancel_booking' }
  ]);

  if (messageId) {
    return await callTelegramApi('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard }
    });
  }

  return await callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard }
  });
}

// 3-qadam: Kun tanlash
export async function promptDateSelection(chatId, messageId = null) {
  const session = userSessions.get(chatId) || {};
  session.step = 'select_date';
  userSessions.set(chatId, session);

  const days = [];
  const weekdays = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    if (d.getDay() === 0) continue; // Yakshanba dam olish

    const dateStr = d.toISOString().split('T')[0];
    const label = i === 0 ? 'Bugun' : i === 1 ? 'Ertaga' : weekdays[d.getDay()];
    const formatted = `${label}, ${d.getDate()} ${months[d.getMonth()]}`;

    days.push({ dateStr, formatted });
    if (days.length >= 4) break;
  }

  const text = `📅 <b>3-Qadam: Qabul kunini tanlang:</b>`;

  const inline_keyboard = days.map(day => ([
    {
      text: day.formatted,
      callback_data: `date_${day.dateStr}`
    }
  ]));

  inline_keyboard.push([
    { text: '⬅️ Ortga', callback_data: 'back_to_doctors' },
    { text: '❌ Bekor qilish', callback_data: 'cancel_booking' }
  ]);

  if (messageId) {
    return await callTelegramApi('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard }
    });
  }

  return await callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard }
  });
}

// 4-qadam: Soat tanlash
export async function promptTimeSelection(chatId, messageId = null) {
  const session = userSessions.get(chatId) || {};
  session.step = 'select_time';
  userSessions.set(chatId, session);

  const text = `⏰ <b>4-Qadam: Qulay qabul soatini tanlang:</b>\n` +
    `Tanlangan sana: <b>${session.date}</b>`;

  const inline_keyboard = [];
  for (let i = 0; i < TIME_SLOTS.length; i += 2) {
    const row = [
      { text: `🕐 ${TIME_SLOTS[i]}`, callback_data: `time_${TIME_SLOTS[i]}` }
    ];
    if (TIME_SLOTS[i + 1]) {
      row.push({ text: `🕐 ${TIME_SLOTS[i + 1]}`, callback_data: `time_${TIME_SLOTS[i + 1]}` });
    }
    inline_keyboard.push(row);
  }

  inline_keyboard.push([
    { text: '⬅️ Ortga', callback_data: 'back_to_dates' },
    { text: '❌ Bekor qilish', callback_data: 'cancel_booking' }
  ]);

  if (messageId) {
    return await callTelegramApi('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard }
    });
  }

  return await callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard }
  });
}

// 5-qadam: Telefon raqam so'rash
export async function promptContactInput(chatId) {
  const session = userSessions.get(chatId) || {};
  session.step = 'awaiting_contact';
  userSessions.set(chatId, session);

  const text = `📱 <b>Yakuniy qadam: Telefon raqamingizni yuboring.</b>\n\n` +
    `Shifokor siz bilan bog'lanishi uchun pastdagi <b>"📱 Raqamimni ulashish"</b> tugmasini bosing yoki raqamingizni yozib yuboring (masalan: +998971234567):`;

  const reply_markup = {
    keyboard: [
      [{ text: '📱 Raqamimni ulashish', request_contact: true }],
      [{ text: '❌ Bekor qilish' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  };

  return await callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup
  });
}

// 6-qadam: Navbatni yakunlash va chipta chiqarish
export async function completeBooking(chatId, phone, user) {
  const session = userSessions.get(chatId);
  if (!session || !session.service || !session.doctor || !session.date || !session.time) {
    return await sendWelcomeMessage(chatId, user?.first_name);
  }

  const patientName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Hurmatli bemor';
  const bookingId = 'B' + Math.floor(100000 + Math.random() * 900000);

  const bookingData = {
    id: bookingId,
    patient_name: patientName,
    patient_phone: phone,
    patient_telegram_id: chatId,
    service_id: session.service.id,
    service_name: session.service.name,
    service_price: session.service.price,
    doctor_id: session.doctor.id,
    doctor_name: session.doctor.name,
    doctor_specialty: session.doctor.specialty,
    appointment_date: session.date,
    start_time: session.time,
    status: 'kutilmoqda',
    created_via: 'telegram_bot'
  };

  // Supabase bazasiga to'liq saqlash
  if (supabase) {
    try {
      const parts = session.time.split(':');
      const h = parseInt(parts[0], 10) || 10;
      const m = parseInt(parts[1], 10) || 0;
      const total = h * 60 + m + (session.service.duration || 30);
      const endH = Math.floor(total / 60) % 24;
      const endM = total % 60;
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;

      await supabase.from('appointments').insert([{
        clinic_id: CLINIC_ID,
        doctor_id: session.doctor.id,
        service_id: session.service.id,
        patient_name: patientName,
        patient_phone: phone,
        patient_telegram_id: chatId,
        appointment_date: session.date,
        start_time: `${session.time}:00`,
        end_time: endTime,
        price_uzs: session.service.price,
        status: 'kutilmoqda',
        booking_source: 'telegram_bot',
        notes: `Bot orqali: ${session.service.name}`
      }]);
    } catch (e) {
      console.warn('Supabase bot orqali saqlashda xato:', e.message);
    }
  }

  // Sessiyani tozalash
  userSessions.delete(chatId);

  // Bemorga elektron chipta yuborish
  const confirmationText = `🎉 <b>Navbatingiz muvaffaqiyatli qabul qilindi!</b>\n\n` +
    `📋 <b>Elektron Qabul Chiptasi:</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🔢 <b>Chipta ID:</b> #${bookingId}\n` +
    `🩺 <b>Xizmat:</b> ${bookingData.service_name}\n` +
    `💰 <b>Narxi:</b> ${formatPrice(bookingData.service_price)}\n` +
    `👨‍⚕️ <b>Shifokor:</b> ${bookingData.doctor_name}\n` +
    `📅 <b>Sana:</b> ${bookingData.appointment_date}\n` +
    `⏰ <b>Soat:</b> ${bookingData.start_time}\n` +
    `👤 <b>Bemor:</b> ${bookingData.patient_name}\n` +
    `📞 <b>Aloqa:</b> ${bookingData.patient_phone}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📍 <b>Manzil:</b> Qo'shko'pir tumani, Al-Beruniy ko'chasi (Park oldida)\n` +
    `🗺 <b>Lokatsiya:</b> ${MAPS_URL}\n` +
    `📞 <b>Klinika telefoni:</b> +998 97 422 99 92 / +998 33 121 21 31\n\n` +
    `<i>Iltimos, qabul vaqtidan 10 daqiqa oldin yetib kelishingizni so'raymiz.</i>`;

  const mainKeyboard = {
    keyboard: [
      [{ text: '🦷 WebApp Mini App', web_app: { url: WEBAPP_URL } }, { text: '⚡ Tezkor Navbat Olish' }],
      [{ text: '📋 Mening Navbatlarim' }, { text: '📍 Manzil va Aloqa' }]
    ],
    resize_keyboard: true
  };

  await callTelegramApi('sendMessage', {
    chat_id: chatId,
    text: confirmationText,
    parse_mode: 'HTML',
    reply_markup: mainKeyboard
  });

  // Admin yoki shifokorlarga bildirishnoma
  await notifyAdminNewBooking(bookingData);
  await logNotification(bookingId, chatId, 'patient', `Bot orqali yangi navbat olindi: #${bookingId}`);
}

// 3. Xabarnomalar (Notification servislari)
export async function sendAppointmentTicket(chatId, booking) {
  if (!chatId) return null;

  const text = `✅ <b>Sizning navbatingiz qabul qilindi!</b>\n\n` +
    `📋 <b>Qabul tafsilotlari:</b>\n` +
    `• <b>Chipta:</b> #${booking.id ? String(booking.id).slice(-6).toUpperCase() : 'YANGI'}\n` +
    `• <b>Xizmat:</b> ${booking.service_name || "Stomatologiya ko'rigi"}\n` +
    `• <b>Shifokor:</b> ${booking.doctor_name || "Dr. Ismailov Mansurbek"}\n` +
    `• <b>Sana:</b> 📅 ${booking.appointment_date}\n` +
    `• <b>Vaqt:</b> ⏰ ${booking.start_time}\n` +
    `• <b>Bemor:</b> ${booking.patient_name}\n\n` +
    `📍 <b>Manzil:</b> Ismailov Dental Clinic (Qo'shko'pir tumani, Al-Beruniy ko'chasi, park oldida)\n` +
    `🗺 <b>Lokatsiya:</b> ${MAPS_URL}\n` +
    `📞 <b>Aloqa:</b> +998 97 422 99 92 / +998 33 121 21 31`;

  return await callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML'
  });
}

export async function notifyAdminNewBooking(booking) {
  const targetChatId = ADMIN_CHAT_ID || process.env.ADMIN_CHAT_ID;
  if (!targetChatId) return null;

  const text = `🚨 <b>YANGI NAVBAT BAND QILINDI!</b>\n\n` +
    `👤 <b>Bemor:</b> ${booking.patient_name}\n` +
    `📞 <b>Telefon:</b> ${booking.patient_phone}\n` +
    `🩺 <b>Xizmat:</b> ${booking.service_name}\n` +
    `👨‍⚕️ <b>Shifokor:</b> ${booking.doctor_name}\n` +
    `📅 <b>Sana:</b> ${booking.appointment_date}\n` +
    `⏰ <b>Soat:</b> ${booking.start_time}\n` +
    `🌐 <b>Manba:</b> ${booking.booking_source === 'telegram_bot' ? 'Telegram Bot' : 'Telegram WebApp'}`;

  return await callTelegramApi('sendMessage', {
    chat_id: targetChatId,
    text,
    parse_mode: 'HTML'
  });
}

export async function notifyPatientStatusUpdate(chatId, booking, newStatus) {
  if (!chatId) return null;

  let statusText = '';
  if (newStatus === 'tasdiqlandi') {
    statusText = '🟢 <b>Sizning navbatingiz shifokor tomonidan TASDIQLANDI!</b>\n\nSizni belgilangan vaqtda klinikamizda kutamiz.';
  } else if (newStatus === 'bekor_qilindi') {
    statusText = '🔴 <b>Sizning navbatingiz bekor qilindi.</b>\n\nBoshqa vaqtni tanlash uchun qayta navbat olishingiz mumkin.';
  } else if (newStatus === 'bajarildi') {
    statusText = '✅ <b>Muolajangiz muvaffaqiyatli yakunlandi!</b>\n\nIsmailov Dental Clinic markazini tanlaganingiz uchun tashakkur!';
  } else {
    statusText = `ℹ️ <b>Navbatingiz holati yangilandi:</b> ${newStatus}`;
  }

  const text = `${statusText}\n\n` +
    `• <b>Sana:</b> ${booking.appointment_date} (${booking.start_time})\n` +
    `• <b>Shifokor:</b> ${booking.doctor_name || 'Dr. Ismailov Mansurbek'}\n` +
    `• <b>Xizmat:</b> ${booking.service_name || 'Stomatologiya xizmati'}\n` +
    `📍 <b>Ismailov Dental Clinic</b> (Qo'shko'pir tumani, Al-Beruniy ko'chasi, park oldida)`;

  return await callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML'
  });
}

// 4. Klinika ma'lumotlari va Mening navbatlarim
export async function sendClinicInfo(chatId) {
  const text = `🏥 <b>Ismailov Dental Clinic — Zamonaviy Stomatologiya Markazi</b>\n\n` +
    `📍 <b>Manzil:</b> Qo'shko'pir tumani, Al-Beruniy ko'chasi, park oldida\n` +
    `🗺 <b>Lokatsiya:</b> ${MAPS_URL}\n` +
    `⏰ <b>Ish vaqti:</b> 09:00 - 19:00 (Dushanba — Shanba)\n\n` +
    `👨‍⚕️ <b>Dr. Ismailov Mansurbek (Ortodont / Bosh shifokor):</b>\n` +
    `📞 +998 97 422 99 92\n\n` +
    `👨‍⚕️ <b>Dr. Ismailov Muhammad (Stomatolog-Terapevt):</b>\n` +
    `📞 +998 33 121 21 31\n\n` +
    `✨ <i>Bizning xizmatlar: Breket o'rnatish, Svetovoy plomba, Implant qo'yish, Tish sug'urish, Air Flow tozalash.</i>`;

  const inline_keyboard = [
    [{ text: '🗺 Xaritada Ko\'rish (Google Maps)', url: MAPS_URL }],
    [{ text: '🦷 Navbat Olish (WebApp)', web_app: { url: WEBAPP_URL } }]
  ];

  return await callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard }
  });
}

export async function sendMyBookings(chatId) {
  const text = `📋 <b>Sizning navbatlaringiz:</b>\n\n` +
    `Sizning barcha faol navbatlaringiz holatini ko'rish uchun quyidagi tugma orqali WebApp'ni oching:`;

  const inline_keyboard = [
    [{ text: "📱 Navbatlarimni Ko'rish", web_app: { url: `${WEBAPP_URL}?tab=my-bookings` } }]
  ];

  return await callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard }
  });
}

// 5. Polling mexanizmi (24/7 Yangi xabarlarni eshitish va javob berish)
let lastUpdateId = 0;

export async function startBotPolling() {
  if (!BOT_TOKEN) return;

  // Har doim polling oldidan eski webhookni tozalash
  try {
    await callTelegramApi('deleteWebhook', { drop_pending_updates: false });
    console.log('✅ Webhook tozalandi, long polling rejimiga o\'tildi.');
  } catch (err) {
    console.warn('Webhook tozalash xatosi:', err.message);
  }

  console.log(`🤖 Telegram Bot (@dentalclinicuzbot) polling boshlandi...`);
  await setupBotCommands();

  // Bitta yangilanishni (update) tezkor va parallel qayta ishlash
  const handleSingleUpdate = async (update) => {
    try {
      // 1. Matnli xabarlar va Kontaktlar
      if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text?.trim() || '';
        const user = update.message.from;

        // Kontakt yuborilganda
        if (update.message.contact) {
          const phone = update.message.contact.phone_number;
          await completeBooking(chatId, phone, user);
          return;
        }

        // Bekor qilish
        if (text === '/bekor' || text === '❌ Bekor qilish') {
          userSessions.delete(chatId);
          await sendWelcomeMessage(chatId, user?.first_name);
          return;
        }

        // Telefon kiritish kutilayotgan holat
        const session = userSessions.get(chatId);
        if (session && session.step === 'awaiting_contact') {
          if (text.length >= 7) {
            await completeBooking(chatId, text, user);
            return;
          }
        }

        // Buyruqlar
        if (text.startsWith('/start')) {
          await sendWelcomeMessage(chatId, user?.first_name);
        } else if (text === '/navbat' || text === '⚡ Tezkor Navbat Olish') {
          await promptServiceSelection(chatId);
        } else if (text === '/buyurtmalarim' || text === '📋 Mening Navbatlarim') {
          await sendMyBookings(chatId);
        } else if (text === '/manzil' || text === '📍 Manzil va Aloqa') {
          await sendClinicInfo(chatId);
        } else {
          await sendWelcomeMessage(chatId, user?.first_name);
        }
        return;
      }

      // 2. Inline tugmalar (Callback Queries)
      if (update.callback_query) {
        const query = update.callback_query;
        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;
        const data = query.data;

        // Tugmadagi yuklanish indikatorini DARHOL to'xtatish (Instant feedback)
        callTelegramApi('answerCallbackQuery', { callback_query_id: query.id }).catch(() => {});

        if (data === 'start_bot_booking') {
          await promptServiceSelection(chatId, messageId);
        } else if (data.startsWith('service_')) {
          const serviceId = data.replace('service_', '');
          const services = await getServices();
          const srv = services.find(s => s.id === serviceId) || services[0];
          const session = userSessions.get(chatId) || {};
          session.service = srv;
          userSessions.set(chatId, session);
          await promptDoctorSelection(chatId, messageId);
        } else if (data === 'back_to_services') {
          await promptServiceSelection(chatId, messageId);
        } else if (data.startsWith('doctor_')) {
          const docId = data.replace('doctor_', '');
          const doc = DOCTORS_LIST.find(d => d.id === docId) || DOCTORS_LIST[0];
          const session = userSessions.get(chatId) || {};
          session.doctor = doc;
          userSessions.set(chatId, session);
          await promptDateSelection(chatId, messageId);
        } else if (data === 'back_to_doctors') {
          await promptDoctorSelection(chatId, messageId);
        } else if (data.startsWith('date_')) {
          const dateStr = data.replace('date_', '');
          const session = userSessions.get(chatId) || {};
          session.date = dateStr;
          userSessions.set(chatId, session);
          await promptTimeSelection(chatId, messageId);
        } else if (data === 'back_to_dates') {
          await promptDateSelection(chatId, messageId);
        } else if (data.startsWith('time_')) {
          const timeStr = data.replace('time_', '');
          const session = userSessions.get(chatId) || {};
          session.time = timeStr;
          userSessions.set(chatId, session);
          await promptContactInput(chatId);
        } else if (data === 'view_my_bookings') {
          await sendMyBookings(chatId);
        } else if (data === 'view_clinic_info') {
          await sendClinicInfo(chatId);
        } else if (data === 'cancel_booking') {
          userSessions.delete(chatId);
          await sendWelcomeMessage(chatId, query.from?.first_name);
        }
      }
    } catch (err) {
      console.warn('Update ishlovida xato:', err.message);
    }
  };

  // Oldindan xizmatlar keshini qizdirib qo'yish (Cold start bo'lmasligi uchun)
  getServices().catch(() => {});

  const poll = async () => {
    let nextDelay = 0;
    try {
      const response = await fetch(`${TELEGRAM_API}/getUpdates?offset=${lastUpdateId + 1}&timeout=15`);
      const data = await response.json();

      if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
        for (const update of data.result) {
          lastUpdateId = Math.max(lastUpdateId, update.update_id);
          // Har bir xabarga parallel ishlov berish (navbatda kutmaslik uchun)
          handleSingleUpdate(update);
        }
      }
    } catch (e) {
      nextDelay = 2000;
    }

    if (nextDelay > 0) {
      setTimeout(poll, nextDelay);
    } else {
      setImmediate(poll);
    }
  };

  poll();
}
