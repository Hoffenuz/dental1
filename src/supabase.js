import { createClient } from '@supabase/supabase-js';
import { 
  INITIAL_CLINIC, 
  INITIAL_DOCTORS, 
  INITIAL_SERVICES, 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS,
  INITIAL_DENTAL_RECORDS
} from './data/mockAdminData';

const defaultUrl = 'https://jvzghreavlzjpxhnasxd.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2emdocmVhdmx6anB4aG5hc3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDI2OTcsImV4cCI6MjEwMDg3ODY5N30.bRCRxNOR32VEcI8Pd-0OpSvtfESC1UyTpeJ1TItA0Y4';

const cleanString = (val, fallback = '') => {
  if (!val) return fallback;
  const str = String(val).trim().replace(/^["']|["']$/g, '');
  if (!str || str === 'undefined' || str === 'null' || str.includes('placeholder')) {
    return fallback;
  }
  return str;
};

const rawUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultKey;

// Har qanday qo'shimcha qo'shtirnoq, probel yoki xato formatlarni tozalash
const cleanUrl = cleanString(rawUrl, defaultUrl).replace(/\/+$/, '');
const cleanKey = cleanString(rawKey, defaultKey);

let client = null;
if (cleanUrl && cleanKey && cleanUrl.startsWith('http')) {
  try {
    client = createClient(cleanUrl, cleanKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } catch (err) {
    console.warn('Supabase createClient xatolik berdi, mock rejimda ishlanadi:', err);
    client = null;
  }
}

export const isSupabaseConfigured = Boolean(client);
export const supabase = client;

// Local storage kalitlari
const STORAGE_KEYS = {
  APPOINTMENTS: 'dentacare_admin_appointments',
  PATIENTS: 'dentacare_admin_patients',
  DOCTORS: 'dentacare_admin_doctors',
  SERVICES: 'dentacare_admin_services',
  DENTAL_RECORDS: 'dentacare_admin_dental_records',
  CLINIC: 'dentacare_admin_clinic'
};

// Yordamchi local storage funksiyalari
const loadStorage = (key, initial) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch (e) {
    return initial;
  }
};

const saveStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
};

// 1. Appointments API (Real Supabase Joins & Transformers)
export const getAppointments = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctors (id, full_name, specialty),
          services (id, name, price_uzs)
        `)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(a => ({
          ...a,
          id: a.id,
          doctor_id: a.doctor_id,
          doctor_name: a.doctors?.full_name || a.doctor_name || 'Dr. Rustam Xoliqov',
          doctor_specialty: a.doctors?.specialty || a.doctor_specialty || 'Jarroh-Implantolog',
          service_id: a.service_id,
          service_name: a.services?.name || a.service_name || "Birlamchi ko'rik va konsultatsiya",
          service_price: Number(a.services?.price_uzs || a.price_uzs || 50000),
          appointment_date: a.appointment_date || new Date().toISOString().split('T')[0],
          start_time: (a.start_time || '10:00').slice(0, 5),
          end_time: (a.end_time || '10:30').slice(0, 5),
          patient_name: a.patient_name || 'Bemor',
          patient_phone: a.patient_phone || '+998 90 000 00 00',
          patient_complaint: a.notes || '',
          status: a.status || 'kutilmoqda',
          created_via: a.booking_source === 'telegram_webapp' ? 'webapp' : 'bot'
        }));
      }
    } catch (e) {
      console.warn('Supabase appointments olishda xato, local ishlatilmoqda', e);
    }
  }
  return loadStorage(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
};

export const updateAppointmentStatus = async (id, status) => {
  if (supabase) {
    try {
      await supabase.from('appointments').update({ status }).eq('id', id);
    } catch (e) {
      console.warn('Supabase status yangilashda xato', e);
    }
  }

  const current = loadStorage(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  const updated = current.map(item => item.id === id ? { ...item, status } : item);
  saveStorage(STORAGE_KEYS.APPOINTMENTS, updated);
  return updated;
};

export const createManualAppointment = async (bookingData) => {
  if (supabase) {
    try {
      const payload = {
        clinic_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        doctor_id: bookingData.doctor_id || 'd1111111-1111-1111-1111-111111111111',
        service_id: bookingData.service_id || 'c1111111-1111-1111-1111-111111111111',
        patient_name: bookingData.patient_name,
        patient_phone: bookingData.patient_phone,
        appointment_date: bookingData.appointment_date,
        start_time: (bookingData.start_time || '10:00') + ':00',
        end_time: (bookingData.end_time || '10:30') + ':00',
        status: bookingData.status || 'kutilmoqda',
        booking_source: 'admin_crm',
        notes: bookingData.patient_complaint || '',
        price_uzs: Number(bookingData.service_price) || 50000
      };

      const { data, error } = await supabase.from('appointments').insert([payload]).select().single();
      if (!error && data) {
        return {
          ...data,
          doctor_name: bookingData.doctor_name,
          doctor_specialty: bookingData.doctor_specialty,
          service_name: bookingData.service_name,
          service_price: Number(bookingData.service_price) || 50000,
          start_time: (bookingData.start_time || '10:00').slice(0, 5),
          end_time: (bookingData.end_time || '10:30').slice(0, 5)
        };
      }
    } catch (e) {
      console.warn('Supabase yangi navbat saqlashda xato', e);
    }
  }

  const current = loadStorage(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  const newBooking = {
    id: 'b-' + Math.random().toString(36).substring(2, 9),
    ...bookingData,
    created_at: new Date().toISOString()
  };
  const updated = [newBooking, ...current];
  saveStorage(STORAGE_KEYS.APPOINTMENTS, updated);
  return newBooking;
};

// 2. Patients CRM API
export const getPatients = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        const mapped = data.map(p => ({
          ...p,
          id: p.id,
          full_name: p.full_name || 'Bemor',
          phone: p.phone || '',
          birth_date: p.birth_date || '',
          gender: p.gender || 'erkak',
          allergies: p.allergies || "Yo'q",
          medical_notes: p.medical_notes || '',
          total_visits: p.total_visits || 0
        }));
        saveStorage(STORAGE_KEYS.PATIENTS, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase bemorlarni olishda xato', e);
    }
  }
  return loadStorage(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
};

export const savePatient = async (patientData) => {
  if (supabase) {
    try {
      if (patientData.id) {
        await supabase.from('patients').update({
          full_name: patientData.full_name,
          phone: patientData.phone,
          birth_date: patientData.birth_date || null,
          gender: patientData.gender || 'erkak',
          allergies: patientData.allergies || null,
          medical_notes: patientData.medical_notes || null,
          updated_at: new Date().toISOString()
        }).eq('id', patientData.id);
      } else {
        const { data } = await supabase.from('patients').insert([{
          clinic_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          full_name: patientData.full_name,
          phone: patientData.phone,
          birth_date: patientData.birth_date || null,
          gender: patientData.gender || 'erkak',
          allergies: patientData.allergies || null,
          medical_notes: patientData.medical_notes || null
        }]).select().single();
        if (data) patientData.id = data.id;
      }
    } catch (e) {
      console.warn('Supabase bemorni saqlashda xato', e);
    }
  }

  const current = loadStorage(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  let updated;
  if (patientData.id) {
    const exists = current.some(p => p.id === patientData.id);
    if (exists) {
      updated = current.map(p => p.id === patientData.id ? { ...p, ...patientData } : p);
    } else {
      updated = [patientData, ...current];
    }
  } else {
    const newPatient = {
      id: 'p-' + Math.random().toString(36).substring(2, 9),
      ...patientData,
      total_visits: 0,
      created_at: new Date().toISOString()
    };
    updated = [newPatient, ...current];
  }
  saveStorage(STORAGE_KEYS.PATIENTS, updated);
  return updated;
};

export const deletePatient = async (patientId) => {
  if (!patientId) return [];

  if (supabase) {
    try {
      // 1. Tish yozuvlarini o'chirish
      await supabase.from('dental_records').delete().eq('patient_id', patientId);
      // 2. Qabullarni o'chirish
      await supabase.from('appointments').delete().eq('patient_id', patientId);
      // 3. Bemorni o'chirish
      await supabase.from('patients').delete().eq('id', patientId);
    } catch (e) {
      console.warn('Supabase bemorni o\'chirishda xato:', e.message);
    }
  }

  const current = loadStorage(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  const updated = current.filter(p => p.id !== patientId);
  saveStorage(STORAGE_KEYS.PATIENTS, updated);

  // Dental records dan ham o'chirish
  const dentalRecs = loadStorage(STORAGE_KEYS.DENTAL_RECORDS, {});
  if (dentalRecs[patientId]) {
    delete dentalRecs[patientId];
    saveStorage(STORAGE_KEYS.DENTAL_RECORDS, dentalRecs);
  }

  return updated;
};

// 3. Dental Records (32 Tish xaritasi) API
export const getDentalRecords = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('dental_records')
        .select('*')
        .order('tooth_number', { ascending: true });

      if (!error && Array.isArray(data)) {
        const recordsMap = {};
        data.forEach(r => {
          if (!recordsMap[r.patient_id]) {
            recordsMap[r.patient_id] = {};
          }
          recordsMap[r.patient_id][r.tooth_number] = {
            id: r.id,
            condition: r.status || 'soglom',
            status: r.status || 'soglom',
            diagnosis: r.diagnosis || '',
            treatment_applied: r.treatment_applied || '',
            cost: Number(r.cost_uzs) || 0,
            cost_uzs: Number(r.cost_uzs) || 0,
            treatment_date: r.treatment_date || (r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
            date: r.treatment_date || (r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
            doctor_id: r.doctor_id || null,
            notes: r.notes || ''
          };
        });
        saveStorage(STORAGE_KEYS.DENTAL_RECORDS, recordsMap);
        return recordsMap;
      }
    } catch (e) {
      console.warn('Supabase dental records olishda xato', e);
    }
  }
  return loadStorage(STORAGE_KEYS.DENTAL_RECORDS, INITIAL_DENTAL_RECORDS);
};

export const updateToothRecord = async (patientId, toothNumber, toothData) => {
  if (!patientId || !toothNumber) return {};

  const toothNum = Number(toothNumber);
  const status = toothData.condition || toothData.status || 'soglom';
  const isHealthy = status === 'soglom';

  if (supabase) {
    try {
      // 1. Avval mavjud yozuvni tekshirish
      const { data: existing } = await supabase
        .from('dental_records')
        .select('id')
        .eq('patient_id', patientId)
        .eq('tooth_number', toothNum)
        .maybeSingle();

      if (isHealthy) {
        // Agar tish sog'lom qilinsa, bazadagi muammo yozuvini o'chiramiz
        if (existing?.id) {
          await supabase.from('dental_records').delete().eq('id', existing.id);
        }
      } else if (existing?.id) {
        // Mavjud yozuvni yangilash
        await supabase
          .from('dental_records')
          .update({
            status: status,
            diagnosis: toothData.diagnosis || null,
            treatment_applied: toothData.treatment_applied || toothData.treatment || null,
            cost_uzs: Number(toothData.cost) || Number(toothData.cost_uzs) || 0,
            treatment_date: toothData.treatment_date || toothData.date || new Date().toISOString().split('T')[0],
            doctor_id: toothData.doctor_id || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Yangi yozuv qo'shish
        await supabase
          .from('dental_records')
          .insert([{
            patient_id: patientId,
            tooth_number: toothNum,
            status: status,
            diagnosis: toothData.diagnosis || null,
            treatment_applied: toothData.treatment_applied || toothData.treatment || null,
            cost_uzs: Number(toothData.cost) || Number(toothData.cost_uzs) || 0,
            treatment_date: toothData.treatment_date || toothData.date || new Date().toISOString().split('T')[0],
            doctor_id: toothData.doctor_id || null
          }]);
      }
    } catch (e) {
      console.warn('Supabase dental record saqlashda xato:', e.message);
    }
  }

  // Lokal xotirani ham sinxronlash
  const allRecords = loadStorage(STORAGE_KEYS.DENTAL_RECORDS, INITIAL_DENTAL_RECORDS);
  if (!allRecords[patientId]) {
    allRecords[patientId] = {};
  }

  if (isHealthy) {
    delete allRecords[patientId][toothNum];
  } else {
    allRecords[patientId][toothNum] = {
      ...toothData,
      tooth_number: toothNum,
      condition: status,
      status: status,
      cost: Number(toothData.cost) || Number(toothData.cost_uzs) || 0,
      cost_uzs: Number(toothData.cost) || Number(toothData.cost_uzs) || 0
    };
  }
  saveStorage(STORAGE_KEYS.DENTAL_RECORDS, allRecords);
  return allRecords[patientId];
};

export const deleteToothRecord = async (patientId, toothNumber) => {
  return updateToothRecord(patientId, toothNumber, { condition: 'soglom', status: 'soglom' });
};

// 4. Doctors API (Faqat 2 ta faol shifokor)
export const getDoctors = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('doctors').select('*').eq('is_active', true).order('created_at', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(d => ({
          ...d,
          photo_url: d.photo_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
          rating: Number(d.rating) || 5.0
        }));
      }
    } catch (e) {}
  }
  return loadStorage(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
};

export const saveDoctor = (doctorData) => {
  const current = loadStorage(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  let updated;
  if (doctorData.id) {
    updated = current.map(d => d.id === doctorData.id ? doctorData : d);
  } else {
    updated = [...current, { ...doctorData, id: 'd-' + Math.random().toString(36).substring(2, 9) }];
  }
  saveStorage(STORAGE_KEYS.DOCTORS, updated);
  return updated;
};

// 5. Services API (Admin narx belgilashi to'g'ridan-to'g'ri Supabase'ga yoziladi)
export const getServices = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('services').select('*').eq('is_active', true).order('price_uzs', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(s => ({
          ...s,
          price_uzs: Number(s.price_uzs) || 50000,
          duration_minutes: Number(s.duration_minutes) || 30
        }));
      }
    } catch (e) {}
  }
  return loadStorage(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
};

export const saveService = async (serviceData) => {
  if (supabase) {
    try {
      if (serviceData.id && !String(serviceData.id).startsWith('s-')) {
        await supabase.from('services').update({
          name: serviceData.name,
          category: serviceData.category || 'Davolash',
          description: serviceData.description || '',
          price_uzs: Number(serviceData.price_uzs) || 0,
          duration_minutes: Number(serviceData.duration_minutes) || 30,
          is_active: serviceData.is_active !== false
        }).eq('id', serviceData.id);
      } else {
        const { data } = await supabase.from('services').insert([{
          clinic_id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          name: serviceData.name,
          category: serviceData.category || 'Davolash',
          description: serviceData.description || '',
          price_uzs: Number(serviceData.price_uzs) || 0,
          duration_minutes: Number(serviceData.duration_minutes) || 30,
          is_active: true
        }]).select().single();
        if (data) serviceData.id = data.id;
      }
    } catch (e) {
      console.warn('Supabase xizmatni saqlashda xatolik:', e);
    }
  }

  const current = loadStorage(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  let updated;
  if (serviceData.id) {
    updated = current.map(s => s.id === serviceData.id ? { ...s, ...serviceData } : s);
  } else {
    updated = [...current, { ...serviceData, id: 's-' + Math.random().toString(36).substring(2, 9) }];
  }
  saveStorage(STORAGE_KEYS.SERVICES, updated);
  return updated;
};

// 6. Clinic Info
export const getClinicInfo = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('clinics').select('*').limit(1).single();
      if (!error && data) {
        return {
          name: data.name,
          phone: data.phone,
          address: data.address,
          working_hours: data.working_hours,
          telegram_bot: data.telegram_bot_username ? `@${data.telegram_bot_username}` : '@dentalclinicuzbot',
          telegram_admin_chat_id: data.telegram_admin_chat_id || ''
        };
      }
    } catch (e) {}
  }
  return loadStorage(STORAGE_KEYS.CLINIC, INITIAL_CLINIC);
};

export const saveClinicInfo = (info) => {
  saveStorage(STORAGE_KEYS.CLINIC, info);
  return info;
};
