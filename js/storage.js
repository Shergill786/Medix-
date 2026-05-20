(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};

  const KEYS = {
    appointments: 'smart_health_appointments',
    reminders: 'smart_health_reminders',
    records: 'smart_health_records',
    profile: 'smart_health_profile',
    settings: 'smart_health_settings',
    chatbot: 'medix_chatbot_history',
    prescriptions: 'medix_prescriptions',
    cart: 'medix_cart',
    payments: 'medix_payments',
    videoConsults: 'medix_video_consults',
    ambulanceRequests: 'medix_ambulance_requests',
  };

  const SEEDS = {
    appointments: [
      {
        id: 'appt-1',
        doctorId: 'doc-sharma',
        doctorName: 'Dr. Rohan Sharma',
        specialization: 'Cardiology',
        hospitalName: 'AIIMS Delhi',
        city: 'Delhi',
        date: '2026-05-25',
        time: '10:00',
        notes: 'Routine cardiac follow-up and blood pressure review.',
        status: 'Booked',
      },
      {
        id: 'appt-2',
        doctorId: 'doc-nair',
        doctorName: 'Dr. Meera Nair',
        specialization: 'Pediatrics',
        hospitalName: 'Lilavati Hospital',
        city: 'Mumbai',
        date: '2026-06-02',
        time: '10:30',
        notes: 'Family pediatric consultation and vaccination planning.',
        status: 'Booked',
      },
    ],
    reminders: [
      { id: 'rem-1', medicine: 'Vitamin D3', time: '08:00', dosage: '1 tablet', notes: 'After breakfast', active: true },
      { id: 'rem-2', medicine: 'Metformin', time: '21:00', dosage: '500mg', notes: 'After dinner', active: true },
    ],
    records: [
      { id: 'rec-1', title: 'Annual Checkup', type: 'Consultation', hospital: 'AIIMS Delhi', date: '2026-03-15', notes: 'Blood pressure stable and annual screening completed.' },
      { id: 'rec-2', title: 'Dental Review', type: 'Lab Report', hospital: 'Apollo Hospitals Bengaluru', date: '2026-02-22', notes: 'Routine dental imaging with no follow-up concerns.' },
    ],
    profile: {
      name: 'Aarav Mehta',
      email: 'aarav.mehta@example.com',
      phone: '+91 98765 43210',
      city: 'Delhi',
      bloodGroup: 'B+',
      age: '31',
      emergencyContact: '+91 91234 56789',
    },
    settings: {
      theme: 'light',
    },
    chatbot: [
      { role: 'bot', text: 'Hi, I can help you find doctors, buy medicines, prepare records, or reach emergency help.' },
    ],
    prescriptions: [
      {
        id: 'rx-1',
        title: 'Diabetes follow-up prescription',
        doctor: 'Dr. Rohan Sharma',
        date: '2026-03-28',
        medicines: 'Metformin 500mg - after dinner; Vitamin D3 - after breakfast',
        notes: 'Demo prescription saved from a doctor visit.',
      },
    ],
    cart: [],
    payments: [],
    videoConsults: [],
    ambulanceRequests: [],
  };

  SH.seedStorage = function seedStorage() {
    Object.keys(KEYS).forEach((key) => {
      if (!localStorage.getItem(KEYS[key])) {
        localStorage.setItem(KEYS[key], JSON.stringify(SEEDS[key]));
      }
    });
  };

  SH.readCollection = function readCollection(name) {
    const key = KEYS[name] || name;
    return JSON.parse(localStorage.getItem(key) || '[]');
  };

  SH.saveCollection = function saveCollection(name, data) {
    const key = KEYS[name] || name;
    localStorage.setItem(key, JSON.stringify(data));
  };

  SH.getProfile = function getProfile() {
    return JSON.parse(localStorage.getItem(KEYS.profile) || JSON.stringify(SEEDS.profile));
  };

  SH.saveProfile = function saveProfile(profile) {
    localStorage.setItem(KEYS.profile, JSON.stringify(profile));
  };

  SH.getSetting = function getSetting(name) {
    const settings = JSON.parse(localStorage.getItem(KEYS.settings) || JSON.stringify(SEEDS.settings));
    return settings[name];
  };

  SH.saveSetting = function saveSetting(name, value) {
    const settings = JSON.parse(localStorage.getItem(KEYS.settings) || JSON.stringify(SEEDS.settings));
    settings[name] = value;
    localStorage.setItem(KEYS.settings, JSON.stringify(settings));
  };

  SH.getStorageKey = function getStorageKey(name) {
    return KEYS[name] || name;
  };

  SH.createId = function createId(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  };

  SH.syncAppointmentsFromBackend = async function syncAppointmentsFromBackend() {
    try {
      if (!SH.apiFetch) return;
      const response = await SH.apiFetch('/api/appointments');
      if (response && response.ok && Array.isArray(response.appointments)) {
        SH.saveCollection('appointments', response.appointments);
      }
    } catch (error) {
      console.log('Appointments sync note:', error.message);
    }
  };

  SH.syncRemindersFromBackend = async function syncRemindersFromBackend() {
    try {
      if (!SH.apiFetch) return;
      const response = await SH.apiFetch('/api/reminders');
      if (response && response.ok && Array.isArray(response.reminders)) {
        SH.saveCollection('reminders', response.reminders);
      }
    } catch (error) {
      console.log('Reminders sync note:', error.message);
    }
  };
})();
