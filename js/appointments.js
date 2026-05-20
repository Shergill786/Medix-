(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};

  SH.saveAppointment = function saveAppointment(appointment) {
    const items = SH.readCollection('appointments');
    const newAppointment = {
      id: SH.createId('appt'),
      status: 'Booked',
      paymentStatus: appointment.paymentStatus || 'Pending',
      ...appointment,
    };
    items.unshift(newAppointment);
    SH.saveCollection('appointments', items);
    
    // Sync with backend API
    if (SH.apiFetch) {
      SH.apiFetch('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(newAppointment),
      }).catch((error) => {
        console.log('Backend sync note:', error.message);
      });
    }
    
    SH.showToast('Appointment booked successfully.', 'success');
  };

  SH.cancelAppointment = function cancelAppointment(appointmentId) {
    const items = SH.readCollection('appointments').filter((appointment) => appointment.id !== appointmentId);
    SH.saveCollection('appointments', items);
    
    // Sync deletion with backend API
    if (SH.apiFetch) {
      SH.apiFetch(`/api/appointments/${encodeURIComponent(appointmentId)}`, {
        method: 'DELETE',
      }).catch((error) => {
        console.log('Backend sync note:', error.message);
      });
    }
    
    SH.showToast('Appointment cancelled.', 'warning');
    SH.renderAppointments();
  };

  SH.renderAppointments = function renderAppointments() {
    const mount = document.getElementById('appointmentsList');
    const summary = document.getElementById('appointmentsSummary');
    if (!mount || !summary) return;

    const items = SH.readCollection('appointments');
    summary.textContent = `${items.length} appointment${items.length === 1 ? '' : 's'} saved to localStorage`;

    mount.innerHTML = items.length
      ? items.map((appointment) => [
          '<article class="list-item">',
          '  <div class="list-item-head">',
          '    <div>',
          `      <h3>${appointment.doctorName}</h3>`,
          `      <p class="muted">${appointment.specialization} at ${appointment.hospitalName}</p>`,
          '    </div>',
          `    <span class="badge success">${appointment.status}</span>`,
          '  </div>',
          '  <div class="chips">',
          `    <span class="chip">${appointment.city}</span>`,
          `    <span class="chip">${SH.formatDate(appointment.date)}</span>`,
          `    <span class="chip">${SH.formatTime(appointment.time)}</span>`,
          `    <span class="chip">${appointment.mode || 'Clinic visit'}</span>`,
          `    <span class="chip">Payment: ${appointment.paymentStatus || 'Pending'}</span>`,
          '  </div>',
          `  <p class="helper">${appointment.notes || 'No additional notes added for this appointment.'}</p>`,
          `  <p class="helper">Reminders: ${appointment.reminders && appointment.reminders.sms ? 'SMS on' : 'SMS off'} / ${appointment.reminders && appointment.reminders.email ? 'Email on' : 'Email off'}</p>`,
          '  <div class="item-actions">',
          `    <button class="btn btn-secondary" type="button" data-action="video" data-id="${appointment.id}">Join Video Demo</button>`,
          `    <button class="btn btn-ghost" type="button" data-action="remind" data-id="${appointment.id}">Send Reminder</button>`,
          `    <button class="btn btn-ghost" type="button" data-action="pay" data-id="${appointment.id}">${appointment.paymentStatus === 'Paid' ? 'View Receipt' : 'Pay Fee'}</button>`,
          `    <button class="btn btn-danger" type="button" data-action="cancel" data-id="${appointment.id}">Cancel Appointment</button>`,
          '  </div>',
          '</article>',
        ].join('')).join('')
      : SH.createEmptyState('No appointments booked yet. Use the hospital finder or doctor detail page to reserve a slot.');

    renderPaymentList();
    renderVideoList();
  };

  SH.initializeAppointmentsPage = function initializeAppointmentsPage() {
    SH.initializeAppShell({
      pageId: 'appointments',
      title: 'Appointments',
      description: 'Track, review, and cancel your upcoming consultations in one place.',
      ctaLabel: 'Find Doctors',
      ctaHref: 'hospitals.html',
    });

    // Sync from backend before rendering
    SH.syncAppointmentsFromBackend().then(() => {
      SH.renderAppointments();
    }).catch((error) => {
      console.log('Sync error:', error.message);
      SH.renderAppointments();
    });

    const list = document.getElementById('appointmentsList');
    if (list) {
      list.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-action="cancel"]');
        const payTrigger = event.target.closest('[data-action="pay"]');
        const videoTrigger = event.target.closest('[data-action="video"]');
        const reminderTrigger = event.target.closest('[data-action="remind"]');
        if (trigger) SH.cancelAppointment(trigger.dataset.id);
        if (payTrigger) markPayment(payTrigger.dataset.id);
        if (videoTrigger) startVideo(videoTrigger.dataset.id);
        if (reminderTrigger) sendReminder(reminderTrigger.dataset.id);
      });
    }
  };

  async function markPayment(appointmentId) {
    const items = SH.readCollection('appointments');
    const appointment = items.find((item) => item.id === appointmentId);
    if (!appointment) return;

    try {
      const order = await SH.apiFetch('/payments/order', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId,
          doctorName: appointment.doctorName,
          amount: appointment.fee || 999,
        }),
      });
      const verified = await SH.apiFetch('/payments/verify', {
        method: 'POST',
        body: JSON.stringify({ paymentId: order.payment.id, orderId: order.payment.orderId }),
      });

      appointment.paymentStatus = 'Paid';
      SH.saveCollection('appointments', items);

      const payments = SH.readCollection('payments');
      payments.unshift({
        id: verified.payment.id,
        appointmentId,
        doctorName: appointment.doctorName,
        amount: appointment.fee || 999,
        method: verified.payment.provider === 'sandbox' ? 'Sandbox receipt' : 'Razorpay test mode',
        status: verified.payment.status,
        receiptId: verified.payment.receiptId,
        createdAt: verified.payment.createdAt,
      });
      SH.saveCollection('payments', payments);
      SH.showToast(`${verified.payment.provider === 'sandbox' ? 'Sandbox receipt' : 'Test payment'} saved.`, 'success');
      SH.renderAppointments();
    } catch (error) {
      SH.showToast(`Payment service unavailable: ${error.message}`, 'danger');
    }
  }

  async function sendReminder(appointmentId) {
    const appointment = SH.readCollection('appointments').find((item) => item.id === appointmentId);
    if (!appointment) return;
    const profile = SH.getProfile();
    try {
      const result = await SH.apiFetch(`/appointments/${encodeURIComponent(appointmentId)}/reminders`, {
        method: 'POST',
        body: JSON.stringify({
          doctorName: appointment.doctorName,
          patientName: profile.name,
          email: profile.email,
          phone: profile.phone,
          sms: appointment.reminders && appointment.reminders.sms,
          emailReminder: appointment.reminders && appointment.reminders.email,
          message: `Medix reminder: ${profile.name}, your appointment with ${appointment.doctorName} is on ${SH.formatDate(appointment.date)} at ${SH.formatTime(appointment.time)}.`,
        }),
      });
      const details = (result.reminder.delivery || []).map((item) => `${item.channel}: ${item.detail}`).join(' / ');
      SH.showToast(details || 'Reminder recorded.', 'success');
    } catch (error) {
      SH.showToast(`Reminder failed: ${error.message}`, 'danger');
    }
  }

  function startVideo(appointmentId) {
    const appointment = SH.readCollection('appointments').find((item) => item.id === appointmentId);
    if (!appointment) return;

    const consults = SH.readCollection('videoConsults');
    consults.unshift({
      id: SH.createId('video'),
      appointmentId,
      doctorName: appointment.doctorName,
      status: 'Waiting room ready',
      createdAt: new Date().toISOString(),
    });
    SH.saveCollection('videoConsults', consults);
    SH.showToast('Video waiting room opened in demo mode.', 'success');
    renderVideoList();
  }

  function renderPaymentList() {
    const mount = document.getElementById('paymentList');
    if (!mount) return;
    const payments = SH.readCollection('payments').slice(0, 5);
    mount.innerHTML = payments.length
      ? payments.map((payment) => `<article class="list-item"><div class="list-item-head"><div><h3>${payment.doctorName}</h3><p class="muted">${payment.method}</p></div><span class="badge success">Rs. ${payment.amount}</span></div><p class="helper">${payment.status}${payment.receiptId ? ` - Receipt ${payment.receiptId}` : ''}</p></article>`).join('')
      : SH.createEmptyState('No demo payments yet.');
  }

  function renderVideoList() {
    const mount = document.getElementById('videoList');
    if (!mount) return;
    const consults = SH.readCollection('videoConsults').slice(0, 5);
    mount.innerHTML = consults.length
      ? consults.map((consult) => `<article class="list-item"><div class="list-item-head"><div><h3>${consult.doctorName}</h3><p class="muted">Video consultation</p></div><span class="badge">${consult.status}</span></div><p class="helper">Mock waiting room stored locally.</p></article>`).join('')
      : SH.createEmptyState('No video waiting rooms started yet.');
  }
})();
