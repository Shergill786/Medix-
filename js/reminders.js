(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};

  SH.initializeRemindersPage = function initializeRemindersPage() {
    SH.initializeAppShell({
      pageId: 'reminders',
      title: 'Medicine Reminders',
      description: 'Add, review, and remove medicine reminders with persistent local storage support.',
      ctaLabel: 'Open Dashboard',
      ctaHref: 'dashboard.html',
    });

    // Sync from backend before rendering
    SH.syncRemindersFromBackend().then(() => {
      renderReminders();
    }).catch((error) => {
      console.log('Sync error:', error.message);
      renderReminders();
    });

    document.getElementById('reminderForm').addEventListener('submit', addReminder);
    document.getElementById('remindersList').addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-remove-reminder]');
      if (!trigger) return;
      const reminderId = trigger.dataset.removeReminder;
      const items = SH.readCollection('reminders').filter((reminder) => reminder.id !== reminderId);
      SH.saveCollection('reminders', items);
      
      // Sync deletion with backend API
      if (SH.apiFetch) {
        SH.apiFetch(`/api/reminders/${encodeURIComponent(reminderId)}`, {
          method: 'DELETE',
        }).catch((error) => {
          console.log('Backend sync note:', error.message);
        });
      }
      
      SH.showToast('Reminder removed.', 'warning');
      renderReminders();
    });
  };

  function addReminder(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const medicine = form.medicine.value.trim();
    const dosage = form.dosage.value.trim();
    const time = form.time.value;
    const notes = form.notes.value.trim();

    if (!medicine || !dosage || !time) {
      SH.showToast('Please complete all required reminder fields.', 'warning');
      return;
    }

    const items = SH.readCollection('reminders');
    const newReminder = {
      id: SH.createId('rem'),
      medicine,
      dosage,
      time,
      notes,
      reminders: {
        sms: form.smsReminder.checked,
        email: form.emailReminder.checked,
      },
      active: true,
    };
    items.unshift(newReminder);
    SH.saveCollection('reminders', items);
    
    // Sync with backend API
    if (SH.apiFetch) {
      SH.apiFetch('/api/reminders', {
        method: 'POST',
        body: JSON.stringify(newReminder),
      }).catch((error) => {
        console.log('Backend sync note:', error.message);
      });
    }
    
    SH.showToast('Reminder added.', 'success');
    form.reset();
    renderReminders();
  }

  function renderReminders() {
    const mount = document.getElementById('remindersList');
    const items = SH.readCollection('reminders');
    mount.innerHTML = items.length
      ? items.map((reminder) => [
          '<article class="reminder-card">',
          '  <div class="list-item-head">',
          '    <div>',
          `      <h3>${reminder.medicine}</h3>`,
          `      <p class="muted">${reminder.dosage}</p>`,
          '    </div>',
          `    <span class="badge success">${reminder.time}</span>`,
          '  </div>',
          `  <p class="helper">${reminder.notes || 'No extra notes added.'}</p>`,
          `  <p class="helper">Alerts: ${reminder.reminders && reminder.reminders.sms ? 'SMS on' : 'SMS off'} / ${reminder.reminders && reminder.reminders.email ? 'Email on' : 'Email off'}</p>`,
          '  <div class="item-actions">',
          '    <span class="muted">Stored locally for fast follow-up</span>',
          `    <button class="btn btn-danger" type="button" data-remove-reminder="${reminder.id}">Delete</button>`,
          '  </div>',
          '</article>',
        ].join('')).join('')
      : SH.createEmptyState('No reminders yet. Add your first medicine reminder above.');
  }
})();
