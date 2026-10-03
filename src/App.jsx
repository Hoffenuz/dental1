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
import { INITIAL_DENTAL_RECORDS } from './data/mockAdminData';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // States
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [clinic, setClinic] = useState({});
  const [dentalRecords, setDentalRecords] = useState(INITIAL_DENTAL_RECORDS);

  // Modal states
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);

  // Initial data loading
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [appData, patData, docData, srvData] = await Promise.all([
        getAppointments(),
        getPatients(),
        getDoctors(),
        getServices()
      ]);
      setAppointments(appData);
      setPatients(patData);
      setDoctors(docData);
      setServices(srvData);
      setClinic(getClinicInfo());
    } catch (e) {
      console.error('Data loading error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Status updates
  const handleUpdateStatus = async (appointmentId, status) => {
    const updated = await updateAppointmentStatus(appointmentId, status);
    setAppointments(updated);
    
    // Telegram Bot backend xabarnomasi
    const booking = appointments.find(a => a.id === appointmentId);
    if (booking) {
      try {
        fetch('http://localhost:4000/api/notify-status-change', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ booking, newStatus: status })
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
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 font-medium">Boshqaruv paneli yuklanmoqda...</p>
            </div>
          ) : (
            <>
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
            </>
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
