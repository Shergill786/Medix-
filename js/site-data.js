window.MEDIX_DATA = {
  cityCenters: {
    Delhi: { lat: 28.6139, lon: 77.2090 },
    Mumbai: { lat: 19.0760, lon: 72.8777 },
    Bengaluru: { lat: 12.9716, lon: 77.5946 },
    Chennai: { lat: 13.0827, lon: 80.2707 },
    Pune: { lat: 18.5204, lon: 73.8567 },
    Chandigarh: { lat: 30.7333, lon: 76.7794 },
    Ambala: { lat: 30.3752, lon: 76.7821 },
    Kolkata: { lat: 22.5726, lon: 88.3639 }
  },
  hospitals: [
    { id: 'h1', name: 'Apollo Health City', city: 'Delhi', type: 'Private', rating: 4.8, beds: 420, eta: '12 min', specialties: ['Cardiology', 'Neurology', 'Emergency'], address: 'Sector 18, Dwarka', phone: '+91 11 4000 1000', summary: 'Flagship tertiary-care campus with strong cardiac and neuro response.' },
    { id: 'h2', name: 'Fortis Care Institute', city: 'Delhi', type: 'Private', rating: 4.7, beds: 310, eta: '18 min', specialties: ['Oncology', 'Orthopedics', 'Pediatrics'], address: 'Shalimar Bagh', phone: '+91 11 4100 2300', summary: 'Comprehensive family hospital with pediatric and oncology care.' },
    { id: 'h13', name: 'Delhi Civic Medical Centre', city: 'Delhi', type: 'Government', rating: 4.3, beds: 560, eta: '24 min', specialties: ['Emergency', 'General Medicine', 'Pulmonology'], address: 'Civil Lines', phone: '+91 11 4020 6700', summary: 'High-volume public hospital for emergency and general medicine.' },
    { id: 'h19', name: 'Northstar Specialty Hospital', city: 'Delhi', type: 'Private', rating: 4.6, beds: 275, eta: '15 min', specialties: ['Endocrinology', 'Women Care', 'Diagnostics'], address: 'Greater Kailash II', phone: '+91 11 4555 9100', summary: 'High-comfort specialty hospital focused on women wellness, diagnostics, and planned treatment pathways.' },
    { id: 'h3', name: 'Mumbai Central Medical', city: 'Mumbai', type: 'Private', rating: 4.9, beds: 500, eta: '10 min', specialties: ['Cardiology', 'Critical Care', 'Emergency'], address: 'Parel East', phone: '+91 22 4500 8800', summary: 'High-acuity centre with advanced cardiac and emergency services.' },
    { id: 'h4', name: 'Harborline General Hospital', city: 'Mumbai', type: 'Government', rating: 4.4, beds: 620, eta: '22 min', specialties: ['Trauma', 'General Medicine', 'Nephrology'], address: 'Byculla', phone: '+91 22 4011 1200', summary: 'Large public network hospital with strong trauma and nephrology coverage.' },
    { id: 'h14', name: 'Seabreeze Women and Child Centre', city: 'Mumbai', type: 'Private', rating: 4.6, beds: 240, eta: '16 min', specialties: ['Women Care', 'Pediatrics', 'NICU'], address: 'Bandra West', phone: '+91 22 4700 5300', summary: 'Focused women and child health campus with modern neonatal care.' },
    { id: 'h20', name: 'Nariman Coast Care', city: 'Mumbai', type: 'Private', rating: 4.5, beds: 260, eta: '14 min', specialties: ['Pulmonology', 'Gastroenterology', 'Diagnostics'], address: 'Marine Drive', phone: '+91 22 4550 7810', summary: 'Urban multispecialty hospital with strong respiratory medicine and advanced diagnostic access.' },
    { id: 'h5', name: 'Bengaluru Advanced Clinic', city: 'Bengaluru', type: 'Private', rating: 4.8, beds: 360, eta: '14 min', specialties: ['Dermatology', 'Neurology', 'Women Care'], address: 'Whitefield', phone: '+91 80 4600 7700', summary: 'Specialty-led hospital with strong neuro and women care teams.' },
    { id: 'h6', name: 'Garden City Hospital', city: 'Bengaluru', type: 'Private', rating: 4.6, beds: 280, eta: '19 min', specialties: ['Orthopedics', 'Pediatrics', 'Pulmonology'], address: 'Jayanagar', phone: '+91 80 4210 3300', summary: 'Community hospital known for orthopedics and pediatric continuity.' },
    { id: 'h15', name: 'Tech Park Care Pavilion', city: 'Bengaluru', type: 'Private', rating: 4.5, beds: 210, eta: '11 min', specialties: ['General Medicine', 'Cardiology', 'Diagnostics'], address: 'Outer Ring Road', phone: '+91 80 4988 3400', summary: 'Urban rapid-access facility designed for professionals and families.' },
    { id: 'h21', name: 'Lakeside Institute of Care', city: 'Bengaluru', type: 'Private', rating: 4.7, beds: 295, eta: '13 min', specialties: ['ENT', 'Diabetes Care', 'Pediatrics'], address: 'Hebbal', phone: '+91 80 4520 9010', summary: 'Patient-friendly institute with preventive family care, ENT procedures, and chronic care planning.' },
    { id: 'h7', name: 'Chennai Lifeline Medical', city: 'Chennai', type: 'Private', rating: 4.7, beds: 390, eta: '16 min', specialties: ['Cardiology', 'Gastroenterology', 'ICU'], address: 'Anna Nagar', phone: '+91 44 4900 6600', summary: 'Large multispecialty hospital with strong ICU and cardiac pathways.' },
    { id: 'h8', name: 'Marina Public Hospital', city: 'Chennai', type: 'Government', rating: 4.3, beds: 540, eta: '24 min', specialties: ['Emergency', 'General Surgery', 'Pediatrics'], address: 'Triplicane', phone: '+91 44 4300 2200', summary: 'Public emergency and surgical care with pediatric support.' },
    { id: 'h16', name: 'South Bay Specialty Institute', city: 'Chennai', type: 'Private', rating: 4.6, beds: 260, eta: '17 min', specialties: ['Women Care', 'ENT', 'Orthopedics'], address: 'Adyar', phone: '+91 44 4855 1100', summary: 'Specialty institute for family care and scheduled procedures.' },
    { id: 'h22', name: 'Coral Heart and Family Hospital', city: 'Chennai', type: 'Private', rating: 4.5, beds: 230, eta: '18 min', specialties: ['Cardiology', 'General Medicine', 'Women Care'], address: 'Velachery', phone: '+91 44 4700 4120', summary: 'Refined family hospital built around heart screening, preventive medicine, and women health services.' },
    { id: 'h9', name: 'Pune Specialty Centre', city: 'Pune', type: 'Private', rating: 4.5, beds: 240, eta: '20 min', specialties: ['Orthopedics', 'Cardiology', 'Diabetes Care'], address: 'Baner', phone: '+91 20 4200 9900', summary: 'Strong chronic care and orthopedic follow-up centre.' },
    { id: 'h17', name: 'Riverside Care Hospital', city: 'Pune', type: 'Private', rating: 4.4, beds: 190, eta: '15 min', specialties: ['General Medicine', 'Pediatrics', 'Dermatology'], address: 'Koregaon Park', phone: '+91 20 4150 6700', summary: 'Compact city hospital focused on family medicine and day care.' },
    { id: 'h23', name: 'Pune Meridian Hospital', city: 'Pune', type: 'Private', rating: 4.6, beds: 255, eta: '17 min', specialties: ['Neurology', 'Emergency', 'Women Care'], address: 'Kharadi', phone: '+91 20 4311 5520', summary: 'Fast-growing urban hospital with emergency pathways, neuro consults, and women-focused care.' },
    { id: 'h10', name: 'Chandigarh Wellness Institute', city: 'Chandigarh', type: 'Private', rating: 4.6, beds: 260, eta: '17 min', specialties: ['Women Care', 'Pediatrics', 'ENT'], address: 'Sector 34', phone: '+91 172 430 1111', summary: 'Balanced family health institute with women and child focus.' },
    { id: 'h24', name: 'Capitol Care Hospital', city: 'Chandigarh', type: 'Private', rating: 4.5, beds: 225, eta: '16 min', specialties: ['Cardiology', 'Orthopedics', 'General Medicine'], address: 'Sector 22', phone: '+91 172 452 7700', summary: 'Modern city hospital offering cardiac review, orthopedic recovery, and everyday adult medicine.' },
    { id: 'h11', name: 'Ambala City Hospital', city: 'Ambala', type: 'Government', rating: 4.2, beds: 210, eta: '26 min', specialties: ['Emergency', 'General Medicine', 'Orthopedics'], address: 'Cantt Road', phone: '+91 171 430 5100', summary: 'Public emergency-focused hospital with orthopedic and general care.' },
    { id: 'h25', name: 'Ambala Care and Trauma Centre', city: 'Ambala', type: 'Private', rating: 4.4, beds: 180, eta: '19 min', specialties: ['Trauma', 'Pediatrics', 'Pulmonology'], address: 'Model Town', phone: '+91 171 452 8840', summary: 'Compact private hospital built around trauma response, pediatric continuity, and respiratory care.' },
    { id: 'h12', name: 'Kolkata Metro Care', city: 'Kolkata', type: 'Private', rating: 4.6, beds: 330, eta: '15 min', specialties: ['Neurology', 'Cardiology', 'Cancer Care'], address: 'Salt Lake', phone: '+91 33 4800 2222', summary: 'Specialty-led metro hospital with strong neuro and cardiac teams.' },
    { id: 'h18', name: 'Heritage General Hospital', city: 'Kolkata', type: 'Government', rating: 4.1, beds: 470, eta: '22 min', specialties: ['General Surgery', 'Emergency', 'Pulmonology'], address: 'Howrah Link Road', phone: '+91 33 4122 7800', summary: 'Large public hospital supporting surgery and respiratory medicine.' },
    { id: 'h26', name: 'Eastgate Speciality Institute', city: 'Kolkata', type: 'Private', rating: 4.5, beds: 245, eta: '18 min', specialties: ['Dermatology', 'Diabetes Care', 'Women Care'], address: 'Park Circus', phone: '+91 33 4555 9030', summary: 'Contemporary specialty institute with strong diabetes review, dermatology care, and women wellness clinics.' }
  ],
  doctors: [
    { id: 'd1', name: 'Dr. Sarah Chen', specialty: 'Cardiology', hospitalId: 'h1', hospital: 'Apollo Health City', city: 'Delhi', experience: '14 years', fee: 1200, nextSlot: '10:30', mode: 'In-person', focus: 'Preventive cardiology and post-stent follow-up' },
    { id: 'd2', name: 'Dr. Aditya Bose', specialty: 'Neurology', hospitalId: 'h1', hospital: 'Apollo Health City', city: 'Delhi', experience: '16 years', fee: 1450, nextSlot: '13:20', mode: 'Video or clinic', focus: 'Migraine, epilepsy, and stroke review' },
    { id: 'd3', name: 'Dr. Meera Tandon', specialty: 'Orthopedics', hospitalId: 'h2', hospital: 'Fortis Care Institute', city: 'Delhi', experience: '11 years', fee: 1050, nextSlot: '15:10', mode: 'In-person', focus: 'Sports injury and joint pain management' },
    { id: 'd4', name: 'Dr. Kabir Ahuja', specialty: 'Pediatrics', hospitalId: 'h2', hospital: 'Fortis Care Institute', city: 'Delhi', experience: '9 years', fee: 900, nextSlot: '17:00', mode: 'In-person', focus: 'Child growth and routine pediatric care' },
    { id: 'd5', name: 'Dr. Ritu Saxena', specialty: 'General Medicine', hospitalId: 'h13', hospital: 'Delhi Civic Medical Centre', city: 'Delhi', experience: '13 years', fee: 650, nextSlot: '09:40', mode: 'In-person', focus: 'Acute care and chronic condition stabilization' },
    { id: 'd6', name: 'Dr. Kunal Sethi', specialty: 'Emergency Medicine', hospitalId: 'h3', hospital: 'Mumbai Central Medical', city: 'Mumbai', experience: '8 years', fee: 1100, nextSlot: '18:15', mode: 'On-call priority', focus: 'Rapid emergency assessment and escalation' },
    { id: 'd7', name: 'Dr. Naira Merchant', specialty: 'Cardiology', hospitalId: 'h3', hospital: 'Mumbai Central Medical', city: 'Mumbai', experience: '15 years', fee: 1350, nextSlot: '11:50', mode: 'In-person', focus: 'Heart rhythm care and preventive screening' },
    { id: 'd8', name: 'Dr. Arjun Mehta', specialty: 'General Medicine', hospitalId: 'h4', hospital: 'Harborline General Hospital', city: 'Mumbai', experience: '9 years', fee: 700, nextSlot: '09:45', mode: 'In-person', focus: 'General consultation and chronic care review' },
    { id: 'd9', name: 'Dr. Sana Qureshi', specialty: 'Women Care', hospitalId: 'h14', hospital: 'Seabreeze Women and Child Centre', city: 'Mumbai', experience: '12 years', fee: 980, nextSlot: '12:30', mode: 'In-person', focus: 'Women wellness and maternity review' },
    { id: 'd10', name: 'Dr. Aarohi Pillai', specialty: 'Pediatrics', hospitalId: 'h14', hospital: 'Seabreeze Women and Child Centre', city: 'Mumbai', experience: '10 years', fee: 840, nextSlot: '16:10', mode: 'In-person', focus: 'Infant care and vaccination planning' },
    { id: 'd11', name: 'Dr. Raj Kumar', specialty: 'Dermatology', hospitalId: 'h5', hospital: 'Bengaluru Advanced Clinic', city: 'Bengaluru', experience: '10 years', fee: 900, nextSlot: '14:00', mode: 'In-person', focus: 'Skin therapy and long-term dermatology plans' },
    { id: 'd12', name: 'Dr. Leena Varghese', specialty: 'Neurology', hospitalId: 'h5', hospital: 'Bengaluru Advanced Clinic', city: 'Bengaluru', experience: '12 years', fee: 1300, nextSlot: '18:00', mode: 'Video or clinic', focus: 'Neuro consults and headache pathways' },
    { id: 'd13', name: 'Dr. Priya Nair', specialty: 'Orthopedics', hospitalId: 'h6', hospital: 'Garden City Hospital', city: 'Bengaluru', experience: '12 years', fee: 1000, nextSlot: '11:15', mode: 'Video or clinic', focus: 'Joint, spine, and mobility recovery' },
    { id: 'd14', name: 'Dr. Sohan Iyer', specialty: 'General Medicine', hospitalId: 'h15', hospital: 'Tech Park Care Pavilion', city: 'Bengaluru', experience: '8 years', fee: 780, nextSlot: '08:50', mode: 'In-person', focus: 'Rapid consults for busy urban schedules' },
    { id: 'd15', name: 'Dr. Isha Menon', specialty: 'Women Care', hospitalId: 'h16', hospital: 'South Bay Specialty Institute', city: 'Chennai', experience: '13 years', fee: 950, nextSlot: '17:20', mode: 'In-person', focus: 'Hormonal health and preventive checkups' },
    { id: 'd16', name: 'Dr. Harish Raman', specialty: 'Cardiology', hospitalId: 'h7', hospital: 'Chennai Lifeline Medical', city: 'Chennai', experience: '17 years', fee: 1250, nextSlot: '10:10', mode: 'In-person', focus: 'Cardiac follow-up and diagnostics' },
    { id: 'd17', name: 'Dr. Veena Krishnan', specialty: 'Emergency Medicine', hospitalId: 'h8', hospital: 'Marina Public Hospital', city: 'Chennai', experience: '11 years', fee: 620, nextSlot: '19:00', mode: 'On-call priority', focus: 'Urgent and emergency stabilization' },
    { id: 'd18', name: 'Dr. Neha Kapoor', specialty: 'Pediatrics', hospitalId: 'h10', hospital: 'Chandigarh Wellness Institute', city: 'Chandigarh', experience: '11 years', fee: 850, nextSlot: '16:30', mode: 'In-person', focus: 'Pediatric review and adolescent care' },
    { id: 'd19', name: 'Dr. Vikram Rao', specialty: 'Neurology', hospitalId: 'h12', hospital: 'Kolkata Metro Care', city: 'Kolkata', experience: '15 years', fee: 1350, nextSlot: '13:10', mode: 'Video or clinic', focus: 'Stroke recovery and neuro assessments' },
    { id: 'd20', name: 'Dr. Mitali Sen', specialty: 'Cardiology', hospitalId: 'h12', hospital: 'Kolkata Metro Care', city: 'Kolkata', experience: '14 years', fee: 1180, nextSlot: '12:00', mode: 'In-person', focus: 'Preventive cardiac evaluation' },
    { id: 'd21', name: 'Dr. Raghav Kulkarni', specialty: 'Orthopedics', hospitalId: 'h9', hospital: 'Pune Specialty Centre', city: 'Pune', experience: '10 years', fee: 930, nextSlot: '15:45', mode: 'In-person', focus: 'Bone, joint, and rehab planning' },
    { id: 'd22', name: 'Dr. Aditi Bhat', specialty: 'Dermatology', hospitalId: 'h17', hospital: 'Riverside Care Hospital', city: 'Pune', experience: '7 years', fee: 780, nextSlot: '11:25', mode: 'In-person', focus: 'Routine dermatology and skin health' },
    { id: 'd23', name: 'Dr. Pankaj Singh', specialty: 'General Medicine', hospitalId: 'h11', hospital: 'Ambala City Hospital', city: 'Ambala', experience: '12 years', fee: 550, nextSlot: '10:05', mode: 'In-person', focus: 'Primary care and symptom-led assessment' },
    { id: 'd24', name: 'Dr. Ria Thomas', specialty: 'Pulmonology', hospitalId: 'h18', hospital: 'Heritage General Hospital', city: 'Kolkata', experience: '9 years', fee: 890, nextSlot: '14:40', mode: 'Video or clinic', focus: 'Respiratory consultation and chronic lung care' },
    { id: 'd25', name: 'Dr. Tanya Malhotra', specialty: 'Women Care', hospitalId: 'h19', hospital: 'Northstar Specialty Hospital', city: 'Delhi', experience: '12 years', fee: 1120, nextSlot: '11:10', mode: 'In-person', focus: 'Preventive women wellness and hormonal care pathways' },
    { id: 'd26', name: 'Dr. Rohan Chawla', specialty: 'Endocrinology', hospitalId: 'h19', hospital: 'Northstar Specialty Hospital', city: 'Delhi', experience: '10 years', fee: 1180, nextSlot: '18:20', mode: 'Video or clinic', focus: 'Thyroid, diabetes, and metabolism-focused long-term plans' },
    { id: 'd27', name: 'Dr. Farah Dastur', specialty: 'Pulmonology', hospitalId: 'h20', hospital: 'Nariman Coast Care', city: 'Mumbai', experience: '13 years', fee: 1080, nextSlot: '09:20', mode: 'In-person', focus: 'Breathing care, allergy review, and respiratory recovery' },
    { id: 'd28', name: 'Dr. Neil Fernandes', specialty: 'Gastroenterology', hospitalId: 'h20', hospital: 'Nariman Coast Care', city: 'Mumbai', experience: '11 years', fee: 1210, nextSlot: '15:35', mode: 'In-person', focus: 'Gut health diagnostics and procedure-led GI care' },
    { id: 'd29', name: 'Dr. Kavya Murthy', specialty: 'ENT', hospitalId: 'h21', hospital: 'Lakeside Institute of Care', city: 'Bengaluru', experience: '9 years', fee: 860, nextSlot: '10:55', mode: 'In-person', focus: 'ENT review, sinus care, and minimally invasive procedures' },
    { id: 'd30', name: 'Dr. Nikhil Prasad', specialty: 'Diabetes Care', hospitalId: 'h21', hospital: 'Lakeside Institute of Care', city: 'Bengaluru', experience: '12 years', fee: 920, nextSlot: '17:10', mode: 'Video or clinic', focus: 'Lifestyle-led diabetes review and medication stabilization' },
    { id: 'd31', name: 'Dr. Keerthana Bala', specialty: 'Cardiology', hospitalId: 'h22', hospital: 'Coral Heart and Family Hospital', city: 'Chennai', experience: '14 years', fee: 1190, nextSlot: '12:20', mode: 'In-person', focus: 'Heart screening, preventive evaluation, and recovery planning' },
    { id: 'd32', name: 'Dr. Shruti Anand', specialty: 'General Medicine', hospitalId: 'h22', hospital: 'Coral Heart and Family Hospital', city: 'Chennai', experience: '8 years', fee: 760, nextSlot: '16:45', mode: 'In-person', focus: 'Primary consultations, ongoing care review, and care coordination' },
    { id: 'd33', name: 'Dr. Omkar Deshpande', specialty: 'Neurology', hospitalId: 'h23', hospital: 'Pune Meridian Hospital', city: 'Pune', experience: '11 years', fee: 1140, nextSlot: '13:25', mode: 'Video or clinic', focus: 'Headache, dizziness, and neuro follow-up care' },
    { id: 'd34', name: 'Dr. Simran Vaidya', specialty: 'Women Care', hospitalId: 'h23', hospital: 'Pune Meridian Hospital', city: 'Pune', experience: '10 years', fee: 980, nextSlot: '18:05', mode: 'In-person', focus: 'Routine gynecology, wellness checks, and preventive care' },
    { id: 'd35', name: 'Dr. Gurleen Sandhu', specialty: 'Cardiology', hospitalId: 'h24', hospital: 'Capitol Care Hospital', city: 'Chandigarh', experience: '13 years', fee: 1100, nextSlot: '09:55', mode: 'In-person', focus: 'Heart health review with a preventive and lifestyle-based approach' },
    { id: 'd36', name: 'Dr. Aniket Puri', specialty: 'Orthopedics', hospitalId: 'h24', hospital: 'Capitol Care Hospital', city: 'Chandigarh', experience: '9 years', fee: 960, nextSlot: '14:15', mode: 'In-person', focus: 'Fracture recovery, joint mobility, and day-to-day orthopedic pain care' },
    { id: 'd37', name: 'Dr. Ishita Bawa', specialty: 'Trauma', hospitalId: 'h25', hospital: 'Ambala Care and Trauma Centre', city: 'Ambala', experience: '8 years', fee: 840, nextSlot: '12:10', mode: 'On-call priority', focus: 'Rapid trauma review and post-emergency follow-up planning' },
    { id: 'd38', name: 'Dr. Dev Malik', specialty: 'Pediatrics', hospitalId: 'h25', hospital: 'Ambala Care and Trauma Centre', city: 'Ambala', experience: '10 years', fee: 700, nextSlot: '17:30', mode: 'In-person', focus: 'Routine child consults, fever care, and vaccine guidance' },
    { id: 'd39', name: 'Dr. Ayesha Ghosh', specialty: 'Dermatology', hospitalId: 'h26', hospital: 'Eastgate Speciality Institute', city: 'Kolkata', experience: '9 years', fee: 870, nextSlot: '10:40', mode: 'In-person', focus: 'Skin therapy, acne care, and long-term skin health programs' },
    { id: 'd40', name: 'Dr. Arindam Paul', specialty: 'Diabetes Care', hospitalId: 'h26', hospital: 'Eastgate Speciality Institute', city: 'Kolkata', experience: '12 years', fee: 950, nextSlot: '15:20', mode: 'Video or clinic', focus: 'Glucose management, nutrition review, and chronic care planning' }
  ],
  reminders: [
    { id: 'r1', medicine: 'Metformin', dosage: '500 mg', time: '08:00', frequency: 'Daily', notes: 'After breakfast', taken: false },
    { id: 'r2', medicine: 'Vitamin D3', dosage: '1 capsule', time: '21:00', frequency: 'Daily', notes: 'After dinner', taken: false }
  ],
  emergencyContacts: [
    { label: 'National Emergency', number: '112', type: 'Critical' },
    { label: 'Ambulance', number: '108', type: 'Medical' },
    { label: 'Police', number: '100', type: 'Safety' },
    { label: 'Fire Services', number: '101', type: 'Fire' },
    { label: 'Women Helpline', number: '1091', type: 'Support' },
    { label: 'Poison Support', number: '1800-116-117', type: 'Toxicology' }
  ],
  profile: {
    name: 'Aarav Mehta',
    email: 'aarav.mehta@medix.com',
    phone: '+91 98765 43210',
    age: 32,
    bloodGroup: 'B+',
    height: "5'10\"",
    weight: '75 kg',
    allergies: 'Penicillin',
    doctor: 'Dr. Sarah Chen',
    insurance: 'Medix Shield Plus'
  },
  settings: {
    notifications: true,
    reminders: true,
    emergencyShare: true,
    newsletter: false,
    theme: 'light'
  }
};

(function () {
  const data = window.MEDIX_DATA || {};

  window.DataAPI = window.DataAPI || {
    getHospitals() {
      return data.hospitals || [];
    },
    getDoctors() {
      return data.doctors || [];
    },
    getAppointments() {
      return data.appointments || [
        { doctor: 'Dr. Sarah Chen', specialty: 'Cardiology', hospital: 'Apollo Health City', date: '2026-04-10', time: '10:30' },
        { doctor: 'Dr. Meera Tandon', specialty: 'Orthopedics', hospital: 'Fortis Care Institute', date: '2026-04-12', time: '15:10' },
      ];
    },
    getProfile() {
      return data.profile || {};
    },
  };

  window.Utils = window.Utils || {
    formatShortDate(value) {
      return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(value));
    },
    formatTime(value) {
      const [hour, minute] = String(value || '00:00').split(':');
      const date = new Date();
      date.setHours(Number(hour || 0), Number(minute || 0));
      return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(date);
    },
    showToast(message) {
      alert(message);
    },
  };

  window.MedixAPI = window.MedixAPI || {
    async getWeatherByCity(city) {
      const centers = data.cityCenters || {};
      const center = centers[city] || centers.Delhi || { lat: 28.6139, lon: 77.2090 };
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${center.lat}&longitude=${center.lon}&current=temperature_2m,apparent_temperature,wind_speed_10m,uv_index,weather_code&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Weather unavailable');
      const json = await response.json();
      const current = json.current || {};
      return {
        city,
        country: 'India',
        temperature: Math.round(current.temperature_2m || 0),
        feelsLike: Math.round(current.apparent_temperature || current.temperature_2m || 0),
        wind: Math.round(current.wind_speed_10m || 0),
        uv: current.uv_index || 0,
        label: current.weather_code === 0 ? 'Clear sky' : 'Mixed conditions',
      };
    },
    getCareTip(weather) {
      if ((weather.uv || 0) >= 7) return 'Carry water and avoid unnecessary peak sun exposure before appointments.';
      return 'Use local conditions and appointment timing when planning travel.';
    },
  };
})();
