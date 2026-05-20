(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};

  SH.initializeDashboardPage = function initializeDashboardPage() {
    SH.initializeAppShell({
      pageId: 'dashboard',
      title: 'Medix Analytics Dashboard',
      description: 'Track appointments, reminders, prescriptions, payments, and live care context in one place.',
    });

    // Sync from backend before rendering
    Promise.all([
      SH.syncAppointmentsFromBackend(),
      SH.syncRemindersFromBackend(),
    ]).then(() => {
      renderStats();
      renderAppointmentsPreview();
      renderRemindersPreview();
    }).catch((error) => {
      console.log('Sync error:', error.message);
      renderStats();
      renderAppointmentsPreview();
      renderRemindersPreview();
    });

    renderCareConditions();
    renderServerAnalytics();
    SH.renderQuote('dashboardQuote');
  };

  function renderStats() {
    const appointments = SH.readCollection('appointments');
    const reminders = SH.readCollection('reminders');
    const records = SH.readCollection('records');
    const prescriptions = SH.readCollection('prescriptions');
    const payments = SH.readCollection('payments');
    const pendingPayments = appointments.filter((appointment) => appointment.paymentStatus !== 'Paid').length;

    document.getElementById('statsGrid').innerHTML = [
      `<article class="stat-card"><strong>${appointments.length}</strong><p class="muted">Booked appointments</p></article>`,
      `<article class="stat-card"><strong>${reminders.length}</strong><p class="muted">Medicine reminders</p></article>`,
      `<article class="stat-card"><strong>${records.length}</strong><p class="muted">Saved records</p></article>`,
      `<article class="stat-card"><strong>${prescriptions.length}</strong><p class="muted">Prescriptions</p></article>`,
      `<article class="stat-card"><strong>${pendingPayments}</strong><p class="muted">Pending payments</p></article>`,
      `<article class="stat-card"><strong>${payments.length}</strong><p class="muted">Demo receipts</p></article>`,
    ].join('');
  }

  function renderAppointmentsPreview() {
    const mount = document.getElementById('dashboardAppointments');
    const appointments = SH.readCollection('appointments').slice(0, 3);
    mount.innerHTML = appointments.length
      ? appointments.map((appointment) => [
          '<article class="list-item">',
          '  <div class="list-item-head">',
          '    <div>',
          `      <h3>${appointment.doctorName}</h3>`,
          `      <p class="muted">${appointment.specialization} - ${appointment.hospitalName}</p>`,
          '    </div>',
          `    <span class="badge">${SH.formatTime(appointment.time)}</span>`,
          '  </div>',
          `  <p class="helper">${SH.formatDate(appointment.date)} - ${appointment.city} - ${appointment.mode || 'Clinic visit'}</p>`,
          '</article>',
        ].join('')).join('')
      : SH.createEmptyState('No appointments yet. Book from the hospital finder.');
  }

  function renderRemindersPreview() {
    const mount = document.getElementById('dashboardReminders');
    const reminders = SH.readCollection('reminders').slice(0, 3);
    mount.innerHTML = reminders.length
      ? reminders.map((reminder) => [
          '<article class="list-item">',
          '  <div class="list-item-head">',
          '    <div>',
          `      <h3>${reminder.medicine}</h3>`,
          `      <p class="muted">${reminder.dosage}</p>`,
          '    </div>',
          `    <span class="badge success">${reminder.time}</span>`,
          '  </div>',
          `  <p class="helper">${reminder.notes || 'Routine reminder'}</p>`,
          '</article>',
        ].join('')).join('')
      : SH.createEmptyState('No reminders yet. Add one from the medicine reminder page.');
  }

  async function renderCareConditions() {
    const mount = document.getElementById('dashboardConditions');
    if (!mount) return;

    const profile = SH.getProfile();
    const city = profile.city || 'Delhi';
    mount.innerHTML = '<div class="loading-state"><div class="spinner" aria-hidden="true"></div><p>Loading live weather and air-quality data...</p></div>';

    try {
      const data = await SH.fetchWeatherAndAirQuality(city);
      mount.innerHTML = [
        '<div class="api-grid">',
        `  <article class="api-card"><p class="muted">Resolved city</p><strong>${data.city}</strong><p class="helper">${data.country}</p></article>`,
        `  <article class="api-card"><p class="muted">Current weather</p><strong>${Math.round(data.temperature)} C</strong><p class="helper">${data.weatherLabel}</p></article>`,
        `  <article class="api-card"><p class="muted">Air quality</p><strong>${data.aqi || 'N/A'}</strong><p class="helper">${data.aqiLabel} - PM2.5 ${data.pm25 || 'N/A'}</p></article>`,
        `  <article class="api-card"><p class="muted">Exposure context</p><strong>UV ${data.uv || 0}</strong><p class="helper">Feels like ${Math.round(data.feelsLike || data.temperature)} C - Wind ${Math.round(data.wind || 0)} km/h</p></article>`,
        '</div>',
      ].join('');
    } catch (error) {
      mount.innerHTML = SH.createEmptyState(`Live city conditions are unavailable for ${city} right now. Please try again in a moment.`);
    }
  }

  async function renderServerAnalytics() {
    const mount = document.getElementById('serverAnalytics');
    if (!mount) return;
    try {
      const data = await SH.apiFetch('/analytics');
      const analytics = data.analytics;
      mount.innerHTML = [
        analyticsCard('Users', analytics.serverUsers),
        analyticsCard('Prescriptions', analytics.prescriptionsUploaded),
        analyticsCard('Reminders', analytics.remindersSent),
        analyticsCard('Payments', `${analytics.paidPayments}/${analytics.payments}`),
        analyticsCard('Ambulance', analytics.ambulanceRequests),
        analyticsCard('Chatbot', analytics.chatbotMessages),
      ].join('');
    } catch (error) {
      mount.innerHTML = SH.createEmptyState(`Server analytics unavailable: ${error.message}`);
    }
  }

  function analyticsCard(label, value) {
    return `<article class="api-card"><p class="muted">${label}</p><strong>${value}</strong></article>`;
  }
})();
