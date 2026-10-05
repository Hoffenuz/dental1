import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  startBotPolling, 
  sendAppointmentTicket, 
  notifyAdminNewBooking, 
  notifyPatientStatusUpdate 
} from './bot.js';
import { logNotification, updateAppointmentStatusInDb, isSupabaseConfigured } from './supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Server sog'lomlik tekshiruvi
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Ismailov Dental Clinic Telegram Bot & Notification Backend',
    timestamp: new Date().toISOString()
  });
});

// 1. Yangi navbat olinganda xabarnoma yuborish
app.post('/api/notify-booking', async (req, res) => {
  const booking = req.body;
  console.log('📥 Yangi navbat signali qabul qilindi:', booking.id, booking.patient_name);

  try {
    // Bemorga Telegram chiptasini yuborish (agar telegram ID mavjud bo'lsa)
    if (booking.patient_telegram_id) {
      await sendAppointmentTicket(booking.patient_telegram_id, booking);
      await logNotification(booking.id, booking.patient_telegram_id, 'patient', `Chipta #${booking.id} yuborildi`);
    }

    // Adminkaga / Shifokorlar guruhiga bildirishnoma yuborish
    await notifyAdminNewBooking(booking);
    await logNotification(booking.id, null, 'admin', `Yangi navbat: ${booking.patient_name}`);

    res.json({ success: true, message: "Xabarnomalar muvaffaqiyatli jo'natildi" });
  } catch (err) {
    console.error('Xabarnoma yuborishda xato:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Navbat holati o'zgarganda (tasdiqlandi / bekor qilindi) bemorga xabar berish
app.post('/api/notify-status-change', async (req, res) => {
  const { booking, newStatus } = req.body;
  console.log('🔄 Navbat holati yangilanishi signali:', booking?.id, newStatus);

  try {
    if (booking?.patient_telegram_id) {
      await notifyPatientStatusUpdate(booking.patient_telegram_id, booking, newStatus);
      await logNotification(booking.id, booking.patient_telegram_id, 'patient', `Holat: ${newStatus}`);
    }

    // Supabase ma'lumotlar bazasida ham statusni yangilash
    if (booking?.id) {
      await updateAppointmentStatusInDb(booking.id, newStatus);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 DentaCare Bot Backend serveri http://localhost:${PORT} da ishga tushdi`);
  // Telegram Bot Polling'ni ishga tushirish
  startBotPolling();
});
