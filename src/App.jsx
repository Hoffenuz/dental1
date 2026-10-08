import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './pages/DashboardOverview';
import LiveQueue from './pages/LiveQueue';
import PatientsCRM from './pages/PatientsCRM';
import ServicesManager from './pages/ServicesManager';
import SettingsPage from './pages/SettingsPage';
import NewBookingModal from './components/NewBookingModal';

import { 
  getAppointments, 
  updateAppointmentStatus, 
  createManualAppointment,
  getPatients, 
  savePatient,
  getDoctors, 
  getServices, 
  saveService, 
  getClinicInfo, 
  saveClinicInfo,
  getDentalRecords,
  updateToothRecord,
  deleteToothRecord,
  deletePatient
} from './supabase';
import { supabase, isSupabaseConfigured } from './supabase';
import { 
  INITIAL_CLINIC, 
  INITIAL_DOCTORS, 
  INITIAL_SERVICES 
} from './data/mockAdminData';

function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  // States - to'g'ridan-to'g'ri bazadan toza ma'lumotlar bilan ishlaydi
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [clinic, setClinic] = useState(INITIAL_CLINIC);
  const [dentalRecords, setDentalRecords] = useState({});

  // Modal holati
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);

  // Ma'lumotlarni to'g'ridan-to'g'ri Supabase bazasidan yuklab olish
  const loadAllData = async () => {
    getAppointments().then(appData => {
      if (Array.isArray(appData)) {
        setAppointments(appData);
      }
    }).catch(err => console.warn('Appointments yuklashda xato:', err));

    getPatients().then(patData => {
      if (Array.isArray(patData)) {
        setPatients(patData);
      }
    }).catch(err => console.warn('Patients yuklashda xato:', err));

    getDoctors().then(docData => {
      if (Array.isArray(docData) && docData.length > 0) setDoctors(docData);
    }).catch(() => {});

    getServices().then(srvData => {
      if (Array.isArray(srvData) && srvData.length > 0) setServices(srvData);
    }).catch(() => {});

    getClinicInfo().then(clinicData => {
      if (clinicData) setClinic(clinicData);
    }).catch(() => {});

    getDentalRecords().then(dentalData => {
      if (dentalData && typeof dentalData === 'object') setDentalRecords(dentalData);
    }).catch(() => {});
  };

  useEffect(() => {
    // Brauzer xotirasidagi har qanday eski sun'iy (mock) yozuvlarni tozalash
    try {
      const storedApp = localStorage.getItem('dental_admin_appointments');
      if (storedApp && (storedApp.includes('Azamat') || storedApp.includes('Shahnoza'))) {
        localStorage.removeItem('dental_admin_appointments');
      }
      const storedPat = localStorage.getItem('dental_admin_patients');
      if (storedPat && (storedPat.includes('Azamat') || storedPat.includes('Shahnoza'))) {
        localStorage.removeItem('dental_admin_patients');
      }
    } catch (e) {}

    loadAllData();
  }, []);

  // Navbat holatini yangilash
  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const updated = await updateAppointmentStatus(appointmentId, status);
      setAppointments(updated);
    } catch (error) {
      console.warn('Navbat holatini yangilashda xato:', error);
      alert('Navbat holatini yangilab bo\'lmadi. Ruxsat va ulanishni tekshiring.');
      return;
    }
    
    // Telegram Bot Edge Function xabarnomasi
    const booking = appointments.find(a => a.id === appointmentId);
    if (booking) {
      const botApiUrl = import.meta.env.VITE_BOT_API_URL || 'https://jvzghreavlzjpxhnasxd.supabase.co/functions/v1/telegram-bot';
      try {
        const { data: { session } } = await supabase.auth.getSession();
        fetch(botApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
          },
          body: JSON.stringify({ action: 'notify-status-change', booking, newStatus: status })
        }).catch(() => {});
      } catch (e) {}
    }
  };

  // Yangi navbat qo'shish
  const handleCreateBooking = async (bookingData) => {
    const newBooking = await createManualAppointment(bookingData);
    setAppointments(prev => [newBooking, ...prev]);
  };

  // Bemorni saqlash
  const handleSavePatient = async (patientData) => {
    const updated = await savePatient(patientData);
    if (Array.isArray(updated)) {
      setPatients(updated);
    }
  };

  // Bemorni o'chirish
  const handleDeletePatient = async (patientId) => {
    setPatients(prev => prev.filter(p => p.id !== patientId));
    setDentalRecords(prev => {
      const copy = { ...prev };
      delete copy[patientId];
      return copy;
    });
    const updated = await deletePatient(patientId);
    if (Array.isArray(updated)) {
      setPatients(updated);
    }
  };

  // Tish kartasini yangilash
  const handleUpdateTooth = async (patientId, toothNumber, toothData) => {
    const toothNum = Number(toothNumber);
    const isHealthy = (toothData.condition || toothData.status) === 'soglom';

    // 1. Darhol optimistik UI yangilash
    setDentalRecords(prev => {
      const patientRecs = { ...(prev[patientId] || {}) };
      if (isHealthy) {
        delete patientRecs[toothNum];
      } else {
        patientRecs[toothNum] = {
          ...toothData,
          tooth_number: toothNum,
          cost: Number(toothData.cost) || 0
        };
      }
      return {
        ...prev,
        [patientId]: patientRecs
      };
    });

    // 2. Supabase bazasi bilan saqlash
    const updatedRecords = await updateToothRecord(patientId, toothNumber, toothData);
    if (updatedRecords) {
      setDentalRecords(prev => ({
        ...prev,
        [patientId]: updatedRecords
      }));
    }
  };

  const handleDeleteTooth = async (patientId, toothNumber) => {
    return handleUpdateTooth(patientId, toothNumber, { condition: 'soglom', status: 'soglom' });
  };

  // Xizmat va narxni saqlash (User WebApp va botda ko'rinadi)
  const handleSaveService = async (serviceData) => {
    const updated = await saveService(serviceData);
    setServices(updated);
  };

  // Klinika ma'lumotlarini saqlash
  const handleSaveClinic = async (info) => {
    try {
      const updated = await saveClinicInfo(info);
      setClinic(updated);
    } catch (error) {
      console.warn('Klinika sozlamalarini saqlashda xato:', error);
      alert('Sozlamalarni saqlab bo\'lmadi. Ulanishni va ruxsatlarni tekshiring.');
    }
  };

  const pendingAppointmentsCount = appointments.filter(
    a => a.status === 'kutilmoqda' && a.appointment_date === new Date().toISOString().split('T')[0]
  ).length;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar - Soddalashtirilgan (2 ta shifokor bilan) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        counts={{
          pending: pendingAppointmentsCount,
          patients: patients.length
        }}
      />

      {/* Asosiy ish maydoni */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          clinic={clinic}
          onOpenNewBooking={() => setIsNewBookingOpen(true)}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardOverview
              appointments={appointments}
              patients={patients}
              doctors={doctors}
              services={services}
              onNavigateToQueue={() => setCurrentTab('queue')}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {currentTab === 'queue' && (
            <LiveQueue
              appointments={appointments}
              doctors={doctors}
              services={services}
              onUpdateStatus={handleUpdateStatus}
              onOpenNewBooking={() => setIsNewBookingOpen(true)}
            />
          )}

          {currentTab === 'patients' && (
            <PatientsCRM
              patients={patients}
              appointments={appointments}
              doctors={doctors}
              dentalRecords={dentalRecords}
              onSavePatient={handleSavePatient}
              onDeletePatient={handleDeletePatient}
              onUpdateTooth={handleUpdateTooth}
              onDeleteTooth={handleDeleteTooth}
            />
          )}

          {currentTab === 'services' && (
            <ServicesManager
              services={services}
              onSaveService={handleSaveService}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              clinic={clinic}
              onSaveClinic={handleSaveClinic}
            />
          )}
        </main>
      </div>

      {/* Tezkor navbat qo'shish modali */}
      <NewBookingModal
        isOpen={isNewBookingOpen}
        onClose={() => setIsNewBookingOpen(false)}
        doctors={doctors}
        services={services}
        onCreateBooking={handleCreateBooking}
      />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [accessError, setAccessError] = useState('');

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return undefined;
    }

    const verifySession = async (nextSession) => {
      if (!nextSession) {
        setSession(null);
        setAccessError('');
        setChecking(false);
        return;
      }
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', nextSession.user.id)
        .maybeSingle();
      if (error || !data) {
        setSession(null);
        setAccessError('Bu hisob CRM administratori sifatida ruxsat qilinmagan.');
        await supabase.auth.signOut();
      } else {
        setSession(nextSession);
        setAccessError('');
      }
      setChecking(false);
    };

    supabase.auth.getSession().then(({ data }) => verifySession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      verifySession(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return <AccessScreen message="VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY sozlanmagan." />;
  }
  if (checking) return <AccessScreen message="Ruxsat tekshirilmoqda…" />;
  if (!session) return <LoginScreen error={accessError} />;
  return <AdminDashboard />;
}

function AccessScreen({ message }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-black text-slate-800">DentaCare CRM</h1>
        <p className="mt-3 text-sm text-slate-600">{message}</p>
      </div>
    </div>
  );
}

function LoginScreen({ error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) setFormError('Email yoki parol noto‘g‘ri.');
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <form onSubmit={submit} className="max-w-sm w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-lg font-black text-slate-800">DentaCare CRM</h1>
          <p className="mt-1 text-sm text-slate-500">Administrator hisobingiz bilan kiring.</p>
        </div>
        {(error || formError) && <p className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700">{error || formError}</p>}
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
        <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Parol" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
        <button disabled={submitting} className="w-full rounded-xl bg-cyan-600 py-2.5 text-sm font-bold text-white disabled:opacity-60">
          {submitting ? 'Kirilmoqda…' : 'Kirish'}
        </button>
      </form>
    </div>
  );
}
