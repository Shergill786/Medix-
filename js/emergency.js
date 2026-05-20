(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};

  SH.initializeEmergencyPage = function initializeEmergencyPage() {
    SH.initializeAppShell({
      pageId: 'emergency',
      title: 'Emergency Access',
      description: 'Reach critical contacts fast and keep a simple emergency readiness checklist close by.',
      ctaLabel: 'Find Hospital',
      ctaHref: 'hospitals.html',
    });

    const contactsMount = document.getElementById('emergencyContacts');
    contactsMount.innerHTML = SH.emergencyContacts.map((contact) => [
      '<article class="contact-card">',
      `  <span class="badge danger">${contact.type}</span>`,
      `  <h3>${contact.label}</h3>`,
      `  <p class="muted">${contact.number}</p>`,
      '  <button class="btn btn-primary btn-call-now" type="button">Call Now</button>',
      '</article>',
    ].join('')).join('');

    contactsMount.addEventListener('click', (event) => {
      const button = event.target.closest('.btn-call-now');
      if (!button) return;
      event.preventDefault();
      SH.showToast('Help is on the way. Stay calm and keep this page open.', 'success');
    });

    renderEmergencyMap();
    renderAmbulanceRequests();
    document.getElementById('ambulanceForm').addEventListener('submit', submitAmbulanceRequest);
  };

  function renderEmergencyMap() {
    const mount = document.getElementById('emergencyMap');
    const profile = SH.getProfile();
    const city = profile.city || 'Delhi';
    mount.innerHTML = [
      '<strong>Emergency Map Demo</strong>',
      `<p class="muted">Hospitals and ambulance routes near ${city}</p>`,
      `<a class="btn btn-secondary" href="https://www.google.com/maps/search/emergency+hospitals+near+${encodeURIComponent(city)}" target="_blank" rel="noreferrer">Open Map</a>`,
    ].join('');
  }

  async function submitAmbulanceRequest(event) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const result = await SH.apiFetch('/ambulance/request', {
        method: 'POST',
        body: JSON.stringify({
          patientName: form.patientName.value.trim(),
          pickup: form.pickup.value.trim(),
          condition: form.condition.value.trim(),
          city: SH.getProfile().city || 'Delhi',
        }),
      });
      const requests = SH.readCollection('ambulanceRequests');
      requests.unshift(result.request);
      SH.saveCollection('ambulanceRequests', requests);
      SH.showToast('Ambulance request recorded on the Medix server.', 'success');
      form.reset();
      renderAmbulanceRequests();
    } catch (error) {
      SH.showToast(`Ambulance request failed: ${error.message}`, 'danger');
    }
  }

  function renderAmbulanceRequests() {
    const mount = document.getElementById('ambulanceRequests');
    const requests = SH.readCollection('ambulanceRequests');
    mount.innerHTML = requests.length
      ? requests.map((request) => `<article class="list-item"><div class="list-item-head"><div><h3>${request.patientName}</h3><p class="muted">${request.pickup}</p></div><span class="badge danger">${request.eta}</span></div><p class="helper">${request.condition}</p><p class="helper">${request.status}</p>${request.mapUrl ? `<a class="btn btn-secondary" href="${request.mapUrl}" target="_blank" rel="noreferrer">Open Map Route</a>` : ''}</article>`).join('')
      : SH.createEmptyState('No ambulance requests created yet.');
  }
})();
