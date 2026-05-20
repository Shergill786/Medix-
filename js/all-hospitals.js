document.addEventListener('DOMContentLoaded', () => {
  const search = document.getElementById('directorySearch');
  const city = document.getElementById('directoryCity');
  const clear = document.getElementById('clearHospitalFilters');
  const chips = document.querySelectorAll('#hospitalTypeFilters .chip-btn');

  const params = new URLSearchParams(window.location.search);
  if (search && params.get('q')) search.value = params.get('q');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((item) => item.classList.remove('active'));
      chip.classList.add('active');
      renderHospitals();
    });
  });

  [search, city].forEach((element) => {
    if (!element) return;
    element.addEventListener('input', renderHospitals);
    element.addEventListener('change', renderHospitals);
  });

  if (clear && search && city) {
    clear.addEventListener('click', () => {
      search.value = '';
      city.value = '';
      chips.forEach((item, index) => item.classList.toggle('active', index === 0));
      renderHospitals();
    });
  }

  renderHospitals();
});

function renderHospitals() {
  const search = document.getElementById('directorySearch');
  const city = document.getElementById('directoryCity');
  const active = document.querySelector('#hospitalTypeFilters .chip-btn.active');
  const count = document.getElementById('hospitalCount');
  const results = document.getElementById('hospitalResults');
  if (!results) return;

  const query = search ? search.value.trim().toLowerCase() : '';
  const cityFilter = city ? city.value : '';
  const typeFilter = active ? active.dataset.filter : 'all';

  const filtered = DataAPI.getHospitals().filter((hospital) => {
    const haystack = `${hospital.name} ${hospital.city} ${hospital.specialties.join(' ')} ${hospital.summary}`.toLowerCase();
    const matchQuery = !query || haystack.includes(query);
    const matchCity = !cityFilter || hospital.city === cityFilter;
    const matchType =
      typeFilter === 'all' ||
      hospital.type === typeFilter ||
      hospital.specialties.includes(typeFilter);
    return matchQuery && matchCity && matchType;
  });

  const grouped = filtered.reduce((acc, hospital) => {
    if (!acc[hospital.city]) acc[hospital.city] = [];
    acc[hospital.city].push(hospital);
    return acc;
  }, {});

  const cities = Object.keys(grouped).sort();
  const specialistCount = DataAPI.getDoctors().filter((doctor) =>
    filtered.some((hospital) => hospital.id === doctor.hospitalId)
  ).length;

  count.textContent = `${filtered.length} hospitals across ${cities.length} cities with ${specialistCount} listed specialists`;

  results.innerHTML = cities.length
    ? cities
        .map((cityName) => `
          <section class="city-group">
            <div class="city-group-head">
              <div>
                <h3 class="h2">${cityName}</h3>
                <p class="text-secondary">${grouped[cityName].length} hospitals available in this city</p>
              </div>
              <a class="btn btn-outline-primary btn-sm" href="hospitals.html?city=${encodeURIComponent(cityName)}">Open city page</a>
            </div>
            <div class="city-group-grid">
              ${grouped[cityName].map(renderHospitalCard).join('')}
            </div>
          </section>
        `)
        .join('')
    : `<div class="directory-intro-card"><h3 class="h3">No hospitals found</h3><p class="text-secondary">Try clearing filters or searching with a broader city or specialty term.</p></div>`;
}

function renderHospitalCard(hospital) {
  const doctors = DataAPI.getDoctors().filter((doctor) => doctor.hospitalId === hospital.id).slice(0, 3);

  return `
    <article class="hospital-card">
      <div class="hospital-card-head">
        <div>
          <h3 class="h3">${hospital.name}</h3>
          <p>${hospital.address}</p>
        </div>
        <span class="badge badge-primary">${hospital.rating} rating</span>
      </div>
      <p class="hospital-card-summary">${hospital.summary}</p>
      <div class="hospital-card-meta">
        <span class="pill">${hospital.type}</span>
        <span class="pill">${hospital.beds} beds</span>
        <span class="pill">${hospital.eta}</span>
        <span class="pill">${doctors.length} doctors</span>
      </div>
      <div class="hospital-card-meta">
        ${hospital.specialties.map((specialty) => `<span class="pill">${specialty}</span>`).join('')}
      </div>
      <div class="hospital-card-meta">
        <strong>Doctors</strong>
        <span class="text-secondary">${doctors.map((doctor) => doctor.name).join(', ') || 'Doctor roster coming soon'}</span>
      </div>
      <div class="hospital-card-actions">
        <span class="text-secondary">${hospital.phone}</span>
        <div class="detail-actions">
          <a class="btn btn-outline btn-sm" href="hospitals.html?hospital=${encodeURIComponent(hospital.id)}">Hospital page</a>
          <a class="btn btn-outline-primary btn-sm" href="appointments.html?hospital=${encodeURIComponent(hospital.id)}">View doctors</a>
        </div>
      </div>
    </article>
  `;
}
