(function () {
  const SH = window.SmartHealth = window.SmartHealth || {};
  const API_BASE = window.MEDIX_API_BASE || resolveApiBase();

  const FALLBACK_QUOTES = [
    { content: 'Small daily habits build long-term health resilience.', author: 'Medix' },
    { content: 'Rest, hydration, movement, and consistency are still the foundations of better health.', author: 'Medix' },
    { content: 'Preventive care works best when it becomes part of your routine, not an afterthought.', author: 'Medix' },
  ];

  SH.fetchHealthQuote = async function fetchHealthQuote() {
    const response = await fetch('https://dummyjson.com/quotes/random');
    if (!response.ok) {
      throw new Error('Failed to fetch quote');
    }

    const data = await response.json();
    return {
      content: data.quote || FALLBACK_QUOTES[0].content,
      author: data.author || 'Medix',
    };
  };

  function resolveApiBase() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return window.location.port === '3000' ? '/api' : 'http://localhost:3000/api';
    }

    return '/api';
  }

  SH.apiFetch = async function apiFetch(path, options) {
    const token = localStorage.getItem('medix_auth_token');
    const config = options || {};
    const headers = {
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${path}`, {
      ...config,
      headers,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      throw new Error(data.error || `API request failed (${response.status})`);
    }
    return data;
  };

  SH.saveAuthSession = function saveAuthSession(payload) {
    if (!payload || !payload.token || !payload.user) return;
    localStorage.setItem('medix_auth_token', payload.token);
    localStorage.setItem('medix_auth_user', JSON.stringify(payload.user));
    if (SH.saveProfile) {
      const existing = SH.getProfile ? SH.getProfile() : {};
      SH.saveProfile({
        ...existing,
        name: payload.user.name,
        email: payload.user.email,
      });
    }
  };

  SH.currentAuthUser = function currentAuthUser() {
    return JSON.parse(localStorage.getItem('medix_auth_user') || 'null');
  };

  SH.clearAuthSession = function clearAuthSession() {
    localStorage.removeItem('medix_auth_token');
    localStorage.removeItem('medix_auth_user');
  };

  SH.fetchCityCoordinates = async function fetchCityCoordinates(city) {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    if (!response.ok) {
      throw new Error('Unable to geocode city');
    }

    const data = await response.json();
    const result = data && data.results && data.results[0];
    if (!result) {
      throw new Error('City not found');
    }

    return {
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country,
    };
  };

  SH.fetchWeatherAndAirQuality = async function fetchWeatherAndAirQuality(city) {
    const coordinates = await SH.fetchCityCoordinates(city);

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&timezone=auto`;
    const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&current=us_aqi,pm2_5`;

    const responses = await Promise.all([fetch(weatherUrl), fetch(airUrl)]);
    if (!responses[0].ok || !responses[1].ok) {
      throw new Error('Unable to fetch weather data');
    }

    const weatherData = await responses[0].json();
    const airData = await responses[1].json();
    const currentWeather = weatherData.current || {};
    const currentAir = airData.current || {};

    return {
      city: coordinates.name,
      country: coordinates.country,
      temperature: currentWeather.temperature_2m,
      feelsLike: currentWeather.apparent_temperature,
      wind: currentWeather.wind_speed_10m,
      uv: currentWeather.uv_index,
      weatherCode: currentWeather.weather_code,
      weatherLabel: getWeatherLabel(currentWeather.weather_code),
      aqi: currentAir.us_aqi,
      pm25: currentAir.pm2_5,
      aqiLabel: getAirQualityLabel(currentAir.us_aqi),
    };
  };

  SH.getFallbackQuote = function getFallbackQuote() {
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  };

  function getWeatherLabel(code) {
    const weatherMap = {
      0: 'Clear sky',
      1: 'Mostly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Fog',
      51: 'Light drizzle',
      53: 'Drizzle',
      55: 'Dense drizzle',
      61: 'Light rain',
      63: 'Rain',
      65: 'Heavy rain',
      71: 'Light snow',
      73: 'Snow',
      75: 'Heavy snow',
      80: 'Rain showers',
      81: 'Frequent showers',
      82: 'Heavy showers',
      95: 'Thunderstorm',
    };

    return weatherMap[code] || 'Mixed conditions';
  }

  function getAirQualityLabel(aqi) {
    if (typeof aqi !== 'number') return 'Unavailable';
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for sensitive groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very unhealthy';
    return 'Hazardous';
  }

  window.Utils = window.Utils || {
    generateId: () => SH.createId ? SH.createId('id') : `id-${Math.random().toString(36).slice(2, 9)}`,
    showToast: (message, tone) => SH.showToast ? SH.showToast(message, tone === 'error' ? 'danger' : tone) : alert(message),
    formatShortDate: (value) => SH.formatDate ? SH.formatDate(value) : new Date(value).toLocaleDateString('en-IN'),
    formatTime: (value) => SH.formatTime ? SH.formatTime(value) : value,
  };

  window.MedixAPI = window.MedixAPI || {
    getWeatherByCity: async (city) => {
      const data = await SH.fetchWeatherAndAirQuality(city);
      return {
        city: data.city,
        country: data.country,
        temperature: Math.round(data.temperature || 0),
        feelsLike: Math.round(data.feelsLike || data.temperature || 0),
        wind: Math.round(data.wind || 0),
        uv: data.uv || 0,
        label: data.weatherLabel,
      };
    },
    getCareTip: (weather) => {
      if ((weather.uv || 0) >= 7) return 'Carry water, avoid peak sun, and plan travel with sun exposure in mind.';
      if ((weather.wind || 0) >= 25) return 'Allow extra travel time and keep respiratory concerns in mind.';
      return 'Use local conditions and appointment timing when planning travel.';
    },
  };
})();
