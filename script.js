document.addEventListener("DOMContentLoaded", function () {
    const secciones = document.querySelectorAll(".seccion");

    const mostrarSecciones = () => {
        secciones.forEach((seccion) => {
            const rect = seccion.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.75) {
                seccion.classList.add("visible");
            }
        });
    };

    window.addEventListener("scroll", mostrarSecciones);
    mostrarSecciones();
});

// Configuración de Spotify
const CLIENT_ID = 'daa2b236d682427bbde3415200257bf8';
const CLIENT_SECRET = 'b67c3359cd5645cf8a845d3ff8849da8';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_URL = 'https://api.spotify.com/v1/me/top/artists?limit=10'; // Cambia a /top/tracks si quieres canciones

// ======== FUNCIONES PRINCIPALES ======== //

// 1. Verifica si hay un token en la URL (callback de Spotify)
function checkTokenInUrl() {
    if (window.location.hash.includes('access_token')) {
        const token = window.location.hash.split('=')[1].split('&')[0];
        localStorage.setItem('spotify_token', token);
        window.history.pushState({}, document.title, window.location.pathname); // Limpia la URL
        return token;
    }
    return null;
}

// 2. Obtiene datos de la API de Spotify (artistas o tracks)
async function fetchSpotifyData(token, type = 'artists') {
    const API_URL = `https://api.spotify.com/v1/me/top/${type}?limit=10&time_range=short_term`;
    
    try {
        const response = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// 3. Renderiza el slider con los datos
function renderSlider(items) {
    const sliderTrack = document.getElementById('slider-track');
    sliderTrack.innerHTML = ''; // Limpia el contenedor

    items.forEach(item => {
        const sliderItem = document.createElement('div');
        sliderItem.className = 'slider-item';
        sliderItem.innerHTML = `
            <img src="${item.images[0].url}" alt="${item.name}" class="slider-img">
            <h3>${item.name}</h3>
            <p>${item.genres.slice(0, 2).join(', ')}</p>
        `;
        sliderTrack.appendChild(sliderItem);
    });

    // Configura los botones de navegación
    let currentPosition = 0;
    const trackWidth = 220; // Ancho de cada item + gap

    document.querySelector('.next').addEventListener('click', () => {
        if (currentPosition > -((items.length - 3) * trackWidth)) {
            currentPosition -= trackWidth;
            sliderTrack.style.transform = `translateX(${currentPosition}px)`;
        }
    });

    document.querySelector('.prev').addEventListener('click', () => {
        if (currentPosition < 0) {
            currentPosition += trackWidth;
            sliderTrack.style.transform = `translateX(${currentPosition}px)`;
        }
    });
}

// 4. Inicializa la aplicación
async function initApp() {
    // Paso 1: Verifica si ya hay un token válido
    let token = localStorage.getItem('spotify_token') || checkTokenInUrl();

    if (!token) {
        // Si no hay token, redirige a Spotify para login
        window.location = AUTH_URL;
        return;
    }

    // Paso 2: Obtiene datos de la API
    const data = await fetchSpotifyData(token, 'artists'); // Cambia a 'tracks' si quieres canciones

    if (data && data.items) {
        renderSlider(data.items);
    } else {
        console.error('No se pudieron obtener los datos');
        document.getElementById('slider-track').innerHTML = `
            <p class="error">Error al cargar los datos. <a href="${AUTH_URL}">Intenta de nuevo</a></p>
        `;
    }
}

// ======== EJECUCIÓN AL CARGAR LA PÁGINA ======== //
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializa si estamos en la sección de música
    if (window.location.hash === '#musica' || document.getElementById('musica')) {
        initApp();
    }

    // Tu código existente para las animaciones de secciones
    const secciones = document.querySelectorAll(".seccion");
    const mostrarSecciones = () => {
        secciones.forEach((seccion) => {
            const rect = seccion.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.75) {
                seccion.classList.add("visible");
            }
        });
    };
    window.addEventListener("scroll", mostrarSecciones);
    mostrarSecciones();
});