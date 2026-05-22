/* Page script: profile.html */

(function () {

  const SH = window.SmartHealth =
    window.SmartHealth || {};

  SH.initializeProfilePage =
    function initializeProfilePage() {

    SH.initializeAppShell({
      pageId: 'profile',
      title: 'Profile',
      description:
        'Manage your personal details and emergency contact information.',
      ctaLabel: 'Go to Dashboard',
      ctaHref: 'dashboard.html',
    });

    const profile = SH.getProfile();

    const form =
      document.getElementById('profileForm');

    populateProfileForm(profile);

    updateProfileSummary(profile);

    form.addEventListener('submit', (event) => {

      event.preventDefault();

      const formData = new FormData(form);

      const data =
        Object.fromEntries(formData.entries());

      const savedProfile = {
        ...SH.getProfile(),
        ...data,
      };

      SH.saveProfile(savedProfile);

      SH.showToast(
        'Profile updated successfully.',
        'success'
      );

      populateProfileForm(savedProfile);

      updateProfileSummary(savedProfile);

    });

    function populateProfileForm(profile) {

      Object.keys(profile).forEach((key) => {

        if (form.elements[key]) {

          form.elements[key].value =
            profile[key] || '';

        }

      });

    }

  };

  function updateProfileSummary(profile) {

    const initials =
      (profile.name || 'Your Name')
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    // Avatar
    const avatar =
      document.getElementById(
        'profileAvatarLarge'
      );

    if (avatar) {
      avatar.textContent = initials;
    }

    // Name
    const name =
      document.getElementById(
        'profileName'
      );

    if (name) {
      name.textContent =
        profile.name || 'Your Name';
    }

    // Email
    const email =
      document.getElementById(
        'profileEmail'
      );

    if (email) {
      email.textContent =
        profile.email || 'email@example.com';
    }

    // Blood Group
    const blood =
      document.getElementById(
        'profileBlood'
      );

    if (blood) {
      blood.textContent =
        profile.bloodGroup || '-';
    }

    // Age
    const age =
      document.getElementById(
        'profileAge'
      );

    if (age) {
      age.textContent =
        profile.age || '-';
    }

    // City
    const city =
      document.getElementById(
        'profileCity'
      );

    if (city) {
      city.textContent =
        profile.city || '-';
    }

    // Phone
    const phone =
      document.getElementById(
        'profilePhone'
      );

    if (phone) {
      phone.textContent =
        profile.phone || '-';
    }

    // Emergency Contact
    const emergency =
      document.getElementById(
        'profileEmergency'
      );

    if (emergency) {
      emergency.textContent =
        profile.emergencyContact || '-';
    }

  }

})();