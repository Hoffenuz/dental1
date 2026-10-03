import { createClient } from '@supabase/supabase-js';
import { 
  INITIAL_CLINIC, 
  INITIAL_DOCTORS, 
  INITIAL_SERVICES, 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS,
  INITIAL_DENTAL_RECORDS
} from './data/mockAdminData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

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
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(p => ({
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
          medical_notes: patientData.medical_notes || null
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
    updated = current.map(p => p.id === patientData.id ? { ...p, ...patientData } : p);
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

// 3. Dental Records (32 Tish xaritasi) API
export const getDentalRecords = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('dental_records').select('*');
      if (!error && Array.isArray(data) && data.length > 0) {
        const recordsMap = { ...INITIAL_DENTAL_RECORDS };
        data.forEach(r => {
          if (!recordsMap[r.patient_id]) {
            recordsMap[r.patient_id] = {};
          }
          recordsMap[r.patient_id][r.tooth_number] = {
            condition: r.status,
            status: r.status,
            diagnosis: r.diagnosis || '',
            treatment_applied: r.treatment_applied || '',
            treatment: r.treatment_applied || '',
            cost: Number(r.cost_uzs) || 0,
            cost_uzs: Number(r.cost_uzs) || 0,
            date: r.treatment_date || new Date().toISOString().split('T')[0]
          };
        });
        return recordsMap;
      }
    } catch (e) {
      console.warn('Supabase dental records olishda xato', e);
    }
  }
  return loadStorage(STORAGE_KEYS.DENTAL_RECORDS, INITIAL_DENTAL_RECORDS);
};

export const updateToothRecord = async (patientId, toothNumber, toothData) => {
  if (supabase && patientId) {
    try {
      await supabase.from('dental_records').insert([{
        patient_id: patientId,
        tooth_number: Number(toothNumber),
        status: toothData.condition || toothData.status || 'soglom',
        diagnosis: toothData.diagnosis || null,
        treatment_applied: toothData.treatment_applied || null,
        cost_uzs: Number(toothData.cost) || 0,
        treatment_date: new Date().toISOString().split('T')[0]
      }]);
    } catch (e) {
      console.warn('Supabase dental record saqlashda xato', e);
    }
  }

  const allRecords = loadStorage(STORAGE_KEYS.DENTAL_RECORDS, INITIAL_DENTAL_RECORDS);
  if (!allRecords[patientId]) {
    allRecords[patientId] = {};
  }
  allRecords[patientId][toothNumber] = toothData;
  saveStorage(STORAGE_KEYS.DENTAL_RECORDS, allRecords);
  return allRecords[patientId];
};

// 4. Doctors API
export const getDoctors = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('doctors').select('*');
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

// 5. Services API
export const getServices = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('services').select('*');
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

export const saveService = (serviceData) => {
  const current = loadStorage(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  let updated;
  if (serviceData.id) {
    updated = current.map(s => s.id === serviceData.id ? serviceData : s);
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
