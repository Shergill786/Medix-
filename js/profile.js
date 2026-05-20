(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};

  SH.initializeProfilePage = function initializeProfilePage() {
    SH.initializeAppShell({
      pageId: 'profile',
      title: 'Profile',
      description: 'Manage your personal details and emergency contact information.',
      ctaLabel: 'Go to Dashboard',
      ctaHref: 'dashboard.html',
    });

    const profile = SH.getProfile();
    const form = document.getElementById('profileForm');

    // Populate form with existing data
    Object.keys(profile).forEach((key) => {
      if (form.elements[key]) {
        form.elements[key].value = profile[key];
      }
    });

    // Update profile summary card
    updateProfileSummary(profile);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      SH.saveProfile(data);
      SH.showToast('Profile updated successfully.', 'success');
      updateProfileSummary(data);
    });
  };

  function updateProfileSummary(profile) {
    const initials = profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
    
    document.getElementById('profileAvatarLarge').textContent = initials;
    document.getElementById('profileName').textContent = profile.name || 'Your Name';
    document.getElementById('profileEmail').textContent = profile.email || 'email@example.com';
    document.getElementById('profileBlood').textContent = profile.bloodGroup || '-';
    document.getElementById('profileCity').textContent = profile.city || '-';
    document.getElementById('profilePhone').textContent = profile.phone || '-';
    document.getElementById('profileEmergency').textContent = profile.emergencyContact || '-';
  }
})();
