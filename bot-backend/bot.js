// ====================================================================
// DentaCare — Rasmiy Telegram Bot Servisi (@dentalclinicuzbot)
// ====================================================================

import dotenv from 'dotenv';
import { supabase, logNotification } from './supabase.js';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN || '8880891529:AAEnaYtrY-QhGy22S4jyPU0ZaNMdpS-MPW0';
const WEBAPP_URL = process.env.WEBAPP_URL || 'http://localhost:3000';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '';

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Foydalanuvchilarning bosqichma-bosqich navbat olish holati (In-memory session state)
const userSessions = new Map();

// Boshlang'ich klinika ma'lumotlari
export const SERVICES_LIST = [
  { id: 'srv_1', name: "Breket o'rnatish", price: 3500000, duration: 60 },
  { id: 'srv_2', name: "Svetovoy plomba", price: 280000, duration: 40 },
  { id: 'srv_3', name: "Tish qo'ydirish (Implant)", price: 3200000, duration: 60 },
  { id: 'srv_4', name: "Tish oldirish (Sug'urish)", price: 200000, duration: 30 },
  { id: 'srv_5', name: "Tish tozalash (Air Flow)", price: 300000, duration: 30 },
  { id: 'srv_6', name: "Ko'rik va maslahat", price: 50000, duration: 20 }
];

export const DOCTORS_LIST = [
  { id: 'doc_1', name: 'Dr. Ismailov Mansurbek', specialty: 'Bosh shifokor, Ortodont', phone: '+998 97 422 99 92', room: '1-xona' },
  { id: 'doc_2', name: 'Dr. Ismailov Muhammad', specialty: 'Stomatolog-Terapevt', phone: '+998 33 121 21 31', room: '2-xona' }
];

export const TIME_SLOTS = ['09:30', '10:30', '11:30', '14:30', '15:30', '16:30', '17:30'];

// Yordamchi: Telegram API ga so'rov yuborish
export async function callTelegramApi(method, payload) {
  if (!BOT_TOKEN) return { ok: false, error: 'Token yo\'q' };

  try {
    const res = await fetch(`${TELEGRAM_API}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (error) {
    console.error(`Telegram API xatosi (${method}):`, error.message);
    return { ok: false, error: error.message };
  }
}

// Bot buyruqlari menyusini Telegramda ro'yxatdan o'tkazish
export async function setupBotCommands() {
  await callTelegramApi('setMyCommands', {
    commands: [
      { command: 'start', description: 'Botni ishga tushirish va asosiy menyu' },
      { command: 'navbat', description: 'Tezkor qabulga navbat olish' },
      { command: 'buyurtmalarim', description: 'Mening navbatlarim' },
      { command: 'manzil', description: 'Klinika manzili va ish vaqti' },
      { command: 'bekor', description: 'Joriy amalni bekor qilish' }
    ]
  });

  // Pastki chap burchakdagi doimiy Menu tugmasi (WebApp)
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
  userSessions.delete(chatId); // holatni tozalash

  const text = `Assalomu alaykum, <b>${firstName}</b>!\n\n` +
    `🦷 <b>ORTHODONT-M Stomatologiya Markaziga</b> xush kelibsiz.\n\n` +
    `Bizning shifokorlarimiz:\n` +
    `👨‍⚕️ <b>Dr. Ismailov Mansurbek</b> (Ortodont / Bosh shifokor) — 📞 +998 97 422 99 92\n` +
    `👨‍⚕️ <b>Dr. Ismailov Muhammad</b> (Stomatolog-Terapevt) — 📞 +998 33 121 21 31\n\n` +
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

  // Doimiy klaviatura
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

// 2. Bot orqali bosqichma-bosqich navbat olish jarayoni

// 1-qadam: Xizmat tanlash
export async function promptServiceSelection(chatId, messageId = null) {
  userSessions.set(chatId, { step: 'select_service' });

  const text = `📋 <b>1-Qadam: Kerakli xizmatni tanlang:</b>`;

  const inline_keyboard = SERVICES_LIST.map(s => ([
    {
      text: `${s.name} — ${new Intl.NumberFormat('uz-UZ').format(s.price)} so'm`,
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

// 2-qadam: Shifokor tanlash
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

  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    if (d.getDay() === 0) continue; // Yakshanba dam olish

    const dateStr = d.toISOString().split('T')[0];
    const label = i === 0 ? 'Bugun' : i === 1 ? 'Ertaga' : weekdays[d.getDay()];
    const formatted = `${label}, ${d.getDate()} ${months[d.getMonth()]}`;

    days.push({ dateStr, formatted });
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

  // Soatlarni 2 ustunda chiroyli taxlash
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

  const text = `📱 <b>Yakuniy qadam: Telefon raqamingizni tasdiqlang.</b>\n\n` +
    `Shifokor siz bilan bog'lanishi va qabulni tasdiqlashi uchun pastdagi <b>"📱 Raqamimni ulashish"</b> tugmasini bosing yoki raqamingizni yozib yuboring (masalan: +998901234567):`;

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

  // Supabase mavjud bo'lsa saqlash
  if (supabase) {
    try {
      await supabase.from('appointments').insert([{
        doctor_name: bookingData.doctor_name,
        service_name: bookingData.service_name,
        service_price: bookingData.service_price,
        appointment_date: bookingData.appointment_date,
        start_time: bookingData.start_time,
        patient_name: bookingData.patient_name,
        patient_phone: bookingData.patient_phone,
        patient_telegram_id: chatId,
        status: 'kutilmoqda',
        created_via: 'telegram_bot'
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
    `👨‍⚕️ <b>Shifokor:</b> ${bookingData.doctor_name}\n` +
    `📅 <b>Sana:</b> ${bookingData.appointment_date}\n` +
    `⏰ <b>Soat:</b> ${bookingData.start_time}\n` +
    `👤 <b>Bemor:</b> ${bookingData.patient_name}\n` +
    `📞 <b>Aloqa:</b> ${bookingData.patient_phone}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📍 <b>Manzil:</b> Toshkent sh., Minor metro bekati, Amir Temur 45\n` +
    `📞 <b>Klinika telefoni:</b> +998 71 200 44 22\n\n` +
    `<i>Iltimos, qabul vaqtidan 10 daqiqa oldin yetib kelishingizni so'raymiz.</i>`;

  // Asosiy menyuni tiklash
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

  // Admin yoki shifokorlar guruhiga bildirishnoma yuborish
  await notifyAdminNewBooking(bookingData);
  await logNotification(bookingId, chatId, 'patient', `Bot orqali yangi navbat olindi: #${bookingId}`);
}

// 3. Xabarnomalar (Notification servislari)
export async function sendAppointmentTicket(chatId, booking) {
  if (!chatId) return null;

  const text = `✅ <b>Sizning navbatingiz qabul qilindi!</b>\n\n` +
    `📋 <b>Qabul tafsilotlari:</b>\n` +
    `• <b>Chipta ID:</b> #${booking.id ? String(booking.id).slice(-6).toUpperCase() : 'NEW'}\n` +
    `• <b>Xizmat:</b> ${booking.service_name || "Stomatologiya ko'rigi"}\n` +
    `• <b>Shifokor:</b> ${booking.doctor_name || "Navbatchi shifokor"}\n` +
    `• <b>Sana:</b> 📅 ${booking.appointment_date}\n` +
    `• <b>Vaqt:</b> ⏰ ${booking.start_time}\n` +
    `• <b>Bemor:</b> ${booking.patient_name}\n\n` +
    `📍 <b>Manzil:</b> Minor metro, Amir Temur 45\n` +
    `📞 <b>Telefon:</b> +998 71 200 44 22`;

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
    `🌐 <b>Manba:</b> ${booking.created_via === 'telegram_bot' ? 'Telegram Bot' : 'Telegram WebApp'}`;

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
    statusText = '🟢 <b>Sizning navbatingiz shifokor tomonidan TASDIQLANDI!</b>\n\nSizni belgilangan vaqtda kutamiz.';
  } else if (newStatus === 'bekor_qilindi') {
    statusText = '🔴 <b>Sizning navbatingiz bekor qilindi.</b>\n\nBoshqa vaqtni tanlash uchun qayta navbat olishingiz mumkin.';
  } else if (newStatus === 'yakunlandi') {
    statusText = '✅ <b>Muolajangiz muvaffaqiyatli yakunlandi!</b>\n\nDentaCare klinikasini tanlaganingiz uchun tashakkur!';
  } else {
    statusText = `ℹ️ <b>Navbatingiz holati:</b> ${newStatus}`;
  }

  const text = `${statusText}\n\n` +
    `• <b>Sana:</b> ${booking.appointment_date} (${booking.start_time})\n` +
    `• <b>Shifokor:</b> ${booking.doctor_name}\n` +
    `• <b>Xizmat:</b> ${booking.service_name}`;

  return await callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML'
  });
}

// 4. Klinika ma'lumotlari va Mening navbatlarim
export async function sendClinicInfo(chatId) {
  const text = `🏥 <b>ORTHODONT-M Zamonaviy Stomatologiya Markazi</b>\n\n` +
    `📍 <b>Manzil:</b> Toshkent sh., Yunusobod tumani\n` +
    `🚇 <b>Mo'ljal:</b> Minor metro bekati yaqinida\n` +
    `⏰ <b>Ish vaqti:</b> 09:00 - 19:00 (Dushanba — Shanba)\n\n` +
    `👨‍⚕️ <b>Dr. Ismailov Mansurbek:</b> +998 97 422 99 92\n` +
    `👨‍⚕️ <b>Dr. Ismailov Muhammad:</b> +998 33 121 21 31\n\n` +
    `✨ <i>Bizning afzalliklarimiz: Yuqori sifatli breketlar, 100% steril tozalik va og'riqsiz muolajalar.</i>`;

  const inline_keyboard = [
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
    `Sizning faol navbatlaringiz holatini ko'rish va bekor qilish uchun quyidagi <b>"Mening Navbatlarim"</b> tugmasi orqali Mini App'ni oching:`;

  const inline_keyboard = [
    [{ text: '📱 Navbatlarimni Ko\'rish', web_app: { url: `${WEBAPP_URL}?tab=my-bookings` } }]
  ];

  return await callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard }
  });
}

// 5. Polling mexanizmi (Yangi xabarlarni eshitish va javob berish)
let lastUpdateId = 0;

export async function startBotPolling() {
  if (!BOT_TOKEN) return;

  console.log(`🤖 Telegram Bot (@dentalclinicuzbot) ishga tushdi...`);
  await setupBotCommands();

  const poll = async () => {
    try {
      const response = await fetch(`${TELEGRAM_API}/getUpdates?offset=${lastUpdateId + 1}&timeout=25`);
      const data = await response.json();

      if (data.ok && data.result && data.result.length > 0) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;

          // 1. Matnli xabarlar va Kontaktlar
          if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text?.trim() || '';
            const user = update.message.from;

            // Kontakt yuborilganda
            if (update.message.contact) {
              const phone = update.message.contact.phone_number;
              await completeBooking(chatId, phone, user);
              continue;
            }

            // Bekor qilish
            if (text === '/bekor' || text === '❌ Bekor qilish') {
              userSessions.delete(chatId);
              await sendWelcomeMessage(chatId, user?.first_name);
              continue;
            }

            // Agar kontakt kutilyotgan paytda foydalanuvchi telefon raqamini yozgan bo'lsa
            const session = userSessions.get(chatId);
            if (session && session.step === 'awaiting_contact') {
              if (text.length >= 9) {
                await completeBooking(chatId, text, user);
                continue;
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
          }

          // 2. Inline tugmalar (Callback Queries)
          if (update.callback_query) {
            const query = update.callback_query;
            const chatId = query.message.chat.id;
            const messageId = query.message.message_id;
            const data = query.data;

            // Telegram ga javob qaytarish (loaderni to'xtatish)
            callTelegramApi('answerCallbackQuery', { callback_query_id: query.id }).catch(() => {});

            if (data === 'start_bot_booking') {
              await promptServiceSelection(chatId, messageId);
            } else if (data.startsWith('service_')) {
              const serviceId = data.replace('service_', '');
              const srv = SERVICES_LIST.find(s => s.id === serviceId) || SERVICES_LIST[0];
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
        }
      }
    } catch (e) {
      // Vaqtincha tarmoq uzilishlarida tinchgina kutish
    }
    setTimeout(poll, 1500);
  };

  poll();
}
