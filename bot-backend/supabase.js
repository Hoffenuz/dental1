import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Bildirishnomani ma'lumotlar bazasiga saqlash
export async function logNotification(appointmentId, recipientId, type, message, status = 'yuborildi') {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('notifications').insert([{
      appointment_id: appointmentId || null,
      recipient_telegram_id: recipientId ? Number(recipientId) : null,
      recipient_type: type,
      message,
      status,
      sent_at: new Date().toISOString()
    }]);
    if (error) console.warn('Supabase bildirishnoma saqlash xatosi:', error.message);
    return data;
  } catch (e) {
    console.warn('logNotification xatosi:', e.message);
    return null;
  }
}

// Navbat holatini Supabase da yangilash
export async function updateAppointmentStatusInDb(appointmentId, newStatus) {
  if (!supabase || !appointmentId) return null;
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', appointmentId);
    if (error) console.warn('Supabase status yangilash xatosi:', error.message);
    return data;
  } catch (e) {
    console.warn('updateAppointmentStatusInDb xatosi:', e.message);
    return null;
  }
}
