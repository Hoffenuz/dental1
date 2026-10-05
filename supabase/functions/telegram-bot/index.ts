// ====================================================================
// DentaCare — Supabase Edge Function: 24/7 Telegram Bot
// Loyiha: https://jvzghreavlzjpxhnasxd.supabase.co
// Endpoint: https://jvzghreavlzjpxhnasxd.supabase.co/functions/v1/telegram-bot
// ====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN") || "8880891529:AAEnaYtrY-QhGy22S4jyPU0ZaNMdpS-MPW0";
const WEBAPP_URL = Deno.env.get("WEBAPP_URL") || "https://dentaluz2.netlify.app";
const ADMIN_CHAT_ID = Deno.env.get("ADMIN_CHAT_ID") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://jvzghreavlzjpxhnasxd.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2emdocmVhdmx6anB4aG5hc3hkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTMwMjY5NywiZXhwIjoyMTAwODc4Njk3fQ.cJF86Al2VL8wM8_vLAf15r_aj_WjZm-sJiJxi-F6Ju8";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Stomatologiya xizmatlari
// Stomatologiya xizmatlari
const SERVICES_LIST = [
  { id: "srv_1", name: "Breket o'rnatish", price: 3500000 },
  { id: "srv_2", name: "Svetovoy plomba", price: 280000 },
  { id: "srv_3", name: "Tish qo'ydirish (Implant)", price: 3200000 },
  { id: "srv_4", name: "Tish oldirish (Sug'urish)", price: 200000 },
  { id: "srv_5", name: "Tish tozalash (Air Flow)", price: 300000 },
  { id: "srv_6", name: "Ko'rik va maslahat", price: 50000 }
];

const DOCTORS_LIST = [
  { id: "doc_1", name: "Dr. Ismailov Mansurbek", specialty: "Bosh shifokor, Ortodont", phone: "+998 97 422 99 92" },
  { id: "doc_2", name: "Dr. Ismailov Muhammad", specialty: "Stomatolog-Terapevt", phone: "+998 33 121 21 31" }
];

const TIME_SLOTS = ["09:30", "10:30", "11:30", "14:30", "15:30", "16:30", "17:30"];

const CLINIC_ID = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d";

const SERVICE_UUID_MAP: Record<string, string> = {
  srv_1: "c6666666-6666-6666-6666-666666666666",
  srv_2: "c2222222-2222-2222-2222-222222222222",
  srv_3: "c7777777-7777-7777-7777-777777777777",
  srv_4: "c5555555-5555-5555-5555-555555555555",
  srv_5: "c3333333-3333-3333-3333-333333333333",
  srv_6: "c1111111-1111-1111-1111-111111111111"
};

const DOCTOR_UUID_MAP: Record<string, string> = {
  doc_1: "d1111111-1111-1111-1111-111111111111",
  doc_2: "d2222222-2222-2222-2222-222222222222"
};

function calculateEndTime(startTime: string, durationMinutes: number = 30): string {
  const parts = startTime.split(":");
  const h = parseInt(parts[0], 10) || 10;
  const m = parseInt(parts[1], 10) || 0;
  const total = h * 60 + m + durationMinutes;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`;
}

// Telegram API chaqiruvi
async function callTelegram(method: string, payload: Record<string, unknown>) {
  try {
    const res = await fetch(`${TELEGRAM_API}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error(`Telegram API error (${method}):`, err);
    return null;
  }
}

// Format narx
function formatPrice(p: number) {
  return new Intl.NumberFormat("uz-UZ").format(p) + " so'm";
}

// 1. Asosiy Menyu va /start xabari
async function sendWelcome(chatId: number, firstName: string = "Hurmatli mijoz") {
  // Telegram pastki chap menyu tugmasini ushbu chat uchun WebApp ga ulash
  callTelegram("setChatMenuButton", {
    chat_id: chatId,
    menu_button: {
      type: "web_app",
      text: "🦷 WebApp Kirish",
      web_app: { url: WEBAPP_URL }
    }
  }).catch(() => {});

  const text = `Assalomu alaykum, <b>${firstName}</b>!\n\n` +
    `🦷 <b>ORTHODONT-M Stomatologiya Markaziga</b> xush kelibsiz.\n\n` +
    `Bizning shifokorlarimiz:\n` +
    `👨‍⚕️ <b>Dr. Ismailov Mansurbek</b> (Ortodont / Bosh shifokor) — 📞 +998 97 422 99 92\n` +
    `👨‍⚕️ <b>Dr. Ismailov Muhammad</b> (Stomatolog-Terapevt) — 📞 +998 33 121 21 31\n\n` +
    `👇 <b>Qabulga yozilish uchun WebApp yoki botdan foydalaning:</b>`;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "📱 WebApp orqali navbat olish",
          web_app: { url: WEBAPP_URL }
        }
      ],
      [
        {
          text: "⚡ Bot orqali tezkor navbat olish",
          callback_data: "start_bot_booking"
        }
      ],
      [
        {
          text: "📋 Mening navbatlarim",
          callback_data: "view_my_bookings"
        },
        {
          text: "📍 Manzil va Aloqa",
          callback_data: "view_clinic_info"
        }
      ]
    ]
  };

  const keyboardMarkup = {
    keyboard: [
      [{ text: "🦷 WebApp Mini App", web_app: { url: WEBAPP_URL } }, { text: "⚡ Tezkor Navbat Olish" }],
      [{ text: "📋 Mening Navbatlarim" }, { text: "📍 Manzil va Aloqa" }]
    ],
    resize_keyboard: true
  };

  await callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: replyMarkup
  });

  await callTelegram("sendMessage", {
    chat_id: chatId,
    text: "Pastdagi <b>🦷 WebApp Mini App</b> tugmasi orqali ham ilovani ochishingiz mumkin:",
    parse_mode: "HTML",
    reply_markup: keyboardMarkup
  });
}

// 2. Bot orqali 1-bosqich: Xizmat tanlash
async function promptServiceSelection(chatId: number, messageId?: number) {
  const text = `📋 <b>1-Qadam: Kerakli xizmatni tanlang:</b>`;
  const inline_keyboard = SERVICES_LIST.map(s => ([
    {
      text: `${s.name} — ${formatPrice(s.price)}`,
      callback_data: `srv_${s.id}`
    }
  ]));

  inline_keyboard.push([{ text: "❌ Bekor qilish", callback_data: "cancel_booking" }]);

  if (messageId) {
    await callTelegram("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard }
    });
  } else {
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard }
    });
  }
}

// 3. 2-bosqich: Shifokor tanlash
async function promptDoctorSelection(chatId: number, serviceId: string, messageId?: number) {
  const text = `👨‍⚕️ <b>2-Qadam: Shifokorni tanlang:</b>`;
  const inline_keyboard = DOCTORS_LIST.map(d => ([
    {
      text: `${d.name} (${d.specialty})`,
      callback_data: `doc_${serviceId}_${d.id}`
    }
  ]));

  inline_keyboard.push([
    { text: "⬅️ Ortga", callback_data: "start_bot_booking" },
    { text: "❌ Bekor qilish", callback_data: "cancel_booking" }
  ]);

  await callTelegram(messageId ? "editMessageText" : "sendMessage", {
    chat_id: chatId,
    ...(messageId ? { message_id: messageId } : {}),
    text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard }
  });
}

// 4. 3-bosqich: Kun tanlash
async function promptDateSelection(chatId: number, serviceId: string, docId: string, messageId?: number) {
  const weekdays = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];
  const months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
  const days = [];

  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    if (d.getDay() === 0) continue;

    const dateStr = d.toISOString().split("T")[0];
    const label = i === 0 ? "Bugun" : i === 1 ? "Ertaga" : weekdays[d.getDay()];
    const formatted = `${label}, ${d.getDate()} ${months[d.getMonth()]}`;

    days.push({ dateStr, formatted });
  }

  const text = `📅 <b>3-Qadam: Qabul kunini tanlang:</b>`;
  const inline_keyboard = days.map(day => ([
    {
      text: day.formatted,
      callback_data: `dat_${serviceId}_${docId}_${day.dateStr}`
    }
  ]));

  inline_keyboard.push([
    { text: "⬅️ Ortga", callback_data: `srv_${serviceId}` },
    { text: "❌ Bekor qilish", callback_data: "cancel_booking" }
  ]);

  await callTelegram(messageId ? "editMessageText" : "sendMessage", {
    chat_id: chatId,
    ...(messageId ? { message_id: messageId } : {}),
    text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard }
  });
}

// 5. 4-bosqich: Soat tanlash
async function promptTimeSelection(chatId: number, serviceId: string, docId: string, dateStr: string, messageId?: number) {
  const text = `⏰ <b>4-Qadam: Qulay qabul soatini tanlang:</b>\nSana: <b>${dateStr}</b>`;

  const inline_keyboard: Array<Array<{ text: string; callback_data: string }>> = [];
  for (let i = 0; i < TIME_SLOTS.length; i += 2) {
    const row = [
      { text: `🕐 ${TIME_SLOTS[i]}`, callback_data: `tim_${serviceId}_${docId}_${dateStr}_${TIME_SLOTS[i]}` }
    ];
    if (TIME_SLOTS[i + 1]) {
      row.push({ text: `🕐 ${TIME_SLOTS[i + 1]}`, callback_data: `tim_${serviceId}_${docId}_${dateStr}_${TIME_SLOTS[i + 1]}` });
    }
    inline_keyboard.push(row);
  }

  inline_keyboard.push([
    { text: "⬅️ Ortga", callback_data: `doc_${serviceId}_${docId}` },
    { text: "❌ Bekor qilish", callback_data: "cancel_booking" }
  ]);

  await callTelegram(messageId ? "editMessageText" : "sendMessage", {
    chat_id: chatId,
    ...(messageId ? { message_id: messageId } : {}),
    text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard }
  });
}

// 6. 5-bosqich: Telefon raqam so'rash
async function promptContactInput(chatId: number, serviceId: string, docId: string, dateStr: string, timeStr: string) {
  // Vaqtincha holatni database da saqlaymiz yoki statega yozamiz
  await supabase.from("notifications").insert([{
    recipient_telegram_id: chatId,
    recipient_type: "patient",
    message: JSON.stringify({ step: "contact", serviceId, docId, dateStr, timeStr }),
    status: "kutilmoqda"
  }]);

  const text = `📱 <b>Yakuniy qadam: Telefon raqamingizni tasdiqlang.</b>\n\n` +
    `Shifokor siz bilan bog'lanishi uchun quyidagi <b>"📱 Raqamimni ulashish"</b> tugmasini bosing yoki raqamingizni yozib yuboring (masalan: +998901234567):`;

  const reply_markup = {
    keyboard: [
      [{ text: "📱 Raqamimni ulashish", request_contact: true }],
      [{ text: "❌ Bekor qilish" }]
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  };

  await callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup
  });
}

// 7. Navbatni saqlash va chipta yuborish
async function finalizeBooking(chatId: number, phone: string, sessionData: any, user: any) {
  const service = SERVICES_LIST.find(s => s.id === sessionData.serviceId) || SERVICES_LIST[0];
  const doctor = DOCTORS_LIST.find(d => d.id === sessionData.docId) || DOCTORS_LIST[0];
  const patientName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Hurmatli bemor";
  const bookingId = "DC" + Math.floor(100000 + Math.random() * 900000);

  // 1. Bemor profilini yaratish yoki yangilash
  let patientId = null;
  try {
    const { data: pData } = await supabase.from("patients").upsert({
      clinic_id: CLINIC_ID,
      telegram_id: chatId,
      telegram_username: user?.username || null,
      full_name: patientName,
      phone: phone
    }, { onConflict: "telegram_id" }).select("id").single();
    patientId = pData?.id || null;
  } catch (e) {
    console.error("Patient upsert error:", e);
  }

  // 2. Supabase appointments jadvaliga saqlash
  const serviceUuid = SERVICE_UUID_MAP[sessionData.serviceId] || "c1111111-1111-1111-1111-111111111111";
  const doctorUuid = DOCTOR_UUID_MAP[sessionData.docId] || "d1111111-1111-1111-1111-111111111111";
  const startTimeFormatted = sessionData.timeStr.length === 5 ? `${sessionData.timeStr}:00` : sessionData.timeStr;
  const endTimeFormatted = calculateEndTime(sessionData.timeStr, 30);

  try {
    await supabase.from("appointments").insert([{
      clinic_id: CLINIC_ID,
      patient_id: patientId,
      doctor_id: doctorUuid,
      service_id: serviceUuid,
      patient_name: patientName,
      patient_phone: phone,
      patient_telegram_id: chatId,
      appointment_date: sessionData.dateStr,
      start_time: startTimeFormatted,
      end_time: endTimeFormatted,
      status: "kutilmoqda",
      booking_source: "telegram_bot",
      price_uzs: service.price
    }]);
  } catch (e) {
    console.error("Supabase insert appointment error:", e);
  }

  // Chipta matni
  const ticketText = `🎉 <b>Navbatingiz muvaffaqiyatli qabul qilindi!</b>\n\n` +
    `📋 <b>Elektron Qabul Chiptasi:</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🔢 <b>Chipta ID:</b> #${bookingId}\n` +
    `🩺 <b>Xizmat:</b> ${service.name}\n` +
    `👨‍⚕️ <b>Shifokor:</b> ${doctor.name}\n` +
    `📅 <b>Sana:</b> ${sessionData.dateStr}\n` +
    `⏰ <b>Soat:</b> ${sessionData.timeStr}\n` +
    `👤 <b>Bemor:</b> ${patientName}\n` +
    `📞 <b>Aloqa:</b> ${phone}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📍 <b>Manzil:</b> Toshkent sh., Minor metro bekati, Amir Temur 45\n` +
    `📞 <b>Klinika telefoni:</b> +998 71 200 44 22\n\n` +
    `<i>Iltimos, qabul vaqtidan 10 daqiqa oldin yetib kelishingizni so'raymiz.</i>`;

  const mainKeyboard = {
    keyboard: [
      [{ text: "🦷 WebApp Mini App", web_app: { url: WEBAPP_URL } }, { text: "⚡ Tezkor Navbat Olish" }],
      [{ text: "📋 Mening Navbatlarim" }, { text: "📍 Manzil va Aloqa" }]
    ],
    resize_keyboard: true
  };

  await callTelegram("sendMessage", {
    chat_id: chatId,
    text: ticketText,
    parse_mode: "HTML",
    reply_markup: mainKeyboard
  });

  // Admin chatiga bildirishnoma yuborish
  if (ADMIN_CHAT_ID) {
    const adminMsg = `🚨 <b>YANGI NAVBAT BAND QILINDI!</b>\n\n` +
      `👤 <b>Bemor:</b> ${patientName}\n` +
      `📞 <b>Telefon:</b> ${phone}\n` +
      `🩺 <b>Xizmat:</b> ${service.name}\n` +
      `👨‍⚕️ <b>Shifokor:</b> ${doctor.name}\n` +
      `📅 <b>Sana:</b> ${sessionData.dateStr} | ${sessionData.timeStr}\n` +
      `🌐 <b>Manba:</b> Telegram Bot (@dentalclinicuzbot)`;

    await callTelegram("sendMessage", {
      chat_id: ADMIN_CHAT_ID,
      text: adminMsg,
      parse_mode: "HTML"
    });
  }
}

// 8. Bemorning navbatlari ro'yxati
async function sendMyBookings(chatId: number) {
  let appointments: any[] = [];
  try {
    const { data } = await supabase
      .from("appointments")
      .select("*, doctors(full_name), services(name)")
      .eq("patient_telegram_id", chatId)
      .order("appointment_date", { ascending: false })
      .limit(5);
    appointments = data || [];
  } catch (e) {
    console.error("Fetch bookings error:", e);
  }

  if (appointments.length === 0) {
    const text = `📋 <b>Sizda hali navbatlar mavjud emas.</b>\n\nNavbat olish uchun quyidagi tugmani bosing:`;
    const inline_keyboard = [
      [{ text: "⚡ Tezkor Navbat Olish", callback_data: "start_bot_booking" }],
      [{ text: "📱 WebApp Mini App", web_app: { url: WEBAPP_URL } }]
    ];
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard }
    });
    return;
  }

  let text = `📋 <b>Sizning navbatlaringiz:</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
  for (const a of appointments) {
    const serviceName = a.services?.name || "Stomatologiya ko'rigi";
    const doctorName = a.doctors?.full_name || "DentaCare Shifokori";
    const statusEmoji = a.status === "tasdiqlandi" ? "🟢" : a.status === "bajarildi" ? "✅" : a.status === "bekor_qilindi" ? "🔴" : "🟡";
    text += `${statusEmoji} <b>${serviceName}</b>\n` +
      `👨‍⚕️ ${doctorName}\n` +
      `📅 ${a.appointment_date} | ⏰ ${(a.start_time || "").slice(0, 5)}\n` +
      `Holati: <i>${a.status}</i>\n` +
      `────────────────────\n`;
  }

  const inline_keyboard = [
    [{ text: "📱 To'liq WebApp'da ko'rish", web_app: { url: `${WEBAPP_URL}?tab=my-bookings` } }],
    [{ text: "➕ Yangi navbat olish", callback_data: "start_bot_booking" }]
  ];

  await callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard }
  });
}

// 9. Klinika ma'lumotlari
async function sendClinicInfo(chatId: number) {
  const text = `🏥 <b>ORTHODONT-M Zamonaviy Stomatologiya Markazi</b>\n\n` +
    `📍 <b>Manzil:</b> Toshkent sh., Yunusobod tumani\n` +
    `🚇 <b>Mo'ljal:</b> Minor metro bekati yaqinida\n` +
    `⏰ <b>Ish vaqti:</b> 09:00 - 19:00 (Dushanba — Shanba)\n\n` +
    `👨‍⚕️ <b>Dr. Ismailov Mansurbek:</b> +998 97 422 99 92\n` +
    `👨‍⚕️ <b>Dr. Ismailov Muhammad:</b> +998 33 121 21 31\n\n` +
    `✨ <i>Bizning afzalliklarimiz: Yuqori sifatli breketlar, 100% steril tozalik va og'riqsiz muolajalar.</i>`;

  const inline_keyboard = [
    [{ text: "🦷 WebApp orqali navbat olish", web_app: { url: WEBAPP_URL } }]
  ];

  await callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard }
  });
}

// ====================================================================
// ASOSIY WEBHOOK SERVER HANDLER (DENO HTTP SERVER)
// ====================================================================

serve(async (req: Request) => {
  // CORS javobi
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }

  const url = new URL(req.url);

  // Health check va Webhook o'rnatish
  if (req.method === "GET") {
    if (url.searchParams.get("setup") === "webhook" || url.searchParams.get("action") === "setup-webhook") {
      const webhookUrl = "https://jvzghreavlzjpxhnasxd.supabase.co/functions/v1/telegram-bot";
      const setWebhookResult = await callTelegram("setWebhook", { url: webhookUrl });
      const setMenuButtonResult = await callTelegram("setChatMenuButton", {
        menu_button: {
          type: "web_app",
          text: "🦷 Navbat Olish",
          web_app: { url: WEBAPP_URL }
        }
      });
      const webhookInfo = await callTelegram("getWebhookInfo", {});
      const botInfo = await callTelegram("getMe", {});
      return new Response(JSON.stringify({
        status: "ok",
        webhookUrl,
        webappUrl: WEBAPP_URL,
        setWebhookResult,
        setMenuButtonResult,
        webhookInfo,
        botInfo
      }, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ 
      status: "ok", 
      service: "ORTHODONT-M Supabase Edge Function 24/7 Telegram Bot",
      bot: "@dentalclinicuzbot",
      timestamp: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await req.json();

    // 1. Tashqi WebApp yoki Admin Dashboarddan kelgan bildirishnoma so'rovi
    if (body.action === "notify-booking") {
      const b = body.booking;
      if (b?.patient_telegram_id) {
        await callTelegram("sendMessage", {
          chat_id: b.patient_telegram_id,
          text: `✅ <b>Sizning navbatingiz qabul qilindi!</b>\n\n• <b>Xizmat:</b> ${b.service_name}\n• <b>Shifokor:</b> ${b.doctor_name}\n• <b>Sana:</b> ${b.appointment_date} (${b.start_time})\n📍 ORTHODONT-M (Minor metro yaqinida)`,
          parse_mode: "HTML"
        });
      }
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }

    if (body.action === "notify-status-change") {
      const { booking, newStatus } = body;
      if (booking?.patient_telegram_id) {
        const text = newStatus === "tasdiqlandi" 
          ? `🟢 <b>Navbatingiz shifokor tomonidan TASDIQLANDI!</b>\n\n• Sana: ${booking.appointment_date} (${booking.start_time})\n• Shifokor: ${booking.doctor_name}`
          : newStatus === "bekor_qilindi"
          ? `🔴 <b>Navbatingiz bekor qilindi.</b>\n\nBoshqa vaqtni tanlash uchun qayta navbat olishingiz mumkin.`
          : `ℹ️ <b>Navbatingiz holati yangilandi:</b> ${newStatus}`;

        await callTelegram("sendMessage", {
          chat_id: booking.patient_telegram_id,
          text,
          parse_mode: "HTML"
        });
      }
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }

    // 2. Telegram Webhook yangilanishlari (Updates)
    const update = body;

    // Matnli xabarlar
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text?.trim() || "";
      const user = update.message.from;

      // Agar foydalanuvchi kontakt yuborgan bo'lsa
      if (update.message.contact) {
        const phone = update.message.contact.phone_number;
        // Oxirgi kutilayotgan sessiyani olish
        const { data } = await supabase
          .from("notifications")
          .select("message")
          .eq("recipient_telegram_id", chatId)
          .eq("status", "kutilmoqda")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (data?.message) {
          try {
            const sessionData = JSON.parse(data.message);
            await finalizeBooking(chatId, phone, sessionData, user);
            await supabase.from("notifications").update({ status: "yuborildi" }).eq("recipient_telegram_id", chatId);
            return new Response("ok");
          } catch (_) {}
        }
      }

      // Agar matn shaklida telefon yozilgan bo'lsa
      if (/^\+?[0-9]{9,13}$/.test(text.replace(/[\s-]/g, ""))) {
        const { data } = await supabase
          .from("notifications")
          .select("message")
          .eq("recipient_telegram_id", chatId)
          .eq("status", "kutilmoqda")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (data?.message) {
          try {
            const sessionData = JSON.parse(data.message);
            await finalizeBooking(chatId, text, sessionData, user);
            await supabase.from("notifications").update({ status: "yuborildi" }).eq("recipient_telegram_id", chatId);
            return new Response("ok");
          } catch (_) {}
        }
      }

      if (text.startsWith("/start")) {
        await sendWelcome(chatId, user?.first_name);
      } else if (text === "/navbat" || text === "⚡ Tezkor Navbat Olish") {
        await promptServiceSelection(chatId);
      } else if (text === "/buyurtmalarim" || text === "📋 Mening Navbatlarim") {
        await sendMyBookings(chatId);
      } else if (text === "/manzil" || text === "📍 Manzil va Aloqa") {
        await sendClinicInfo(chatId);
      } else if (text === "/bekor" || text === "❌ Bekor qilish") {
        await sendWelcome(chatId, user?.first_name);
      } else {
        await sendWelcome(chatId, user?.first_name);
      }
    }

    // Callback Queries (Inline tugmalar)
    if (update.callback_query) {
      const query = update.callback_query;
      const chatId = query.message.chat.id;
      const messageId = query.message.message_id;
      const data = query.data;

      // Loaderni to'xtatish
      callTelegram("answerCallbackQuery", { callback_query_id: query.id }).catch(() => {});

      if (data === "start_bot_booking") {
        await promptServiceSelection(chatId, messageId);
      } else if (data.startsWith("srv_")) {
        const srvId = data.replace("srv_", "");
        await promptDoctorSelection(chatId, srvId, messageId);
      } else if (data.startsWith("doc_")) {
        // doc_{srvId}_{docId}
        const parts = data.split("_");
        const srvId = `${parts[1]}_${parts[2]}`;
        const docId = `${parts[3]}_${parts[4]}`;
        await promptDateSelection(chatId, srvId, docId, messageId);
      } else if (data.startsWith("dat_")) {
        // dat_{srvId}_{docId}_{dateStr}
        const parts = data.split("_");
        const srvId = `${parts[1]}_${parts[2]}`;
        const docId = `${parts[3]}_${parts[4]}`;
        const dateStr = parts[5];
        await promptTimeSelection(chatId, srvId, docId, dateStr, messageId);
      } else if (data.startsWith("tim_")) {
        // tim_{srvId}_{docId}_{dateStr}_{timeStr}
        const parts = data.split("_");
        const srvId = `${parts[1]}_${parts[2]}`;
        const docId = `${parts[3]}_${parts[4]}`;
        const dateStr = parts[5];
        const timeStr = parts[6];
        await promptContactInput(chatId, srvId, docId, dateStr, timeStr);
      } else if (data === "view_my_bookings") {
        await sendMyBookings(chatId);
      } else if (data === "view_clinic_info") {
        await sendClinicInfo(chatId);
      } else if (data === "cancel_booking") {
        await sendWelcome(chatId, query.from?.first_name);
      }
    }

    return new Response("ok", { headers: { "Content-Type": "text/plain" } });
  } catch (err: any) {
    console.error("Function error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
