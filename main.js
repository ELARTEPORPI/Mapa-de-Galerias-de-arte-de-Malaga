
<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
function initMap() {
  // Crear mapa y capa base
  const map = L.map('map').setView([36.7213, -4.4214], 13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors & CartoDB',
    maxZoom: 19,
  }).addTo(map);
}
  // Textos para los idiomas
  const texts = {
    es: {
      selectLabel: "Selecciona una galería:",
      selectOption: "-- Elige una galería --",
      lastUpdate: "Última actualización:",
      locale: "es-ES"
    },
    en: {
      selectLabel: "Select a gallery:",
      selectOption: "-- Choose a gallery --",
      lastUpdate: "Last update:",
      locale: "en-US"
    }
  };

  let currentLang = 'es';  // Define idioma por defecto

  // ⚠️ Asegúrate de que estas referencias existan antes de usarlas
  const toggleBtn = document.getElementById('toggle-language');
  const gallerySelectLabel = document.querySelector('label[for="gallery-select"]');
  const gallerySelect = document.getElementById('gallery-select');
  const lastUpdateDiv = document.getElementById('update-date');

  function updateStaticTexts() {
  // tu función para actualizar textos estáticos
}
  // Actualizar textos estáticos
  function updateStaticTexts() {
    const t = texts[currentLang];
    gallerySelectLabel.textContent = t.selectLabel;

    if (gallerySelect.options.length > 0) {
      gallerySelect.options[0].textContent = t.selectOption;
    }

    const fecha = new Date();
    const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = fecha.toLocaleDateString(t.locale, opcionesFecha);

    lastUpdateDiv.innerHTML = `${t.lastUpdate} <span id="last-update">${fechaFormateada}</span>`;
  }

function setupLanguageToggle() {
  // todo lo relacionado con toggleBtn y cambio idioma
}
toggleBtn.addEventListener('click', () => {
  currentLang = currentLang === 'es' ? 'en' : 'es';

  document.querySelectorAll('.popup-es').forEach(el => {
    el.style.display = currentLang === 'es' ? '' : 'none';
  });

  document.querySelectorAll('.popup-en').forEach(el => {
    el.style.display = currentLang === 'en' ? '' : 'none';
  });

  toggleBtn.textContent = currentLang === 'es' ? 'EN' : 'ES';

  updateStaticTexts();

  if (userMarker) {
    userMarker.setPopupContent(currentLang === 'es' ? "Tu ubicación" : "Your location");
  }
});





function loadGalleries() {
fetch('galerias.json')
  .then(response => response.json())
  .then(galerias => {
    const markers = [];

    const gallerySelect = document.getElementById('gallery-select');
    const toggleBtn = document.getElementById('toggle-language');

    galerias.forEach((galeria, index) => {
      const marker = L.marker([galeria.lat, galeria.lng]).addTo(map);
      marker.bindPopup(`
        <b>${galeria.nombre}</b><br>
        <span class="popup-es">${galeria.descripcion_es}</span>
        <span class="popup-en" style="display:none;">${galeria.descripcion_en}</span>
      `);
      markers.push(marker);

      const option = document.createElement('option');
      option.value = index;
      option.textContent = galeria.nombre;
      gallerySelect.appendChild(option);
    });

    gallerySelect.addEventListener('change', () => {
      const idx = gallerySelect.value;
      if (idx !== '') {
        markers[idx].openPopup();
        map.setView(markers[idx].getLatLng(), 16);
      }
    });

  })
  .catch(error => console.error('Error cargando galerías:', error));
}
let userMarker = null;

function showUserLocation() {
}
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(position => {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    userMarker = L.circleMarker([userLat, userLng], {
      radius: 8,
      fillColor: "#3388ff",
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(map).bindPopup(currentLang === 'es' ? "Tu ubicación" : "Your location");

    map.setView([userLat, userLng], 14);
  }, error => {
    console.log("No se pudo obtener la ubicación: ", error.message);
  });
} else {
  console.log("Geolocalización no está disponible en este navegador.");
}
// Ejecutar todo al cargar
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  updateStaticTexts();
  loadGalleries();
  setupLanguageToggle();
  showUserLocation();
});