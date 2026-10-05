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
import { 
  INITIAL_CLINIC, 
  INITIAL_DOCTORS, 
  INITIAL_SERVICES 
} from './data/mockAdminData';

export default function App() {
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
    const updated = await updateAppointmentStatus(appointmentId, status);
    setAppointments(updated);
    
    // Telegram Bot Edge Function xabarnomasi
    const booking = appointments.find(a => a.id === appointmentId);
    if (booking) {
      const botApiUrl = import.meta.env.VITE_BOT_API_URL || 'https://jvzghreavlzjpxhnasxd.supabase.co/functions/v1/telegram-bot';
      try {
        fetch(botApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
  const handleSaveClinic = (info) => {
    const updated = saveClinicInfo(info);
    setClinic(updated);
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
