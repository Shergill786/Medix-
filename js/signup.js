(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');
    if (!form) return;

    const fullname = document.getElementById('fullname');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const terms = document.getElementById('terms');
    const submit = document.getElementById('submitBtn');
    const alert = document.getElementById('formAlert');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      clearAlert();

      const nameValue = fullname.value.trim();
      const emailValue = email.value.trim().toLowerCase();
      const passwordValue = password.value;

      if (!nameValue || !emailValue || passwordValue.length < 6) {
        showAlert('Name, email, and a 6+ character password are required.', 'error');
        return;
      }
      if (passwordValue !== confirmPassword.value) {
        showAlert('Passwords do not match.', 'error');
        return;
      }
      if (!terms.checked) {
        showAlert('Please accept the terms before continuing.', 'error');
        return;
      }

      const users = JSON.parse(localStorage.getItem('medix_registered_users') || '[]');
      if (users.some((user) => user.email.toLowerCase() === emailValue)) {
        showAlert('This email is already registered. Please sign in.', 'error');
        return;
      }

      setLoading(true);
      window.setTimeout(() => {
        const user = {
          id: `user-${Math.random().toString(36).slice(2, 10)}`,
          name: nameValue,
          email: emailValue,
          password: passwordValue,
          role: 'Patient',
          createdAt: new Date().toISOString(),
        };

        users.unshift(user);
        localStorage.setItem('medix_registered_users', JSON.stringify(users));

        const sessionUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
        localStorage.setItem('medix_auth_token', `local-${Date.now()}`);
        localStorage.setItem('medix_auth_user', JSON.stringify(sessionUser));
        localStorage.setItem('user', JSON.stringify(sessionUser));

        if (SH.saveProfile) {
          SH.saveProfile({
            ...(SH.getProfile ? SH.getProfile() : {}),
            name: sessionUser.name,
            email: sessionUser.email,
          });
        }

        showAlert('Account created locally. Redirecting...', 'success');
        window.setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 450);
      }, 250);
    });

    function setLoading(loading) {
      submit.disabled = loading;
      submit.textContent = loading ? 'Creating account...' : 'Create Account';
    }

    function showAlert(message, tone) {
      alert.className = `alert alert-${tone}`;
      alert.textContent = message;
      alert.style.display = 'block';
    }

    function clearAlert() {
      alert.textContent = '';
      alert.style.display = 'none';
    }
  });
})();
