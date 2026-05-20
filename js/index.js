(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};

  SH.initializeLandingPage = function initializeLandingPage() {
    SH.seedStorage();
    SH.applyTheme();
    SH.renderChatbot();
    SH.renderQuote('landingQuote', {
      errorMessage: 'The daily wellness quote is unavailable right now.',
    });
  };
})();
