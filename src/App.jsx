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
  INITIAL_SERVICES, 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_DENTAL_RECORDS 
} from './data/mockAdminData';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  // States - boshlang'ich ma'lumotlar bilan tezkor ochiladi
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [clinic, setClinic] = useState(INITIAL_CLINIC);
  const [dentalRecords, setDentalRecords] = useState(INITIAL_DENTAL_RECORDS);

  // Modal holati
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);

  // Ma'lumotlarni Supabase'dan fonda yuklab olish
  const loadAllData = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 4000)
      );
      const fetchPromise = Promise.all([
        getAppointments(),
        getPatients(),
        getDoctors(),
        getServices(),
        getClinicInfo(),
        getDentalRecords()
      ]);
      const [appData, patData, docData, srvData, clinicData, dentalData] = await Promise.race([
        fetchPromise,
        timeoutPromise
      ]);

      if (Array.isArray(appData) && appData.length > 0) setAppointments(appData);
      if (Array.isArray(patData) && patData.length > 0) setPatients(patData);
      if (Array.isArray(docData) && docData.length > 0) setDoctors(docData);
      if (Array.isArray(srvData) && srvData.length > 0) setServices(srvData);
      if (clinicData) setClinic(clinicData);
      if (dentalData && typeof dentalData === 'object') {
        setDentalRecords(dentalData);
      }
    } catch (e) {
      console.warn('Supabase ma\'lumotlarini yangilash ogohlantirish:', e.message);
    }
  };

  useEffect(() => {
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
