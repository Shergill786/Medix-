document.addEventListener('DOMContentLoaded', () => {
  const appointments = DataAPI.getAppointments().slice(0, 3);
  const container = document.getElementById('homeAppointments');
  const form = document.getElementById('homeSearchForm');
  const input = document.getElementById('heroSearch');

  if (container) {
    container.innerHTML = appointments
      .map((appointment) => `
        <div class="data-item">
          <div>
            <strong>${appointment.doctor}</strong>
            <p class="text-secondary">${appointment.specialty} at ${appointment.hospital}</p>
          </div>
          <span class="badge badge-primary">${Utils.formatShortDate(appointment.date)} • ${Utils.formatTime(appointment.time)}</span>
        </div>
      `)
      .join('');
  }

  if (form && input) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = input.value.trim();
      window.location.href = query ? `all_hospitals.html?q=${encodeURIComponent(query)}` : 'all_hospitals.html';
    });
  }

  setupWeatherWidget();
});

function setupWeatherWidget() {
  const citySelect = document.getElementById('weatherCity');
  const refresh = document.getElementById('refreshWeather');
  if (!citySelect || !refresh || typeof MedixAPI === 'undefined') return;

  const load = async () => {
    const city = citySelect.value;
    try {
      const weather = await MedixAPI.getWeatherByCity(city);
      document.getElementById('weatherTemp').textContent = `${weather.temperature}°`;
      document.getElementById('weatherLabel').textContent = `${weather.city}: ${weather.label}`;
      document.getElementById('weatherMeta').textContent = `Feels like ${weather.feelsLike}°, ${weather.country}`;
      document.getElementById('weatherFeels').textContent = `Feels like ${weather.feelsLike}°`;
      document.getElementById('weatherWind').textContent = `Wind ${weather.wind} km/h`;
      document.getElementById('weatherUv').textContent = `UV ${weather.uv}`;
      document.getElementById('weatherTip').textContent = MedixAPI.getCareTip(weather);
    } catch {
      document.getElementById('weatherLabel').textContent = 'Live conditions unavailable';
      document.getElementById('weatherMeta').textContent = 'Please try again in a moment.';
      document.getElementById('weatherTip').textContent = 'Use local conditions and appointment timing when planning travel.';
    }
  };

  refresh.addEventListener('click', load);
  citySelect.addEventListener('change', load);
  load();
}
