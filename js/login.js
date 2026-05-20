(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};

  const DEMO_USER = {
    id: 'user-demo',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    password: 'password123',
    role: 'Patient',
  };

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (!form) return;

    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const remember = document.getElementById('remember');
    const submit = document.getElementById('submitBtn');
    const alert = document.getElementById('formAlert');

    const remembered = localStorage.getItem('medix_remember_email');
    if (remembered) {
      email.value = remembered;
      if (remember) remember.checked = true;
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      clearAlert();

      const emailValue = email.value.trim().toLowerCase();
      const passwordValue = password.value;

      if (!emailValue || !passwordValue) {
        showAlert('Enter your email and password.', 'error');
        return;
      }

      setLoading(true);
      const users = getUsers();
      const user = users.find((entry) => entry.email.toLowerCase() === emailValue && entry.password === passwordValue);

      window.setTimeout(() => {
        if (!user) {
          setLoading(false);
          showAlert('Invalid email or password. Try the demo credentials or create an account.', 'error');
          return;
        }

        const sessionUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'Patient',
        };

        localStorage.setItem('medix_auth_token', `local-${Date.now()}`);
        localStorage.setItem('medix_auth_user', JSON.stringify(sessionUser));
        localStorage.setItem('user', JSON.stringify(sessionUser));

        if (remember && remember.checked) localStorage.setItem('medix_remember_email', user.email);
        else localStorage.removeItem('medix_remember_email');

        if (SH.saveProfile) {
          SH.saveProfile({
            ...(SH.getProfile ? SH.getProfile() : {}),
            name: sessionUser.name,
            email: sessionUser.email,
          });
        }

        showAlert('Login successful. Redirecting...', 'success');
        window.setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 450);
      }, 250);
    });

    function getUsers() {
      const stored = JSON.parse(localStorage.getItem('medix_registered_users') || '[]');
      const hasDemo = stored.some((user) => user.email.toLowerCase() === DEMO_USER.email);
      return hasDemo ? stored : [DEMO_USER, ...stored];
    }

    function setLoading(loading) {
      submit.disabled = loading;
      submit.textContent = loading ? 'Signing in...' : 'Sign In';
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
