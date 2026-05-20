(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};

  SH.initializeRecordsPage = function initializeRecordsPage() {
    SH.initializeAppShell({
      pageId: 'records',
      title: 'Health Records',
      description: 'Store a lightweight history of reports, checkups, and medical notes.',
      ctaLabel: 'Add Reminder',
      ctaHref: 'reminders.html',
    });

    renderRecords();
    renderPrescriptions();
    document.getElementById('recordForm').addEventListener('submit', addRecord);
    document.getElementById('prescriptionUploadForm').addEventListener('submit', uploadPrescription);
    document.getElementById('prescriptionsList').addEventListener('click', createRemindersFromPrescription);
  };

  function addRecord(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const title = form.title.value.trim();
    const type = form.type.value.trim();
    const hospital = form.hospital.value.trim();
    const date = form.date.value;
    const doctor = form.doctor.value.trim();
    const medicines = form.medicines.value.trim();
    const notes = form.notes.value.trim();

    if (!title || !type || !hospital || !date) {
      SH.showToast('Complete all required record fields.', 'warning');
      return;
    }

    const items = SH.readCollection('records');
    items.unshift({
      id: SH.createId('rec'),
      title,
      type,
      hospital,
      date,
      doctor,
      medicines,
      notes,
    });
    SH.saveCollection('records', items);

    if (type.toLowerCase().includes('prescription') || medicines) {
      const prescriptions = SH.readCollection('prescriptions');
      prescriptions.unshift({
        id: SH.createId('rx'),
        title,
        doctor: doctor || 'Doctor not specified',
        date,
        medicines,
        notes,
      });
      SH.saveCollection('prescriptions', prescriptions);
    }

    SH.showToast('Health record saved.', 'success');
    form.reset();
    renderRecords();
    renderPrescriptions();
  }

  function renderRecords() {
    const mount = document.getElementById('recordsList');
    const items = SH.readCollection('records');
    mount.innerHTML = items.length
      ? items.map((record) => [
          '<article class="record-card">',
          '  <div class="record-meta">',
          '    <div>',
          `      <h3>${record.title}</h3>`,
          `      <p class="muted">${record.type}</p>`,
          '    </div>',
          `    <span class="badge">${record.date}</span>`,
          '  </div>',
          `  <p class="helper">${record.hospital}</p>`,
          record.medicines ? `  <p class="helper"><strong>Medicines:</strong> ${record.medicines}</p>` : '',
          `  <p class="helper">${record.notes || 'No additional notes stored for this record.'}</p>`,
          '</article>',
        ].join('')).join('')
      : SH.createEmptyState('No health records saved yet. Add one using the form above.');
  }

  function renderPrescriptions() {
    const mount = document.getElementById('prescriptionsList');
    if (!mount) return;
    const items = SH.readCollection('prescriptions');
    mount.innerHTML = items.length
      ? items.map((item) => [
          '<article class="record-card prescription-card">',
          '  <div class="record-meta">',
          '    <div>',
          `      <h3>${item.title}</h3>`,
          `      <p class="muted">${item.doctor}</p>`,
          '    </div>',
          `    <span class="badge">${item.date}</span>`,
          '  </div>',
          `  <p class="helper"><strong>Medicines:</strong> ${item.medicines || 'No medicine list entered yet.'}</p>`,
          item.notes ? `  <p class="helper">${item.notes}</p>` : '',
          item.provider ? `  <span class="badge">${item.provider}</span>` : '',
          '  <div class="item-actions">',
          `    <button class="btn btn-secondary" type="button" data-create-reminders="${item.id}">Create Reminders</button>`,
          '  </div>',
          '</article>',
        ].join('')).join('')
      : SH.createEmptyState('No prescription records yet. Add a record with medicine details to create one.');
  }

  async function uploadPrescription(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = form.prescriptionFile.files[0];
    const text = form.prescriptionText.value.trim();
    const status = document.getElementById('prescriptionUploadStatus');
    const button = document.getElementById('prescriptionUploadBtn');

    if (!file && !text) {
      SH.showToast('Choose a file or paste prescription text first.', 'warning');
      return;
    }

    button.disabled = true;
    button.textContent = 'Extracting...';
    status.textContent = 'Sending prescription to the Medix server.';

    try {
      const dataUrl = file ? await fileToDataUrl(file) : '';
      const result = await SH.apiFetch('/prescriptions/upload', {
        method: 'POST',
        body: JSON.stringify({
          filename: file ? file.name : 'manual-prescription-text',
          dataUrl,
          text,
        }),
      });

      const prescriptions = SH.readCollection('prescriptions');
      prescriptions.unshift(result.prescription);
      SH.saveCollection('prescriptions', prescriptions);

      const records = SH.readCollection('records');
      records.unshift({
        id: SH.createId('rec'),
        title: result.prescription.title,
        type: 'Prescription Upload',
        hospital: 'Uploaded to Medix',
        date: result.prescription.date,
        doctor: result.prescription.doctor,
        medicines: result.prescription.medicines,
        notes: result.prescription.notes,
      });
      SH.saveCollection('records', records);

      form.reset();
      status.textContent = `Extraction complete using ${result.prescription.provider}. Review before creating reminders.`;
      SH.showToast('Prescription extracted and saved.', 'success');
      renderRecords();
      renderPrescriptions();
    } catch (error) {
      status.textContent = error.message;
      SH.showToast(`Prescription upload failed: ${error.message}`, 'danger');
    } finally {
      button.disabled = false;
      button.textContent = 'Extract Prescription';
    }
  }

  function createRemindersFromPrescription(event) {
    const trigger = event.target.closest('[data-create-reminders]');
    if (!trigger) return;
    const prescription = SH.readCollection('prescriptions').find((item) => item.id === trigger.dataset.createReminders);
    if (!prescription || !prescription.medicines) {
      SH.showToast('Add medicine details before creating reminders.', 'warning');
      return;
    }

    const reminders = SH.readCollection('reminders');
    prescription.medicines.split(';').map((item) => item.trim()).filter(Boolean).forEach((medicine, index) => {
      reminders.unshift({
        id: SH.createId('rem'),
        medicine,
        dosage: 'As prescribed',
        time: index % 2 === 0 ? '08:00' : '21:00',
        notes: `Created from ${prescription.title}`,
        reminders: { sms: true, email: true },
        active: true,
      });
    });
    SH.saveCollection('reminders', reminders);
    SH.showToast('Prescription reminders created.', 'success');
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Could not read selected file.'));
      reader.readAsDataURL(file);
    });
  }
})();
