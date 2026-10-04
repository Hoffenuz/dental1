import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './pages/DashboardOverview';
import LiveQueue from './pages/LiveQueue';
import PatientsCRM from './pages/PatientsCRM';
import DoctorsSchedule from './pages/DoctorsSchedule';
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
  saveDoctor,
  getServices, 
  saveService,
  getClinicInfo, 
  saveClinicInfo,
  getDentalRecords,
  updateToothRecord
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
  const [loading, setLoading] = useState(false);

  // States - oq ekran bo'lmasligi uchun dastlabki ma'lumotlar bilan ochiladi
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [clinic, setClinic] = useState(INITIAL_CLINIC);
  const [dentalRecords, setDentalRecords] = useState(INITIAL_DENTAL_RECORDS);

  // Modal states
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);

  // Initial data loading in background
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
      console.warn('Supabase ma\'lumotlarini fonda yangilashda ogohlantirish:', e.message);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Status updates
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

  // Manual booking
  const handleCreateBooking = async (bookingData) => {
    const newBooking = await createManualAppointment(bookingData);
    setAppointments(prev => [newBooking, ...prev]);
  };

  // Patient management
  const handleSavePatient = async (patientData) => {
    const updated = await savePatient(patientData);
    setPatients(updated);
  };

  // Tooth update
  const handleUpdateTooth = (patientId, toothNumber, toothData) => {
    const updatedRecords = updateToothRecord(patientId, toothNumber, toothData);
    setDentalRecords(prev => ({
      ...prev,
      [patientId]: updatedRecords
    }));
  };

  // Doctor management
  const handleSaveDoctor = (doctorData) => {
    const updated = saveDoctor(doctorData);
    setDoctors(updated);
  };

  // Service management
  const handleSaveService = (serviceData) => {
    const updated = saveService(serviceData);
    setServices(updated);
  };

  // Clinic info
  const handleSaveClinic = (info) => {
    const updated = saveClinicInfo(info);
    setClinic(updated);
  };

  const pendingAppointmentsCount = appointments.filter(
    a => a.status === 'kutilmoqda' && a.appointment_date === new Date().toISOString().split('T')[0]
  ).length;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        counts={{
          pending: pendingAppointmentsCount,
          patients: patients.length
        }}
      />

      {/* Main Content Area */}
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
                  dentalRecords={dentalRecords}
                  onSavePatient={handleSavePatient}
                  onUpdateTooth={handleUpdateTooth}
                />
              )}

              {currentTab === 'doctors' && (
                <DoctorsSchedule
                  doctors={doctors}
                  onSaveDoctor={handleSaveDoctor}
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

      {/* Manual Booking Modal */}
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
