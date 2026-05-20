(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};

  const hospitalData = [
    {
      city: 'Delhi',
      hospitals: [
        {
          id: 'delhi-aiims',
          name: 'AIIMS Delhi',
          address: 'Ansari Nagar, New Delhi',
          rating: 4.9,
          waitTime: '14 min average response',
          description: 'Leading tertiary care hospital with strong emergency, cardiology, and neurology teams.',
          doctors: [
            { id: 'doc-sharma', name: 'Dr. Rohan Sharma', specialization: 'Cardiology', availability: 'Mon-Fri, 10:00 AM - 4:00 PM', rating: 4.9, experience: '15 years', fee: 1300, about: 'Focuses on preventive cardiology, ECG review, and follow-up care.', education: 'MD Cardiology', languages: 'English, Hindi', slots: ['10:00', '11:30', '15:00'] },
            { id: 'doc-gupta', name: 'Dr. Kavya Gupta', specialization: 'Neurology', availability: 'Tue-Sat, 11:00 AM - 5:00 PM', rating: 4.8, experience: '11 years', fee: 1450, about: 'Handles headache, dizziness, and neuro follow-up care.', education: 'DM Neurology', languages: 'English, Hindi', slots: ['11:00', '13:30', '16:00'] },
          ],
        },
        {
          id: 'delhi-fortis',
          name: 'Fortis Escorts Heart Institute',
          address: 'Okhla Road, New Delhi',
          rating: 4.7,
          waitTime: '18 min average response',
          description: 'High-quality heart care center with strong outpatient specialist support.',
          doctors: [
            { id: 'doc-khurana', name: 'Dr. Isha Khurana', specialization: 'Cardiology', availability: 'Mon-Sat, 9:30 AM - 2:00 PM', rating: 4.7, experience: '13 years', fee: 1200, about: 'Known for preventive cardiac evaluations and long-term patient coaching.', education: 'DM Cardiology', languages: 'English, Hindi', slots: ['09:30', '12:00', '13:30'] },
            { id: 'doc-joshi', name: 'Dr. Neeraj Joshi', specialization: 'General Physician', availability: 'Mon-Fri, 8:30 AM - 12:30 PM', rating: 4.6, experience: '10 years', fee: 800, about: 'Manages routine adult consultations, fever care, and referrals.', education: 'MD Internal Medicine', languages: 'English, Hindi', slots: ['08:30', '10:00', '12:00'] },
          ],
        },
      ],
    },
    {
      city: 'Mumbai',
      hospitals: [
        {
          id: 'mumbai-kokilaben',
          name: 'Kokilaben Hospital',
          address: 'Andheri West, Mumbai',
          rating: 4.8,
          waitTime: '12 min average response',
          description: 'Modern multi-specialty campus with fast access to specialists and diagnostics.',
          doctors: [
            { id: 'doc-mehta', name: 'Dr. Aarav Mehta', specialization: 'Orthopedics', availability: 'Mon-Fri, 10:30 AM - 5:00 PM', rating: 4.8, experience: '14 years', fee: 1100, about: 'Supports sports injuries, joint pain, and post-surgery recovery.', education: 'MS Orthopedics', languages: 'English, Hindi, Marathi', slots: ['10:30', '01:00', '04:30'] },
            { id: 'doc-patel', name: 'Dr. Siya Patel', specialization: 'Dermatology', availability: 'Tue-Sun, 11:00 AM - 6:00 PM', rating: 4.7, experience: '9 years', fee: 950, about: 'Handles skin allergies, acne plans, and preventive skin health.', education: 'MD Dermatology', languages: 'English, Hindi, Gujarati', slots: ['11:00', '02:30', '05:00'] },
          ],
        },
        {
          id: 'mumbai-lilavati',
          name: 'Lilavati Hospital',
          address: 'Bandra West, Mumbai',
          rating: 4.6,
          waitTime: '16 min average response',
          description: 'Patient-friendly hospital with strong internal medicine and pediatrics services.',
          doctors: [
            { id: 'doc-nair', name: 'Dr. Meera Nair', specialization: 'Pediatrics', availability: 'Mon-Sat, 9:00 AM - 1:00 PM', rating: 4.8, experience: '12 years', fee: 900, about: 'Specializes in child wellness visits, fever care, and growth monitoring.', education: 'MD Pediatrics', languages: 'English, Hindi, Malayalam', slots: ['09:00', '10:30', '12:30'] },
            { id: 'doc-khan', name: 'Dr. Faizan Khan', specialization: 'General Physician', availability: 'Daily, 1:00 PM - 7:00 PM', rating: 4.5, experience: '8 years', fee: 780, about: 'Provides everyday care, adult checkups, and chronic illness follow-ups.', education: 'MD Internal Medicine', languages: 'English, Hindi', slots: ['13:00', '15:30', '18:30'] },
          ],
        },
      ],
    },
    {
      city: 'Bengaluru',
      hospitals: [
        {
          id: 'blr-manipal',
          name: 'Manipal Hospital',
          address: 'Old Airport Road, Bengaluru',
          rating: 4.7,
          waitTime: '13 min average response',
          description: 'Large specialty hospital with strong diagnostics, neurology, and women care.',
          doctors: [
            { id: 'doc-reddy', name: 'Dr. Anika Reddy', specialization: 'Gynecology', availability: 'Mon-Fri, 10:00 AM - 3:00 PM', rating: 4.7, experience: '12 years', fee: 1050, about: 'Focuses on preventive women care and reproductive health support.', education: 'MS Obstetrics & Gynecology', languages: 'English, Hindi, Kannada', slots: ['10:00', '12:00', '14:30'] },
            { id: 'doc-verma', name: 'Dr. Karan Verma', specialization: 'Neurology', availability: 'Mon-Sat, 12:00 PM - 6:00 PM', rating: 4.8, experience: '16 years', fee: 1500, about: 'Handles neurological assessments, migraine care, and stroke recovery review.', education: 'DM Neurology', languages: 'English, Hindi', slots: ['12:00', '14:00', '17:00'] },
          ],
        },
        {
          id: 'blr-apollo',
          name: 'Apollo Hospitals Bengaluru',
          address: 'Bannerghatta Road, Bengaluru',
          rating: 4.6,
          waitTime: '15 min average response',
          description: 'Reliable multi-specialty hospital with strong outpatient appointment flow.',
          doctors: [
            { id: 'doc-hegde', name: 'Dr. Riya Hegde', specialization: 'ENT', availability: 'Tue-Sun, 9:30 AM - 4:30 PM', rating: 4.6, experience: '9 years', fee: 880, about: 'Treats sinus issues, throat infections, and hearing-related concerns.', education: 'MS ENT', languages: 'English, Kannada', slots: ['09:30', '11:30', '15:30'] },
            { id: 'doc-shetty', name: 'Dr. Nikhil Shetty', specialization: 'Orthopedics', availability: 'Mon-Sat, 11:00 AM - 5:30 PM', rating: 4.7, experience: '13 years', fee: 1150, about: 'Supports mobility recovery, fractures, and knee pain treatment plans.', education: 'MS Orthopedics', languages: 'English, Hindi, Kannada', slots: ['11:00', '01:30', '05:00'] },
          ],
        },
      ],
    },
    {
      city: 'Chennai',
      hospitals: [
        {
          id: 'chennai-mgm',
          name: 'MGM Healthcare',
          address: 'Aminjikarai, Chennai',
          rating: 4.7,
          waitTime: '17 min average response',
          description: 'Advanced care center known for cardiac, surgery, and family medicine support.',
          doctors: [
            { id: 'doc-iyer', name: 'Dr. Shravan Iyer', specialization: 'Cardiology', availability: 'Mon-Fri, 10:00 AM - 2:30 PM', rating: 4.9, experience: '17 years', fee: 1400, about: 'Works with preventive cardiology, diagnostics, and recovery plans.', education: 'DM Cardiology', languages: 'English, Tamil', slots: ['10:00', '12:00', '14:00'] },
            { id: 'doc-menon', name: 'Dr. Laya Menon', specialization: 'General Physician', availability: 'Daily, 8:30 AM - 1:30 PM', rating: 4.6, experience: '11 years', fee: 760, about: 'Supports routine consultations, care plans, and chronic illness review.', education: 'MD General Medicine', languages: 'English, Tamil, Malayalam', slots: ['08:30', '10:30', '13:00'] },
          ],
        },
      ],
    },
  ];

  const emergencyContacts = [
    { label: 'Ambulance', number: '108', type: 'Emergency' },
    { label: 'National Emergency', number: '112', type: 'Critical' },
    { label: 'Women Helpline', number: '1091', type: 'Support' },
    { label: 'Poison Helpline', number: '1800-116-117', type: 'Toxicology' },
  ];

  SH.hospitalData = hospitalData;
  SH.emergencyContacts = emergencyContacts;

  SH.getCities = function getCities() {
    return hospitalData.map((item) => item.city);
  };

  SH.getHospitalsByCity = function getHospitalsByCity(city) {
    const match = hospitalData.find((entry) => entry.city === city);
    return match ? match.hospitals : [];
  };

  SH.getHospitalById = function getHospitalById(id) {
    return hospitalData.flatMap((entry) => entry.hospitals).find((hospital) => hospital.id === id);
  };

  SH.getDoctorById = function getDoctorById(id) {
    return hospitalData
      .flatMap((entry) =>
        entry.hospitals.flatMap((hospital) =>
          hospital.doctors.map((doctor) => ({
            ...doctor,
            hospitalId: hospital.id,
            hospitalName: hospital.name,
            city: entry.city,
          }))
        )
      )
      .find((doctor) => doctor.id === id);
  };

  SH.getAllDoctors = function getAllDoctors() {
    return hospitalData.flatMap((entry) =>
      entry.hospitals.flatMap((hospital) =>
        hospital.doctors.map((doctor) => ({
          ...doctor,
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          city: entry.city,
        }))
      )
    );
  };
})();
