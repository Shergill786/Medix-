(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};

  SH.initializeDoctorPage = function initializeDoctorPage() {
    SH.initializeAppShell({
      pageId: 'hospitals',
      title: 'Doctor Details',
      description: 'Review specialization, availability, video consultation, and demo payment options before booking.',
    });

    const params = new URLSearchParams(window.location.search);
    const doctor = SH.getDoctorById(params.get('id'));
    const mount = document.getElementById('doctorDetail');
    const modal = document.getElementById('doctorBookingModal');

    if (!doctor) {
      mount.innerHTML = '<div class="empty-state"><p>Doctor not found. Please return to the hospital finder and choose a doctor.</p></div>';
      return;
    }

    mount.innerHTML = [
      '<section class="finder-hero">',
      '  <div>',
      '    <span class="eyebrow">Doctor Profile</span>',
      `    <h2>${doctor.name}</h2>`,
      `    <p class="helper">${doctor.specialization} - ${doctor.hospitalName}, ${doctor.city}</p>`,
      '  </div>',
      '  <div class="map-preview">',
      `    <strong>Fee: Rs. ${doctor.fee}</strong>`,
      `    <p class="muted">${doctor.rating} stars - ${doctor.experience}</p>`,
      '  </div>',
      '</section>',
      '<section class="panel detail-stack">',
      `  <p class="helper">${doctor.about}</p>`,
      '  <div class="chips">',
      `    <span class="chip">${doctor.availability}</span>`,
      `    <span class="chip">${doctor.education}</span>`,
      `    <span class="chip">${doctor.languages}</span>`,
      '  </div>',
      '  <div class="item-actions">',
      '    <a class="btn btn-secondary" href="hospitals.html">Back to Finder</a>',
      '    <button id="startDoctorVideo" class="btn btn-ghost" type="button">Join Video Demo</button>',
      '    <button id="payDoctorFee" class="btn btn-secondary" type="button">Test Pay Fee</button>',
      '    <button id="openDoctorBooking" class="btn btn-primary" type="button">Book Appointment</button>',
      '  </div>',
      '</section>',
    ].join('');

    document.getElementById('doctorBookingSummary').textContent = `${doctor.name} - ${doctor.specialization}`;
    document.getElementById('doctorBookingTime').innerHTML = doctor.slots.map((slot) => `<option value="${slot}">${slot}</option>`).join('');

    document.getElementById('openDoctorBooking').addEventListener('click', () => SH.openModal(modal));
    document.getElementById('doctorBookingClose').addEventListener('click', () => SH.closeModal(modal));
    document.getElementById('startDoctorVideo').addEventListener('click', () => {
      const consults = SH.readCollection('videoConsults');
      consults.unshift({ id: SH.createId('video'), doctorName: doctor.name, status: 'Waiting room ready', createdAt: new Date().toISOString() });
      SH.saveCollection('videoConsults', consults);
      SH.showToast('Video consultation demo waiting room is ready.', 'success');
    });
    document.getElementById('payDoctorFee').addEventListener('click', async () => {
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
    });
    document.getElementById('doctorBookingForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.currentTarget;

      SH.saveAppointment({
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        hospitalName: doctor.hospitalName,
        city: doctor.city,
        date: form.date.value,
        time: form.time.value,
        notes: form.notes.value.trim(),
        fee: doctor.fee,
        mode: form.mode.value,
        reminders: {
          sms: form.smsReminder.checked,
          email: form.emailReminder.checked,
        },
        paymentStatus: 'Pending',
      });

      SH.closeModal(modal);
      form.reset();
    });
  };
})();
