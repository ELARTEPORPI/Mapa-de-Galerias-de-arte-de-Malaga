// Variables globales
let currentLang = 'es';
let userMarker = null;

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

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map').setView([36.7213, -4.4214], 13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors & CartoDB',
    maxZoom: 19,
  }).addTo(map);

  const toggleBtn = document.getElementById('toggle-language');
  const gallerySelectLabel = document.querySelector('label[for="gallery-select"]');
  const gallerySelect = document.getElementById('gallery-select');
  const lastUpdateDiv = document.getElementById('update-date');

  // Función para actualizar textos estáticos
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

  // Inicializar textos
  updateStaticTexts();

  // Cargar galerías y crear marcadores
  fetch('galerias.json')
    .then(response => response.json())
    .then(galerias => {
      const markers = [];

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
         // Sincronizar idioma de la descripción en el popup abierto
    const popupEl = markers[idx].getPopup().getElement();
    if (popupEl) {
      popupEl.querySelectorAll('.popup-es').forEach(el => {
        el.style.display = currentLang === 'es' ? '' : 'none';
      });
      popupEl.querySelectorAll('.popup-en').forEach(el => {
        el.style.display = currentLang === 'en' ? '' : 'none';
      });
    }
      });
    })
    .catch(error => console.error('Error cargando galerías:', error));

  // Mostrar ubicación del usuario
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

  // Cambiar idioma al hacer clic en el botón
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
});
