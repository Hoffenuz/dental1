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
  localStorage.setItem(key, JSON.stringify(data));
};

// Appointments API
export const getAppointments = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });
      if (!error && data) return data;
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
      const { data, error } = await supabase.from('appointments').insert([bookingData]).select().single();
      if (!error && data) return data;
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

// Patients CRM API
export const getPatients = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase bemorlarni olishda xato', e);
    }
  }
  return loadStorage(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
};

export const savePatient = async (patientData) => {
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

// Dental Records (32 Tish xaritasi) API
export const getDentalRecords = (patientId) => {
  const allRecords = loadStorage(STORAGE_KEYS.DENTAL_RECORDS, INITIAL_DENTAL_RECORDS);
  return allRecords[patientId] || {};
};

export const updateToothRecord = (patientId, toothNumber, toothData) => {
  const allRecords = loadStorage(STORAGE_KEYS.DENTAL_RECORDS, INITIAL_DENTAL_RECORDS);
  if (!allRecords[patientId]) {
    allRecords[patientId] = {};
  }
  allRecords[patientId][toothNumber] = toothData;
  saveStorage(STORAGE_KEYS.DENTAL_RECORDS, allRecords);
  return allRecords[patientId];
};

// Doctors API
export const getDoctors = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('doctors').select('*');
      if (!error && data) return data;
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

// Services API
export const getServices = async () => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('services').select('*');
      if (!error && data) return data;
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

// Clinic Info
export const getClinicInfo = () => {
  return loadStorage(STORAGE_KEYS.CLINIC, INITIAL_CLINIC);
};

export const saveClinicInfo = (info) => {
  saveStorage(STORAGE_KEYS.CLINIC, info);
  return info;
};
