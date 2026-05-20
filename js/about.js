const initializeAboutPage = () => {
  if (document.body.dataset.page !== 'about' || !window.SmartHealth) return;

  window.SmartHealth.initializeAppShell({
    pageId: 'about',
    title: 'About Us',
    description: 'Learn how Medix connects hospitals, specialists, reminders, records, and emergency support in one calm patient experience.',
    ctaLabel: 'Open portal',
    ctaHref: 'dashboard.html',
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAboutPage);
} else {
  initializeAboutPage();
}
