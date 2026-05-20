(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};

  SH.initializeSettingsPage = function initializeSettingsPage() {
    SH.initializeAppShell({
      pageId: 'settings',
      title: 'Settings',
      description: 'Manage your preferences and account settings.',
      ctaLabel: 'Go to Dashboard',
      ctaHref: 'dashboard.html',
    });

    const profile = SH.getProfile();
    
    // Update email display
    document.getElementById('settingsEmail').textContent = profile.email || 'email@example.com';

    // Load settings from local storage
    loadSettings();

    // Attach event listeners
    attachEventListeners();

    // Update theme status
    updateThemeStatus();

    // Initialize tab switching
    initializeTabSwitching();

    // Initialize modal functionality
    initializeModals();
  };

  function initializeModals() {
    // Close modals when clicking outside
    document.querySelectorAll('.modal-overlay').forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeAllModals();
        }
      });
    });

    // Add event delegation for modal confirm buttons
    document.addEventListener('click', (e) => {
      const confirmBtn = e.target.closest('[data-modal-action="confirm"]');
      if (!confirmBtn) return;

      const modal = confirmBtn.closest('.modal-overlay');
      if (!modal) return;

      const modalId = modal.id;

      if (modalId === 'emailModal') {
        const newEmail = document.getElementById('newEmailInput').value.trim();
        if (!newEmail) {
          SH.showToast('Please enter a valid email', 'danger');
          return;
        }
        const profile = SH.getProfile();
        profile.email = newEmail;
        SH.saveProfile(profile);
        document.getElementById('settingsEmail').textContent = newEmail;
        SH.showToast('Email updated successfully', 'success');
        closeAllModals();
      } else if (modalId === 'passwordModal') {
        const oldPassword = document.getElementById('currentPasswordInput').value;
        const newPassword = document.getElementById('newPasswordInput').value;
        const confirmPassword = document.getElementById('confirmPasswordInput').value;

        if (!oldPassword || !newPassword || !confirmPassword) {
          SH.showToast('Please fill in all password fields', 'danger');
          return;
        }

        if (newPassword !== confirmPassword) {
          SH.showToast('Passwords do not match', 'danger');
          return;
        }

        SH.showToast('Password changed successfully', 'success');
        closeAllModals();
      } else if (modalId === 'confirmModal') {
        const title = document.getElementById('confirmTitle').textContent;
        if (title === 'Clear Cache') {
          localStorage.clear();
          SH.showToast('Cache cleared. Redirecting to login...', 'success');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
        } else if (title === 'Logout') {
          localStorage.removeItem('medix_auth_token');
          localStorage.removeItem('medix_profile');
          SH.showToast('Logged out successfully', 'success');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
        }
        closeAllModals();
      } else if (modalId === 'deleteAccountModal') {
        const profile = SH.getProfile();
        const email = document.getElementById('confirmEmailInput').value.trim();
        if (email !== profile.email) {
          SH.showToast('Email does not match. Account deletion cancelled.', 'danger');
          return;
        }
        localStorage.clear();
        SH.showToast('Account deleted. Redirecting to home...', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      }
    });
  }

  function initializeTabSwitching() {
    const tabButtons = document.querySelectorAll('.settings-tab-btn');
    const sections = document.querySelectorAll('.settings-section');

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;

        // Remove active class from all buttons and sections
        tabButtons.forEach((b) => b.classList.remove('active'));
        sections.forEach((s) => s.classList.remove('active'));

        // Add active class to clicked button and corresponding section
        btn.classList.add('active');
        const activeSection = document.querySelector(`[data-section="${tabId}"]`);
        if (activeSection) {
          activeSection.classList.add('active');
        }

        // Save the active tab preference
        SH.saveSetting('activeSettingsTab', tabId);
      });
    });

    // Load the last active tab
    const lastActiveTab = SH.getSetting('activeSettingsTab') || 'account';
    const lastActiveBtn = document.querySelector(`[data-tab="${lastActiveTab}"]`);
    if (lastActiveBtn) {
      lastActiveBtn.click();
    }
  }

  function loadSettings() {
    // Notification preferences
    const appointmentReminders = SH.getSetting('appointmentReminders');
    const medicineReminders = SH.getSetting('medicineReminders');
    const emergencyAlerts = SH.getSetting('emergencyAlerts');
    
    document.getElementById('appointmentReminders').checked = appointmentReminders !== false;
    document.getElementById('medicineReminders').checked = medicineReminders !== false;
    document.getElementById('emergencyAlerts').checked = emergencyAlerts !== false;

    // Privacy preferences
    const profileVisibility = SH.getSetting('profileVisibility') || 'private';
    const dataCollection = SH.getSetting('dataCollection');
    
    document.getElementById('profileVisibility').value = profileVisibility;
    document.getElementById('dataCollection').checked = dataCollection !== false;
  }

  function attachEventListeners() {
    // Notification toggles
    document.getElementById('appointmentReminders').addEventListener('change', (e) => {
      SH.saveSetting('appointmentReminders', e.target.checked);
      SH.showToast('Appointment reminders ' + (e.target.checked ? 'enabled' : 'disabled'), 'success');
    });

    document.getElementById('medicineReminders').addEventListener('change', (e) => {
      SH.saveSetting('medicineReminders', e.target.checked);
      SH.showToast('Medicine reminders ' + (e.target.checked ? 'enabled' : 'disabled'), 'success');
    });

    document.getElementById('emergencyAlerts').addEventListener('change', (e) => {
      SH.saveSetting('emergencyAlerts', e.target.checked);
      SH.showToast('Emergency alerts ' + (e.target.checked ? 'enabled' : 'disabled'), 'success');
    });

    // Profile visibility
    document.getElementById('profileVisibility').addEventListener('change', (e) => {
      SH.saveSetting('profileVisibility', e.target.value);
      SH.showToast('Profile visibility updated', 'success');
    });

    // Data collection
    document.getElementById('dataCollection').addEventListener('change', (e) => {
      SH.saveSetting('dataCollection', e.target.checked);
      SH.showToast('Data collection preferences updated', 'success');
    });

    // Auto backup toggle
    const autoBackupToggle = document.getElementById('autoBackup');
    if (autoBackupToggle) {
      autoBackupToggle.addEventListener('change', (e) => {
        SH.saveSetting('autoBackup', e.target.checked);
        SH.showToast('Auto-backup ' + (e.target.checked ? 'enabled' : 'disabled'), 'success');
      });
    }

    // Modal close buttons and cancel buttons using event delegation
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-close-modal]')) {
        closeAllModals();
      }
      if (e.target.closest('[data-modal-action="cancel"]')) {
        closeAllModals();
      }
    });

    // Action buttons
    document.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', handleAction);
    });
  }

  function handleAction(event) {
    const action = event.currentTarget.dataset.action;

    switch (action) {
      case 'change-email':
        handleChangeEmail();
        break;
      case 'change-password':
        handleChangePassword();
        break;
      case 'toggle-theme':
        SH.toggleTheme();
        updateThemeStatus();
        break;
      case 'setup-2fa':
        SH.showToast('Two-factor authentication setup is coming soon', 'success');
        break;
      case 'view-sessions':
        SH.showToast('Viewing active sessions...', 'success');
        break;
      case 'view-history':
        SH.showToast('Showing login history...', 'success');
        break;
      case 'export-records':
        SH.showToast('Exporting medical records as PDF...', 'success');
        break;
      case 'backup-now':
        handleBackupNow();
        break;
      case 'link-google':
        SH.showToast('Connecting to Google...', 'success');
        break;
      case 'link-apple':
        SH.showToast('Connecting to Apple...', 'success');
        break;
      case 'link-health':
        SH.showToast('Connecting to Health Tracking App...', 'success');
        break;
      case 'contact-support':
        SH.showToast('Opening support chat...', 'success');
        break;
      case 'view-faqs':
        window.open('#', '_blank');
        break;
      case 'report-bug':
        SH.showToast('Preparing bug report form...', 'success');
        break;
      case 'send-feedback':
        SH.showToast('Opening feedback form...', 'success');
        break;
      case 'view-terms':
        window.open('#', '_blank');
        break;
      case 'view-privacy':
        window.open('#', '_blank');
        break;
      case 'clear-cache':
        handleClearCache();
        break;
      case 'logout':
        handleLogout();
        break;
      case 'delete-account':
        handleDeleteAccount();
        break;
      default:
        break;
    }
  }

  function handleChangeEmail() {
    const modal = document.getElementById('emailModal');
    document.getElementById('newEmailInput').value = SH.getProfile().email || '';
    modal.classList.add('active');
  }

  function handleChangePassword() {
    const modal = document.getElementById('passwordModal');
    document.getElementById('currentPasswordInput').value = '';
    document.getElementById('newPasswordInput').value = '';
    document.getElementById('confirmPasswordInput').value = '';
    modal.classList.add('active');
  }

  function handleClearCache() {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').textContent = 'Clear Cache';
    document.getElementById('confirmMessage').textContent = 'Are you sure you want to clear all cached data? This action cannot be undone.';
    modal.classList.add('active');
  }

  function handleLogout() {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').textContent = 'Logout';
    document.getElementById('confirmMessage').textContent = 'Are you sure you want to logout?';
    modal.classList.add('active');
  }

  function handleDeleteAccount() {
    const modal = document.getElementById('deleteAccountModal');
    document.getElementById('confirmEmailInput').value = '';
    modal.classList.add('active');
  }

  function handleBackupNow() {
    SH.showToast('Backup started...', 'success');
    setTimeout(() => {
      document.getElementById('lastBackupTime').textContent = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        meridiem: 'short' 
      });
      SH.showToast('Backup completed successfully!', 'success');
    }, 2000);
  }

  function showModal(modalId, options = {}) {
    const modal = document.getElementById(modalId + 'Modal');
    if (!modal) return;

    modal.classList.add('active');

    // Clear inputs
    const inputs = modal.querySelectorAll('.modal-input');
    inputs.forEach(input => input.value = '');

    // Set up confirm button
    const confirmBtn = modal.querySelector('[data-modal-action="confirm"]');
    confirmBtn.onclick = () => {
      if (options.onConfirm) {
        options.onConfirm();
      }
    };
  }

  function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;

    modal.classList.add('active');

    const confirmBtn = modal.querySelector('[data-modal-action="confirm"]');
    confirmBtn.onclick = () => {
      if (onConfirm) {
        onConfirm();
      }
      closeAllModals();
    };
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  function updateThemeStatus() {
    const isDark = (SH.getSetting('theme') || 'light') === 'dark';
    document.getElementById('themeStatus').textContent = isDark ? 'Dark mode' : 'Light mode';
    document.getElementById('themeToggleBtn').textContent = isDark ? 'Switch to Light' : 'Switch to Dark';
  }
})();
