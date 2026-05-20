(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};
  let selectedHospital = null;
  let selectedDoctor = null;

  SH.initializeHospitalFinderPage = function initializeHospitalFinderPage() {
    SH.initializeAppShell({
      pageId: 'hospitals',
      title: 'Hospital & Doctor Finder',
      description: 'Search by city, compare doctors, book appointments, and use demo map/video/payment tools.',
    });

    renderCityOptions();
    renderSpecializationOptions();
    applyFinderParams();
    bindFinderEvents();
    renderHospitalList();
    renderCityHealthPulse();
  };

  function renderCityOptions() {
    const select = document.getElementById('citySelect');
    const cities = SH.getCities();
    select.innerHTML = cities.map((city) => `<option value="${city}">${city}</option>`).join('');
    select.value = SH.getProfile().city && cities.includes(SH.getProfile().city) ? SH.getProfile().city : cities[0];
  }

  function renderSpecializationOptions() {
    const select = document.getElementById('specializationFilter');
    const specializations = [...new Set(SH.getAllDoctors().map((doctor) => doctor.specialization))];
    select.innerHTML = `<option value="">All specializations</option>${specializations.map((item) => `<option value="${item}">${item}</option>`).join('')}`;
  }

  function applyFinderParams() {
    const params = new URLSearchParams(window.location.search);
    const cityParam = params.get('city');
    const hospitalParam = params.get('hospital');
    const citySelect = document.getElementById('citySelect');
    const cities = SH.getCities();
    if (cityParam && cities.includes(cityParam)) citySelect.value = cityParam;
    if (hospitalParam) {
      const match = SH.hospitalData
        .flatMap((entry) => entry.hospitals.map((hospital) => ({ ...hospital, city: entry.city })))
        .find((hospital) => hospital.id === hospitalParam);
      if (match) {
        citySelect.value = match.city;
        selectedHospital = match.id;
      }
    }
  }

  function bindFinderEvents() {
    document.getElementById('citySelect').addEventListener('change', () => {
      selectedHospital = null;
      renderHospitalList();
      renderCityHealthPulse();
      renderMapPreview();
    });
    document.getElementById('searchInput').addEventListener('input', renderHospitalList);
    document.getElementById('specializationFilter').addEventListener('change', renderDoctorPanel);
    document.getElementById('hospitalList').addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-hospital-id]');
      if (!trigger) return;
      selectedHospital = trigger.dataset.hospitalId;
      renderHospitalList();
    });
    document.getElementById('doctorList').addEventListener('click', handleDoctorAction);
    document.getElementById('bookingClose').addEventListener('click', () => SH.closeModal(document.getElementById('bookingModal')));
    document.getElementById('bookingForm').addEventListener('submit', submitBooking);
  }

  function renderHospitalList() {
    const city = document.getElementById('citySelect').value;
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const mount = document.getElementById('hospitalList');
    const hospitals = SH.getHospitalsByCity(city);
    const filtered = hospitals.filter((hospital) => {
      const doctorNames = hospital.doctors.map((doctor) => `${doctor.name} ${doctor.specialization}`).join(' ').toLowerCase();
      const haystack = `${hospital.name} ${hospital.description} ${hospital.address} ${doctorNames}`.toLowerCase();
      return !query || haystack.includes(query);
    });

    if (!selectedHospital || !filtered.some((hospital) => hospital.id === selectedHospital)) {
      selectedHospital = filtered[0] ? filtered[0].id : null;
    }

    mount.innerHTML = filtered.length
      ? filtered.map((hospital) => [
          `<article class="hospital-card ${selectedHospital === hospital.id ? 'is-selected' : ''}" data-hospital-id="${hospital.id}">`,
          '  <div class="hospital-meta">',
          '    <div>',
          `      <h3>${hospital.name}</h3>`,
          `      <p class="muted">${hospital.address}</p>`,
          '    </div>',
          `    <span class="badge">${hospital.rating} rating</span>`,
          '  </div>',
          `  <p class="helper">${hospital.description}</p>`,
          '  <div class="chips">',
          `    <span class="chip">${hospital.waitTime}</span>`,
          `    <span class="chip">${hospital.doctors.length} doctors</span>`,
          '    <span class="chip">Mock map ready</span>',
          '  </div>',
          '</article>',
        ].join('')).join('')
      : SH.createEmptyState('No hospitals match this search. Try another keyword or city.');

    renderDoctorPanel();
    renderMapPreview();
  }

  function renderDoctorPanel() {
    const mount = document.getElementById('doctorList');
    const city = document.getElementById('citySelect').value;
    const specialization = document.getElementById('specializationFilter').value;
    const hospital = SH.getHospitalsByCity(city).find((item) => item.id === selectedHospital);

    if (!hospital) {
      mount.innerHTML = SH.createEmptyState('Select a hospital to see the doctor roster.');
      return;
    }

    const doctors = hospital.doctors.filter((doctor) => !specialization || doctor.specialization === specialization);
    mount.innerHTML = doctors.length
      ? doctors.map((doctor) => [
          `<article class="doctor-card media-card" data-doctor-id="${doctor.id}">`,
          '  <div class="doctor-photo" aria-hidden="true"></div>',
          '  <div class="doctor-card-body">',
          '    <div class="doctor-meta">',
          '      <div>',
          `        <h3>${doctor.name}</h3>`,
          `        <p class="muted">${doctor.specialization} at ${hospital.name}</p>`,
          '      </div>',
          `      <span class="badge success">${doctor.rating} stars</span>`,
          '    </div>',
          `    <p class="helper">${doctor.availability}</p>`,
          '    <div class="chips">',
          `      <span class="chip">${doctor.experience}</span>`,
          `      <span class="chip">Fee: Rs. ${doctor.fee}</span>`,
          '      <span class="chip">Video available</span>',
          '    </div>',
          '    <div class="item-actions">',
          '      <button class="btn btn-secondary" type="button" data-action="video">Join Video Demo</button>',
          '      <button class="btn btn-ghost" type="button" data-action="pay">Test Pay</button>',
          '      <button class="btn btn-primary" type="button" data-action="book">Book</button>',
          '    </div>',
          '  </div>',
          '</article>',
        ].join('')).join('')
      : SH.createEmptyState('No doctors match the selected specialization for this hospital.');
  }

  function handleDoctorAction(event) {
    const button = event.target.closest('[data-action]');
    const card = event.target.closest('[data-doctor-id]');
    if (!button || !card) return;

    selectedDoctor = SH.getDoctorById(card.dataset.doctorId);
    if (!selectedDoctor) return;

    if (button.dataset.action === 'book') {
      document.getElementById('bookingDoctor').textContent = `${selectedDoctor.name} - ${selectedDoctor.specialization}`;
      document.getElementById('bookingDate').value = '';
      document.getElementById('bookingTime').innerHTML = selectedDoctor.slots.map((slot) => `<option value="${slot}">${slot}</option>`).join('');
      document.getElementById('bookingFeeSummary').innerHTML = `<strong>Demo fee: Rs. ${selectedDoctor.fee}</strong><p class="helper">Payment can be marked later from Appointments.</p>`;
      SH.openModal(document.getElementById('bookingModal'));
      return;
    }

    if (button.dataset.action === 'video') {
      const consults = SH.readCollection('videoConsults');
      consults.unshift({ id: SH.createId('video'), doctorName: selectedDoctor.name, status: 'Waiting room ready', createdAt: new Date().toISOString() });
      SH.saveCollection('videoConsults', consults);
      SH.showToast('Video consultation demo waiting room is ready.', 'success');
      return;
    }

    if (button.dataset.action === 'pay') {
      createDoctorPayment(selectedDoctor);
    }
  }

  async function createDoctorPayment(doctor) {
    try {
      const order = await SH.apiFetch('/payments/order', {
        method: 'POST',
        body: JSON.stringify({ doctorName: doctor.name, amount: doctor.fee }),
      });
      const verified = await SH.apiFetch('/payments/verify', {
        method: 'POST',
        body: JSON.stringify({ paymentId: order.payment.id, orderId: order.payment.orderId }),
      });
      const payments = SH.readCollection('payments');
      payments.unshift({
        id: verified.payment.id,
        doctorName: doctor.name,
        amount: doctor.fee,
        method: verified.payment.provider === 'sandbox' ? 'Sandbox receipt' : 'Razorpay test mode',
        status: verified.payment.status,
        receiptId: verified.payment.receiptId,
        createdAt: verified.payment.createdAt,
      });
      SH.saveCollection('payments', payments);
      SH.showToast(`Payment receipt saved for Rs. ${doctor.fee}.`, 'success');
    } catch (error) {
      SH.showToast(`Payment service unavailable: ${error.message}`, 'danger');
    }
  }

  function submitBooking(event) {
    event.preventDefault();
    if (!selectedDoctor) {
      SH.showToast('Please choose a doctor first.', 'warning');
      return;
    }

    const form = event.currentTarget;
    const city = document.getElementById('citySelect').value;
    const hospital = SH.getHospitalsByCity(city).find((item) => item.id === selectedHospital);

    SH.saveAppointment({
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      specialization: selectedDoctor.specialization,
      hospitalName: hospital ? hospital.name : selectedDoctor.hospitalName,
      city,
      date: form.date.value,
      time: form.time.value,
      notes: form.notes.value.trim(),
      fee: selectedDoctor.fee,
      mode: form.mode.value,
      reminders: {
        sms: form.smsReminder.checked,
        email: form.emailReminder.checked,
      },
      paymentStatus: 'Pending',
    });

    SH.closeModal(document.getElementById('bookingModal'));
    form.reset();
  }

  function renderMapPreview() {
    const city = document.getElementById('citySelect').value;
    const hospital = SH.getHospitalById(selectedHospital);
    const map = document.getElementById('mapPreview');
    if (!map) return;
    map.innerHTML = [
      '<strong>Map Demo</strong>',
      `<p class="muted">${hospital ? hospital.name : 'Hospitals'} near ${city}</p>`,
      `<a class="btn btn-secondary" href="https://www.google.com/maps/search/hospitals+in+${encodeURIComponent(city)}" target="_blank" rel="noreferrer">Open Map</a>`,
    ].join('');
  }

  async function renderCityHealthPulse() {
    const mount = document.getElementById('cityHealthPulse');
    if (!mount) return;
    const city = document.getElementById('citySelect').value;
    mount.innerHTML = '<div class="loading-state"><div class="spinner" aria-hidden="true"></div><p>Loading live city conditions...</p></div>';

    try {
      const data = await SH.fetchWeatherAndAirQuality(city);
      mount.innerHTML = [
        '<div class="api-grid">',
        `  <article class="api-card"><p class="muted">Resolved city</p><strong>${data.city}</strong><p class="helper">${data.country}</p></article>`,
        `  <article class="api-card"><p class="muted">Weather</p><strong>${Math.round(data.temperature)} C</strong><p class="helper">${data.weatherLabel}</p></article>`,
        `  <article class="api-card"><p class="muted">Air quality</p><strong>${data.aqi || 'N/A'}</strong><p class="helper">${data.aqiLabel}</p></article>`,
        `  <article class="api-card"><p class="muted">Extra context</p><strong>UV ${data.uv || 0}</strong><p class="helper">PM2.5 ${data.pm25 || 'N/A'} - Wind ${Math.round(data.wind || 0)} km/h</p></article>`,
        '</div>',
      ].join('');
    } catch (error) {
      mount.innerHTML = SH.createEmptyState(`Unable to load live conditions for ${city} right now.`);
    }
  }
})();
