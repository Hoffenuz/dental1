// ====================================================================
// DentaCare — Supabase Edge Function: 24/7 Telegram Bot
// Loyiha: https://jvzghreavlzjpxhnasxd.supabase.co
// Endpoint: https://jvzghreavlzjpxhnasxd.supabase.co/functions/v1/telegram-bot
// ====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Never provide credentials as source-code fallbacks. Supabase injects
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY into hosted Edge Functions;
// TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET must be configured as secrets.
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
const WEBAPP_URL = Deno.env.get("WEBAPP_URL") || "";
const ADMIN_CHAT_ID = Deno.env.get("ADMIN_CHAT_ID") || "";
const WEBHOOK_SECRET = Deno.env.get("TELEGRAM_WEBHOOK_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const TELEGRAM_API = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : "";

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
  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is not configured");
    return null;
  }
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

async function isAdminRequest(req: Request): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const { data: userResult, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userResult.user) return false;
  const { data: membership, error: membershipError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userResult.user.id)
    .maybeSingle();
  return !membershipError && Boolean(membership);
}

const encoder = new TextEncoder();

async function hmac(key: Uint8Array, data: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data)));
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a[i] ^ b[i];
  return result === 0;
}

async function verifiedWebAppUser(initData: unknown): Promise<any | null> {
  if (!BOT_TOKEN || typeof initData !== "string" || !initData) return null;
  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  const userValue = params.get("user");
  if (!receivedHash || !userValue) return null;
  params.delete("hash");
  const checkString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secret = await hmac(encoder.encode("WebAppData"), BOT_TOKEN);
  const expected = await hmac(secret, checkString);
  const received = new Uint8Array((receivedHash.match(/.{1,2}/g) || []).map((part) => parseInt(part, 16)));
  if (!constantTimeEqual(expected, received)) return null;
  try { return JSON.parse(userValue); } catch (_) { return null; }
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}

async function handleVerifiedWebAppAction(body: any, user: any): Promise<Response> {
  const action = body.action;
  if (action === "webapp-booked-slots") {
    const { doctorId, date } = body;
    if (!doctorId || !/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return json({ error: "Noto'g'ri vaqt parametrlari" }, 400);
    const { data, error } = await supabase
      .from("appointments")
      .select("start_time")
      .eq("doctor_id", doctorId)
      .eq("appointment_date", date)
      .neq("status", "bekor_qilindi");
    if (error) return json({ error: "Band vaqtlarni yuklab bo'lmadi" }, 500);
    return json({ slots: (data || []).map((item: any) => String(item.start_time).slice(0, 5)) });
  }

  if (action === "webapp-my-bookings") {
    const { data, error } = await supabase
      .from("appointments")
      .select("*, doctor:doctors(id, full_name, specialty, photo_url), service:services(id, name, price_uzs)")
      .eq("patient_telegram_id", user.id)
      .order("appointment_date", { ascending: false })
      .order("start_time", { ascending: false });
    if (error) return json({ error: "Navbatlarni yuklab bo'lmadi" }, 500);
    const formatted = (data || []).map((item: any) => ({
      ...item,
      doctor_name: item.doctor?.full_name || "Shifokor",
      doctor_specialty: item.doctor?.specialty || "",
      service_name: item.service?.name || "Konsultatsiya",
      service_price: item.price_uzs || item.service?.price_uzs || 0,
      patient_complaint: item.notes || ""
    }));
    return json({ data: formatted });
  }

  if (action === "webapp-cancel-booking") {
    const appointmentId = body.appointmentId;
    if (!appointmentId) return json({ error: "Navbat identifikatori kerak" }, 400);
    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "bekor_qilindi" })
      .eq("id", appointmentId)
      .eq("patient_telegram_id", user.id)
      .select("id")
      .maybeSingle();
    if (error || !data) return json({ error: "Navbatni bekor qilishga ruxsat yo'q" }, 403);
    return json({ success: true });
  }

  if (action === "webapp-create-booking") {
    const booking = body.booking || {};
    if (!booking.doctor_id || !booking.service_id || !booking.appointment_date || !booking.start_time || !booking.patient_phone) {
      return json({ error: "Navbat ma'lumotlari to'liq emas" }, 400);
    }
    const [{ data: doctor }, { data: service }] = await Promise.all([
      supabase.from("doctors").select("id, full_name, specialty, clinic_id").eq("id", booking.doctor_id).eq("is_active", true).maybeSingle(),
      supabase.from("services").select("id, name, price_uzs, duration_minutes, clinic_id").eq("id", booking.service_id).eq("is_active", true).maybeSingle()
    ]);
    if (!doctor || !service || doctor.clinic_id !== service.clinic_id) return json({ error: "Xizmat yoki shifokor topilmadi" }, 400);
    const patientName = [user.first_name, user.last_name].filter(Boolean).join(" ") || booking.patient_name;
    const { data: patient, error: patientError } = await supabase.from("patients").upsert({
      clinic_id: doctor.clinic_id,
      telegram_id: user.id,
      telegram_username: user.username || null,
      full_name: patientName,
      phone: booking.patient_phone
    }, { onConflict: "telegram_id" }).select("id").single();
    if (patientError || !patient) return json({ error: "Bemor profilini saqlab bo'lmadi" }, 500);
    const startTime = String(booking.start_time).slice(0, 5);
    const [hour, minute] = startTime.split(":").map(Number);
    const total = hour * 60 + minute + Number(service.duration_minutes || 30);
    const endTime = `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}:00`;
    const { data, error } = await supabase.from("appointments").insert({
      clinic_id: doctor.clinic_id, patient_id: patient.id, doctor_id: doctor.id, service_id: service.id,
      patient_name: patientName, patient_phone: booking.patient_phone, patient_telegram_id: user.id,
      appointment_date: booking.appointment_date, start_time: `${startTime}:00`, end_time: endTime,
      status: "kutilmoqda", booking_source: "telegram_webapp", notes: booking.patient_complaint || "", price_uzs: service.price_uzs
    }).select().single();
    if (error || !data) return json({ error: error?.code === "23505" ? "Bu vaqt band qilingan" : "Navbatni saqlab bo'lmadi" }, 409);
    return json({ data: { ...data, doctor_name: doctor.full_name, doctor_specialty: doctor.specialty, service_name: service.name, service_price: service.price_uzs } });
  }
  return json({ error: "Noma'lum WebApp amali" }, 400);
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
    `🦷 <b>Ismailov Dental Clinic</b> stomatologiya markaziga xush kelibsiz.\n\n` +
    `Bizning shifokorlarimiz:\n` +
    `👨‍⚕️ <b>Dr. Ismailov Mansurbek</b> (Ortodont / Bosh shifokor) — 📞 +998 97 422 99 92\n` +
    `👨‍⚕️ <b>Dr. Ismailov Muhammad</b> (Stomatolog-Terapevt) — 📞 +998 33 121 21 31\n\n` +
    `📍 <b>Manzil:</b> Qo'shko'pir tumani, Al-Beruniy ko'chasi, park oldida\n` +
    `🗺 <a href="https://maps.app.goo.gl/sbZqccuTv1p9bKdK6">Google Xaritada ko'rish (Lokatsiya)</a>\n\n` +
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
  // Bot sessiyasi klinikaning boshqa ilovalari ishlatadigan notifications
  // jadvalidan alohida saqlanadi.
  await supabase.from("telegram_booking_sessions").upsert({
    chat_id: chatId,
    session: { step: "contact", serviceId, docId, dateStr, timeStr },
    updated_at: new Date().toISOString()
  });

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
  const text = `🏥 <b>Ismailov Dental Clinic — Zamonaviy Stomatologiya Markazi</b>\n\n` +
    `📍 <b>Manzil:</b> Qo'shko'pir tumani, Al-Beruniy ko'chasi, park oldida\n` +
    `🗺 <b>Lokatsiya:</b> https://maps.app.goo.gl/sbZqccuTv1p9bKdK6\n` +
    `⏰ <b>Ish vaqti:</b> 09:00 - 19:00 (Dushanba — Shanba)\n\n` +
    `👨‍⚕️ <b>Dr. Ismailov Mansurbek:</b> +998 97 422 99 92\n` +
    `👨‍⚕️ <b>Dr. Ismailov Muhammad:</b> +998 33 121 21 31\n\n` +
    `✨ <i>Bizning xizmatlar: Breket o'rnatish, Svetovoy plomba, Implant, Tish sug'urish, Tish tozalash.</i>`;

  const inline_keyboard = [
    [{ text: "🗺 Xaritada Ko'rish (Google Maps)", url: "https://maps.app.goo.gl/sbZqccuTv1p9bKdK6" }],
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
      if (!WEBHOOK_SECRET) {
        return new Response(JSON.stringify({ error: "TELEGRAM_WEBHOOK_SECRET is not configured" }), { status: 500 });
      }
      const webhookUrl = "https://jvzghreavlzjpxhnasxd.supabase.co/functions/v1/telegram-bot";
      const setWebhookResult = await callTelegram("setWebhook", {
        url: webhookUrl,
        secret_token: WEBHOOK_SECRET,
        allowed_updates: ["message", "callback_query"]
      });
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
      service: "Ismailov Dental Clinic Supabase Edge Function 24/7 Telegram Bot",
      bot: "@dentalclinicuzbot",
      timestamp: new Date().toISOString()
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    if (!supabase || !BOT_TOKEN || !WEBAPP_URL) {
      return new Response(JSON.stringify({ error: "Bot secrets are not configured" }), { status: 500 });
    }
    const body = await req.json();

    // Telegram signs webhooks with this value once setWebhook includes
    // secret_token. Reject arbitrary public POSTs before handling updates.
    const isTelegramUpdate = Boolean(body?.update_id || body?.message || body?.callback_query);
    if (isTelegramUpdate && (!WEBHOOK_SECRET || req.headers.get("x-telegram-bot-api-secret-token") !== WEBHOOK_SECRET)) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (typeof body.action === "string" && body.action.startsWith("webapp-")) {
      const user = await verifiedWebAppUser(body.initData);
      if (!user) return json({ error: "Telegram tasdiqlashi yaroqsiz" }, 401);
      return await handleVerifiedWebAppAction(body, user);
    }

    // 1. Tashqi WebApp yoki Admin Dashboarddan kelgan bildirishnoma so'rovi
    if (body.action === "notify-booking") {
      if (!await isAdminRequest(req)) return new Response("Unauthorized", { status: 401 });
      const b = body.booking;
      if (b?.patient_telegram_id) {
        await callTelegram("sendMessage", {
          chat_id: b.patient_telegram_id,
          text: `✅ <b>Sizning navbatingiz qabul qilindi!</b>\n\n• <b>Xizmat:</b> ${b.service_name}\n• <b>Shifokor:</b> ${b.doctor_name}\n• <b>Sana:</b> ${b.appointment_date} (${b.start_time})\n📍 Ismailov Dental Clinic (Qo'shko'pir tumani, Al-Beruniy ko'chasi, park oldida)`,
          parse_mode: "HTML"
        });
      }
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }

    if (body.action === "notify-status-change") {
      if (!await isAdminRequest(req)) return new Response("Unauthorized", { status: 401 });
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
          .from("telegram_booking_sessions")
          .select("session")
          .eq("chat_id", chatId)
          .maybeSingle();

        if (data?.session) {
          try {
            const sessionData = data.session;
            await finalizeBooking(chatId, phone, sessionData, user);
            await supabase.from("telegram_booking_sessions").delete().eq("chat_id", chatId);
            return new Response("ok");
          } catch (_) {}
        }
      }

      // Agar matn shaklida telefon yozilgan bo'lsa
      if (/^\+?[0-9]{9,13}$/.test(text.replace(/[\s-]/g, ""))) {
        const { data } = await supabase
          .from("telegram_booking_sessions")
          .select("session")
          .eq("chat_id", chatId)
          .maybeSingle();

        if (data?.session) {
          try {
            const sessionData = data.session;
            await finalizeBooking(chatId, text, sessionData, user);
            await supabase.from("telegram_booking_sessions").delete().eq("chat_id", chatId);
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
