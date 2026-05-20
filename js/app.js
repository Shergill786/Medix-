(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};
  const API_BASE = window.MEDIX_API_BASE || '/api';

  const NAV_ITEMS = [
    { id: 'home', label: 'Home', href: 'index.html' },
    { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
    { id: 'hospitals', label: 'Hospital Finder', href: 'hospitals.html' },
    { id: 'appointments', label: 'Appointments', href: 'appointments.html' },
    { id: 'reminders', label: 'Reminders', href: 'reminders.html' },
    { id: 'pharmacy', label: 'Buy Medicines', href: 'pharmacy.html' },
    { id: 'records', label: 'Health Records', href: 'records.html' },
    { id: 'emergency', label: 'Emergency', href: 'emergency.html' },
    { id: 'profile', label: 'Profile', href: 'profile.html' },
    { id: 'settings', label: 'Settings', href: 'settings.html' },
    { id: 'about', label: 'About', href: 'about.html' },
  ];

  SH.initializeAppShell = function initializeAppShell(options) {
    const config = options || {};
    SH.seedStorage();
    applyTheme();
    renderSidebar(config.pageId || '');
    renderTopbar(
      config.title || 'Medix',
      config.description || ''
    );
    renderChatbot();
  };

  SH.apiFetch = SH.apiFetch || async function apiFetch(path, options) {
    const token = localStorage.getItem('medix_auth_token');
    const config = options || {};
    const headers = {
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}${path}`, { ...config, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.error || `API request failed (${response.status})`);
    return data;
  };

  SH.renderQuote = async function renderQuote(targetId, options) {
    const target = document.getElementById(targetId);
    if (!target) return;

    target.innerHTML = '<div class="loading-state"><div class="spinner" aria-hidden="true"></div><p>Loading today\'s wellness quote...</p></div>';

    try {
      const quote = await SH.fetchHealthQuote();
      target.innerHTML = [
        '<div class="card">',
        '  <div class="card-head">',
        '    <div>',
        '      <span class="eyebrow">Daily Insight</span>',
        `      <h3 style="margin-top:12px;">${quote.content}</h3>`,
        '    </div>',
        `    <span class="badge success">${quote.author}</span>`,
        '  </div>',
        '</div>',
      ].join('');
    } catch (error) {
      const message = (options && options.errorMessage) || 'Unable to load the health quote right now. Please try again shortly.';
      target.innerHTML = `<div class="empty-state" role="alert"><p>${message}</p></div>`;
    }
  };

  SH.showToast = function showToast(message, tone) {
    const current = document.querySelector('.toast');
    if (current) current.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.background =
      tone === 'danger' ? '#d75d6a' :
      tone === 'error' ? '#d75d6a' :
      tone === 'success' ? '#24a47d' :
      tone === 'warning' ? '#b57b37' :
      '#0f6f79';

    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 2600);
  };

  SH.openModal = function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  };

  SH.closeModal = function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  };

  SH.formatDate = function formatDate(value) {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  };

  SH.formatTime = function formatTime(value) {
    const parts = value.split(':');
    const date = new Date();
    date.setHours(Number(parts[0]), Number(parts[1]));
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  SH.createEmptyState = function createEmptyState(message) {
    return `<div class="empty-state"><p>${message}</p></div>`;
  };

  SH.applyTheme = applyTheme;
  SH.renderChatbot = renderChatbot;

  SH.renderFloatingThemeToggle = function renderFloatingThemeToggle() {
    if (document.querySelector('[data-floating-theme-toggle]')) return;
    const button = document.createElement('button');
    button.className = 'floating-theme-toggle btn btn-secondary';
    button.type = 'button';
    button.dataset.themeToggle = 'true';
    button.dataset.floatingThemeToggle = 'true';
    document.body.appendChild(button);
    updateThemeButton();
    button.addEventListener('click', SH.toggleTheme);
  };

  SH.toggleTheme = function toggleTheme() {
    const nextTheme = (SH.getSetting('theme') || 'light') === 'dark' ? 'light' : 'dark';
    SH.saveSetting('theme', nextTheme);
    applyTheme(nextTheme);
    updateThemeButton();
    SH.showToast(`${nextTheme === 'dark' ? 'Dark' : 'Light'} mode enabled.`, 'success');
  };

  function renderSidebar(pageId) {
    const mount = document.querySelector('[data-sidebar]');
    if (!mount) return;

    const profile = SH.getProfile();
    const initials = profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

    mount.innerHTML = [
      '<div class="sidebar-brand">',
        '  <a class="brand" href="index.html"><span class="brand-mark"><img src="assets/smart-health-mark.svg" alt="" class="brand-logo" /></span><span class="brand-name">Medix</span></a>',
      '</div>',
      '<nav class="sidebar-nav" aria-label="Primary navigation">',
      NAV_ITEMS.map((item) => `<a href="${item.href}" class="${item.id === pageId ? 'active' : ''}">${item.label}</a>`).join(''),
      '</nav>',
      '<div class="sidebar-footer">',
      '  <div class="list-card">',
      '    <div class="card-head">',
      '      <div>',
      '        <p class="muted">Signed in as</p>',
      `        <strong>${profile.name}</strong>`,
      '      </div>',
      `      <span class="badge">${initials}</span>`,
      '    </div>',
      `    <p class="helper">${profile.email}</p>`,
      '  </div>',
      '  <button class="btn btn-secondary theme-toggle" type="button" data-theme-toggle></button>',
      '</div>',
    ].join('');

    updateThemeButton();
    const toggle = mount.querySelector('[data-theme-toggle]');
    if (toggle) toggle.addEventListener('click', SH.toggleTheme);
  }

  function renderTopbar(title, description) {
    const mount = document.querySelector('[data-topbar]');
    if (!mount) return;

    mount.innerHTML = [
      '<div class="topbar-copy">',
      `  <h1>${title}</h1>`,
      `  <p class="muted">${description}</p>`,
      '</div>',
    ].join('');
  }

  function applyTheme(theme) {
    const activeTheme = theme || SH.getSetting('theme') || 'light';
    document.documentElement.classList.toggle('dark-mode', activeTheme === 'dark');
    document.documentElement.classList.toggle('light-mode', activeTheme !== 'dark');
    document.body.classList.toggle('theme-dark', activeTheme === 'dark');
    document.body.classList.toggle('theme-light', activeTheme !== 'dark');
    document.body.dataset.theme = activeTheme;
  }

  function updateThemeButton() {
    const isDark = (SH.getSetting('theme') || 'light') === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.textContent = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      button.setAttribute('aria-pressed', String(isDark));
    });
  }

  function renderChatbot() {
    if (document.querySelector('.chatbot-fab')) return;

    const shell = document.createElement('div');
    shell.className = 'chatbot-widget';
    shell.innerHTML = [
      '<button class="chatbot-fab" type="button" aria-expanded="false">Chat</button>',
      '<section class="chatbot-panel" aria-label="Medix chatbot">',
      '  <div class="chatbot-head">',
      '    <div><strong>Medix Assistant</strong><p class="muted">Server-safe chatbot</p></div>',
      '    <button class="icon-btn" type="button" data-chat-close aria-label="Close chatbot">x</button>',
      '  </div>',
      '  <div class="chatbot-log" data-chat-log></div>',
      '  <div class="chatbot-prompts">',
      '    <button type="button" data-chat-prompt="Find hospitals">Find hospitals</button>',
      '    <button type="button" data-chat-prompt="Buy medicines">Buy medicines</button>',
      '    <button type="button" data-chat-prompt="Emergency help">Emergency help</button>',
      '    <button type="button" data-chat-prompt="Create reminders">Create reminders</button>',
      '  </div>',
      '  <form class="chatbot-form" data-chat-form>',
      '    <input class="input" name="message" placeholder="Ask about Medix..." autocomplete="off" />',
      '    <button class="btn btn-primary" type="submit">Send</button>',
      '  </form>',
      '  <p class="helper chatbot-safe-note">API keys stay on the Medix server. This assistant gives navigation help, not diagnosis.</p>',
      '</section>',
    ].join('');

    document.body.appendChild(shell);
    const fab = shell.querySelector('.chatbot-fab');
    const panel = shell.querySelector('.chatbot-panel');
    const close = shell.querySelector('[data-chat-close]');
    const form = shell.querySelector('[data-chat-form]');
    const promptButtons = shell.querySelectorAll('[data-chat-prompt]');

    fab.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('open');
      fab.setAttribute('aria-expanded', String(isOpen));
      renderChatLog(shell);
    });
    close.addEventListener('click', () => {
      panel.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const message = form.message.value.trim();
      if (!message) return;
      addChatMessage(message, shell);
      form.reset();
    });
    promptButtons.forEach((button) => {
      button.addEventListener('click', () => addChatMessage(button.dataset.chatPrompt, shell));
    });
  }

  async function addChatMessage(message, shell) {
    const history = SH.readCollection('chatbot');
    history.push({ role: 'user', text: message });
    history.push({ role: 'bot', text: 'Thinking with the API...' });
    SH.saveCollection('chatbot', history.slice(-16));
    renderChatLog(shell);

    const reply = await getChatReply(message);
    const updated = SH.readCollection('chatbot');
    let pending = null;
    for (let index = updated.length - 1; index >= 0; index -= 1) {
      if (updated[index].role === 'bot' && updated[index].text === 'Thinking with the API...') {
        pending = updated[index];
        break;
      }
    }
    if (pending) pending.text = reply;
    SH.saveCollection('chatbot', updated.slice(-16));
    renderChatLog(shell);
  }

  function renderChatLog(shell) {
    const log = shell.querySelector('[data-chat-log]');
    const history = SH.readCollection('chatbot');
    log.innerHTML = history.map((item) => `<p class="${item.role === 'user' ? 'user' : 'bot'}">${escapeHtml(item.text)}</p>`).join('');
    log.scrollTop = log.scrollHeight;
  }

  async function getChatReply(message) {
    function localChatReply(messageText) {
      const text = messageText.toLowerCase();
      if (text.includes('hospital') || text.includes('doctor')) return 'Open Hospital Finder to compare hospitals, doctors, fees, and available slots.';
      if (text.includes('medicine') || text.includes('buy')) return 'Use Buy Medicines to add medicines to your cart and upload prescriptions from Health Records.';
      if (text.includes('emergency') || text.includes('ambulance')) return 'For emergencies, contact emergency services immediately. Open Emergency for maps and ambulance request support.';
      if (text.includes('reminder') || text.includes('prescription')) return 'Upload prescriptions in Health Records, then generate medicine reminders from extracted details.';
      if (text.includes('payment')) return 'Appointments can create test-mode payment orders or sandbox receipts when payment keys are not configured.';
      return 'I can guide you to hospitals, appointments, reminders, records, medicines, payments, video consults, or emergency support.';
    }

    try {
      const data = await SH.apiFetch('/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      return data.reply;
    } catch (error) {
      return `${localChatReply(message)} Server note: ${error.message}`;
    }
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));
  }

})();
