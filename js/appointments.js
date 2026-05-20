(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};

  // =========================
  // SAVE APPOINTMENT
  // =========================
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

    SH.showToast('Appointment booked successfully.', 'success');
  };

  // =========================
  // CANCEL APPOINTMENT
  // =========================
  SH.cancelAppointment = function cancelAppointment(appointmentId) {

    const items = SH.readCollection('appointments')
      .filter((appointment) => appointment.id !== appointmentId);

    SH.saveCollection('appointments', items);

    SH.showToast('Appointment cancelled.', 'warning');

    SH.renderAppointments();
  };

  // =========================
  // RENDER APPOINTMENTS
  // =========================
  SH.renderAppointments = function renderAppointments() {

    const mount = document.getElementById('appointmentsList');
    const summary = document.getElementById('appointmentsSummary');

    if (!mount || !summary) return;

    const items = SH.readCollection('appointments');

    summary.textContent =
      `${items.length} appointment${items.length === 1 ? '' : 's'} saved`;

    // EMPTY STATE
    if (!items.length) {

      mount.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <p>No appointments booked yet.</p>
        </div>
      `;

      renderPaymentList();
      renderVideoList();

      return;
    }

    // APPOINTMENTS LIST
    mount.innerHTML = items.map((appointment) => `
      <article class="list-item">

        <div class="list-item-head">

          <div>
            <h3>${appointment.doctorName}</h3>

            <p class="muted">
              ${appointment.specialization}
              at
              ${appointment.hospitalName}
            </p>
          </div>

          <span class="badge success">
            ${appointment.status}
          </span>

        </div>

        <div class="chips">

          <span class="chip">${appointment.city}</span>

          <span class="chip">
            ${SH.formatDate(appointment.date)}
          </span>

          <span class="chip">
            ${SH.formatTime(appointment.time)}
          </span>

          <span class="chip">
            ${appointment.mode || 'Clinic visit'}
          </span>

          <span class="chip">
            Payment: ${appointment.paymentStatus || 'Pending'}
          </span>

        </div>

        <p class="helper">
          ${appointment.notes || 'No notes added.'}
        </p>

        <p class="helper">
          Reminders:
          ${appointment.reminders && appointment.reminders.sms ? 'SMS on' : 'SMS off'}
          /
          ${appointment.reminders && appointment.reminders.email ? 'Email on' : 'Email off'}
        </p>

        <div class="item-actions">

          <button
            class="btn btn-secondary"
            type="button"
            data-action="video"
            data-id="${appointment.id}">
            Join Video Demo
          </button>

          <button
            class="btn btn-ghost"
            type="button"
            data-action="remind"
            data-id="${appointment.id}">
            Send Reminder
          </button>

          <button
            class="btn btn-ghost"
            type="button"
            data-action="pay"
            data-id="${appointment.id}">
            ${appointment.paymentStatus === 'Paid'
              ? 'View Receipt'
              : 'Pay Fee'}
          </button>

          <button
            class="btn btn-danger"
            type="button"
            data-action="cancel"
            data-id="${appointment.id}">
            Cancel Appointment
          </button>

        </div>

      </article>
    `).join('');

    renderPaymentList();

    renderVideoList();
  };

  // =========================
  // INITIALIZE PAGE
  // =========================
  SH.initializeAppointmentsPage = function initializeAppointmentsPage() {

    SH.initializeAppShell({
      pageId: 'appointments',
      title: 'Appointments',
      description:
        'Track, review, and cancel your consultations.',
      ctaLabel: 'Find Doctors',
      ctaHref: 'hospitals.html',
    });

    SH.renderAppointments();

    const list = document.getElementById('appointmentsList');

    if (list) {

      list.addEventListener('click', (event) => {

        const cancelBtn =
          event.target.closest('[data-action="cancel"]');

        const payBtn =
          event.target.closest('[data-action="pay"]');

        const videoBtn =
          event.target.closest('[data-action="video"]');

        const reminderBtn =
          event.target.closest('[data-action="remind"]');

        if (cancelBtn) {
          SH.cancelAppointment(cancelBtn.dataset.id);
        }

        if (payBtn) {
          markPayment(payBtn.dataset.id);
        }

        if (videoBtn) {
          startVideo(videoBtn.dataset.id);
        }

        if (reminderBtn) {
          sendReminder(reminderBtn.dataset.id);
        }
      });
    }
  };

  // =========================
  // PAYMENT
  // =========================
  function markPayment(appointmentId) {

    const items = SH.readCollection('appointments');

    const appointment =
      items.find((item) => item.id === appointmentId);

    if (!appointment) return;

    // Already Paid
    if (appointment.paymentStatus === 'Paid') {

      SH.showToast('Receipt already available.', 'success');

      return;
    }

    // MOCK PAYMENT
    appointment.paymentStatus = 'Paid';

    SH.saveCollection('appointments', items);

    const payments = SH.readCollection('payments');

    const receipt = {
      id: SH.createId('pay'),
      appointmentId,
      doctorName: appointment.doctorName,
      amount: appointment.fee || 999,
      status: 'Paid',
      method: 'Demo Payment',
      createdAt: new Date().toISOString(),
    };

    payments.unshift(receipt);

    SH.saveCollection('payments', payments);

    SH.showToast('Payment successful.', 'success');

    SH.renderAppointments();
  }

  // =========================
  // REMINDER
  // =========================
  async function sendReminder(appointmentId) {

    const appointment =
      SH.readCollection('appointments')
      .find((item) => item.id === appointmentId);

    if (!appointment) return;

    // Browser Notification
    if ("Notification" in window) {

      if (Notification.permission === "granted") {

        new Notification("Appointment Reminder", {
          body:
            `Appointment with ${appointment.doctorName} on ` +
            `${SH.formatDate(appointment.date)} at ` +
            `${SH.formatTime(appointment.time)}`
        });

      } else if (Notification.permission !== "denied") {

        Notification.requestPermission().then(permission => {

          if (permission === "granted") {

            new Notification("Appointment Reminder", {
              body:
                `Appointment with ${appointment.doctorName} on ` +
                `${SH.formatDate(appointment.date)} at ` +
                `${SH.formatTime(appointment.time)}`
            });

          }
        });
      }
    }

    SH.showToast(
      `Reminder set for ${appointment.doctorName}`,
      'success'
    );
  }

  // =========================
  // VIDEO DEMO
  // =========================
  function startVideo(appointmentId) {

    const appointment =
      SH.readCollection('appointments')
      .find((item) => item.id === appointmentId);

    if (!appointment) return;

    const consults =
      SH.readCollection('videoConsults');

    consults.unshift({
      id: SH.createId('video'),
      appointmentId,
      doctorName: appointment.doctorName,
      status: 'Waiting room ready',
      createdAt: new Date().toISOString(),
    });

    SH.saveCollection('videoConsults', consults);

    SH.showToast(
      'Video waiting room opened.',
      'success'
    );

    renderVideoList();
  }

  // =========================
  // PAYMENT LIST
  // =========================
  function renderPaymentList() {

    const mount =
      document.getElementById('paymentList');

    if (!mount) return;

    const payments =
      SH.readCollection('payments').slice(0, 5);

    if (!payments.length) {

      mount.innerHTML = `
        <div class="empty-list">
          No payments yet.
        </div>
      `;

      return;
    }

    mount.innerHTML = payments.map((payment) => `
      <article class="list-item">

        <div class="list-item-head">

          <div>
            <h3>${payment.doctorName}</h3>

            <p class="muted">
              ${payment.method}
            </p>
          </div>

          <span class="badge success">
            Rs. ${payment.amount}
          </span>

        </div>

        <p class="helper">
          ${payment.status}
        </p>

      </article>
    `).join('');
  }

  // =========================
  // VIDEO LIST
  // =========================
  function renderVideoList() {

    const mount =
      document.getElementById('videoList');

    if (!mount) return;

    const consults =
      SH.readCollection('videoConsults').slice(0, 5);

    if (!consults.length) {

      mount.innerHTML = `
        <div class="empty-list">
          No video waiting rooms started yet.
        </div>
      `;

      return;
    }

    mount.innerHTML = consults.map((consult) => `
      <article class="list-item">

        <div class="list-item-head">

          <div>
            <h3>${consult.doctorName}</h3>

            <p class="muted">
              Video consultation
            </p>
          </div>

          <span class="badge">
            ${consult.status}
          </span>

        </div>

        <p class="helper">
          Mock waiting room stored locally.
        </p>

      </article>
    `).join('');
  }

})();
