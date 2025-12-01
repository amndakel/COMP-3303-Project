// Bus Transit App - Main JavaScript
const BACKEND_URL = 'http://localhost:8001';

// Shared data
const BUS_STOPS = [
    { name: 'Downtown Terminal', lat: 44.6488, lng: -63.5752, routes: ['Route 1', 'Route 5'] },
    { name: 'Main Street', lat: 44.6490, lng: -63.5760, routes: ['Route 1'] },
    { name: 'Central Park', lat: 44.6475, lng: -63.5735, routes: ['Route 1'] },
    { name: 'Valley Station', lat: 44.6460, lng: -63.5710, routes: ['Route 1', 'Route 2'] },
    { name: 'University Ave', lat: 44.6360, lng: -63.5910, routes: ['Route 2'] },
    { name: 'Campus Entrance', lat: 44.6350, lng: -63.5890, routes: ['Route 2', 'Route 3'] },
    { name: 'Library Stop', lat: 44.6340, lng: -63.5870, routes: ['Route 2'] },
    { name: 'Harbor View', lat: 44.6600, lng: -63.5800, routes: ['Route 3'] },
    { name: 'Marina District', lat: 44.6650, lng: -63.5850, routes: ['Route 3'] },
    { name: 'Harbor Terminal', lat: 44.6700, lng: -63.5900, routes: ['Route 3', 'Route 4'] },
    { name: 'Suburban Mall', lat: 44.6800, lng: -63.6000, routes: ['Route 4'] },
    { name: 'Residential Area', lat: 44.6850, lng: -63.6050, routes: ['Route 4'] },
    { name: 'Suburban Station', lat: 44.6900, lng: -63.6100, routes: ['Route 4', 'Route 5'] },
    { name: 'City Center', lat: 44.6550, lng: -63.5750, routes: ['Route 5'] },
    { name: 'Business District', lat: 44.6500, lng: -63.5700, routes: ['Route 5'] }
];

const ROUTE_DATA = {
    'Route 1': { color: '#233962', desc: 'Downtown - Valley', first: '6:00 AM', last: '7:30 PM' },
    'Route 2': { color: '#dc3545', desc: 'Valley - Campus', first: '6:15 AM', last: '7:45 PM' },
    'Route 3': { color: '#1a7f64', desc: 'Campus - Harbor', first: '6:30 AM', last: '8:00 PM' },
    'Route 4': { color: '#d63384', desc: 'Harbor - Suburban', first: '6:45 AM', last: '8:15 PM' },
    'Route 5': { color: '#ffc107', desc: 'Suburban - Downtown', first: '7:00 AM', last: '8:30 PM' }
};

// Get route paths from stops
const getRoutePath = (routeName) => BUS_STOPS
    .filter(stop => stop.routes.includes(routeName))
    .map(stop => [stop.lat, stop.lng]);

// Map references
let trackingMap, routesMap, busMarkers = [], routePolylines = [];

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    if (window.location.pathname.includes('admin')) return;
    
    const page = window.location.pathname;
    if (page.includes('schedule')) initRouteSelection();
    else if (page.includes('bus-tracking')) initBusTracking();
    else if (page.includes('routes-stops')) initRoutesMap();
    else if (page.includes('index') || page.endsWith('/')) initServiceUpdates();
    
    initSearch();
    initNavigation();
});

// ========================================
// DARK MODE
// ========================================
function initDarkMode() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    const btn = document.getElementById('darkModeToggle');
    if (btn) {
        updateDarkModeIcon(btn, theme);
        btn.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateDarkModeIcon(btn, newTheme);
        });
    }
}

function updateDarkModeIcon(btn, theme) {
    const icon = btn.querySelector('i');
    if (!icon) return;
    icon.className = `fas fa-${theme === 'dark' ? 'sun' : 'moon'}`;
    btn.title = `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`;
}

// ========================================
// SEARCH
// ========================================
function initSearch() {
    document.querySelectorAll('.input-group').forEach(container => {
        const input = container.querySelector('input.search-input');
        const btn = container.querySelector('.search-button');
        if (!input || !btn) return;

        const dropdown = createDropdown(container);
        
        input.addEventListener('input', () => showSuggestions(input.value, dropdown, input));
        input.addEventListener('focus', () => showSuggestions(input.value, dropdown, input));
        input.addEventListener('blur', () => setTimeout(() => dropdown.style.display = 'none', 150));
        input.addEventListener('keypress', e => e.key === 'Enter' && (e.preventDefault(), btn.click()));
        btn.addEventListener('click', () => handleSearch(input.value, dropdown));
    });
}

function createDropdown(container) {
    let dropdown = container.querySelector('.search-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('ul');
        dropdown.className = 'search-dropdown list-group position-absolute w-100 mt-1 shadow-sm';
        dropdown.style.cssText = 'z-index:1060; display:none';
        container.appendChild(dropdown);
    }
    return dropdown;
}

function showSuggestions(query, dropdown, input) {
    query = query.trim().toLowerCase();
    if (!query) { dropdown.style.display = 'none'; return; }
    
    const isSchedule = window.location.pathname.includes('schedule');
    const source = isSchedule 
        ? Object.keys(ROUTE_DATA).map(r => `${r}: ${ROUTE_DATA[r].desc}`)
        : BUS_STOPS.map(s => s.name);
    
    const matches = source.filter(s => s.toLowerCase().includes(query));
    
    dropdown.innerHTML = matches.map(s => 
        `<li class="list-group-item list-group-item-action">${s}</li>`
    ).join('');
    dropdown.style.display = matches.length ? 'block' : 'none';
    
    dropdown.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
            input.value = li.textContent;
            dropdown.style.display = 'none';
            handleSearch(li.textContent, dropdown);
        });
    });
}

function handleSearch(query, dropdown) {
    if (!query.trim()) return;
    dropdown.style.display = 'none';
    
    if (window.location.pathname.includes('schedule')) {
        filterRoutes(query.toLowerCase());
    } else {
        searchAddress(query);
    }
}

function filterRoutes(query) {
    document.querySelectorAll('.route-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? 'block' : 'none';
    });
}

async function searchAddress(query) {
    try {
        const res = await fetch(`${BACKEND_URL}/index.php/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.error) return alert(data.error);
        if (data.length) showRouteSchedule(`route${data[0].route_id}`);
        else alert(`No route found for: ${query}`);
    } catch (e) {
        alert('Search error. Please try again.');
    }
}

// ========================================
// SCHEDULE
// ========================================
function initRouteSelection() {
    document.querySelectorAll('.route-card').forEach(card => {
        const link = card.closest('a');
        if (link) link.addEventListener('click', e => {
            e.preventDefault();
            showRouteSchedule(link.getAttribute('href').substring(1));
        });
    });
}

async function showRouteSchedule(routeId) {
    const routeNum = routeId.replace('route', '');
    try {
        const res = await fetch(`${BACKEND_URL}/index.php/schedule?route_id=${routeNum}`);
        const data = await res.json();
        if (data.error) return alert(data.error);
        
        showModal(data.name, `
            <h5>Departure Times:</h5>
            <ul>${data.times.map(t => `<li>${t}</li>`).join('')}</ul>
            <h5>Stops:</h5>
            <ul>${data.stops.map(s => `<li>${s}</li>`).join('')}</ul>
        `);
    } catch (e) {
        alert('Could not load schedule.');
    }
}

// ========================================
// SERVICE UPDATES (Home Page)
// ========================================
function initServiceUpdates() {
    const container = document.getElementById('serviceUpdatesContainer');
    if (!container) return;

    fetch(`${BACKEND_URL}/index.php/updates`)
        .then(r => r.json())
        .then(data => {
            if (data.error || !Array.isArray(data)) {
                container.innerHTML = '<div class="alert alert-warning"><i class="fas fa-exclamation-triangle me-2"></i>Unable to load updates.</div>';
                return;
            }
            displayUpdates(data, container);
        })
        .catch(() => {
            container.innerHTML = '<div class="alert alert-warning"><i class="fas fa-exclamation-triangle me-2"></i>Unable to load updates.</div>';
        });
}

function displayUpdates(updates, container) {
    if (!updates.length) {
        container.innerHTML = '<div class="text-center text-muted py-4"><i class="fas fa-check-circle fa-2x mb-2 text-success"></i><p>All routes running normally.</p></div>';
        return;
    }

    const getIcon = title => {
        const t = title.toLowerCase();
        if (t.includes('delay')) return ['fa-clock', 'text-danger'];
        if (t.includes('maintenance') || t.includes('construction')) return ['fa-wrench', 'text-warning'];
        if (t.includes('cancel')) return ['fa-times-circle', 'text-danger'];
        return ['fa-info-circle', 'text-info'];
    };

    container.innerHTML = updates.map((u, i) => {
        const [icon, color] = getIcon(u.title);
        const date = new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        return `
            <div class="update-item ${i < updates.length - 1 ? 'mb-3' : ''} p-4 bg-white rounded shadow-sm">
                <div class="d-flex align-items-start">
                    <div class="me-3"><i class="fas ${icon} ${color} fs-4"></i></div>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap">
                            <h5 class="mb-0 ${color}">${escapeHtml(u.title)}</h5>
                            <small class="text-muted">${date}</small>
                        </div>
                        <p class="mb-0">${escapeHtml(u.message)}</p>
                    </div>
                </div>
            </div>`;
    }).join('');
}

// ========================================
// NAVIGATION
// ========================================
function initNavigation() {
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const target = document.getElementById(link.getAttribute('href').slice(1));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
        });
    });
    
    // Active nav
    const current = window.location.pathname.split('/').pop();
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        if (link.getAttribute('href') === current) link.classList.add('active');
    });
}

// ========================================
// BUS TRACKING
// ========================================
function initBusTracking() {
    const mapEl = document.getElementById('trackingMap');
    if (!mapEl) return;

    trackingMap = L.map('trackingMap').setView([44.6488, -63.5752], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(trackingMap);
    
    BUS_STOPS.forEach(stop => {
        L.marker([stop.lat, stop.lng])
            .addTo(trackingMap)
            .bindPopup(`<b>${stop.name}</b><br>Bus Stop`);
    });

    document.getElementById('routeSelect')?.addEventListener('change', e => {
        e.target.value ? loadRouteBuses(e.target.value) : clearBuses();
    });
    document.getElementById('refreshBtn')?.addEventListener('click', () => {
        const sel = document.getElementById('routeSelect');
        if (sel?.value) loadRouteBuses(sel.value);
    });
    document.getElementById('centerBtn')?.addEventListener('click', () => {
        trackingMap?.setView([44.6488, -63.5752], 12);
    });
}

function loadRouteBuses(routeId) {
    clearBuses();
    
    const busData = {
        route1: [{ id: 'R1-001', lat: 44.6488, lng: -63.5752, status: 'On Time', next: 'Main Street' }],
        route2: [{ id: 'R2-001', lat: 44.6360, lng: -63.5910, status: 'On Time', next: 'Campus Entrance' }],
        route3: [{ id: 'R3-001', lat: 44.6600, lng: -63.5800, status: 'On Time', next: 'Marina District' }],
        route4: [{ id: 'R4-001', lat: 44.6800, lng: -63.6000, status: 'Delayed', next: 'Residential Area' }],
        route5: [{ id: 'R5-001', lat: 44.6550, lng: -63.5750, status: 'On Time', next: 'Business District' }]
    };

    const buses = busData[routeId] || [];
    buses.forEach(bus => {
        const marker = L.marker([bus.lat, bus.lng], {
            icon: L.divIcon({ className: 'bus-marker', html: '<i class="fas fa-bus"></i>', iconSize: [30, 30], iconAnchor: [15, 15] })
        }).addTo(trackingMap).bindPopup(`<b>Bus ${bus.id}</b><br>Status: ${bus.status}<br>Next: ${bus.next}`);
        busMarkers.push(marker);
    });

    // Draw route
    const routeName = 'Route ' + routeId.replace('route', '');
    const path = getRoutePath(routeName);
    if (path.length) {
        const polyline = L.polyline(path, { color: 'blue', weight: 4, opacity: 0.7 }).addTo(trackingMap);
        routePolylines.push(polyline);
    }

    // Update UI
    const list = document.getElementById('busList');
    if (list) {
        list.innerHTML = buses.map(b => `
            <div class="bus-item p-2 mb-2 border rounded">
                <div class="d-flex justify-content-between align-items-center">
                    <div><strong>Bus ${b.id}</strong><br><small class="text-muted">Next: ${b.next}</small></div>
                    <span class="badge ${b.status === 'On Time' ? 'bg-success' : 'bg-warning'}">${b.status}</span>
                </div>
            </div>`).join('');
    }
    
    const time = document.getElementById('lastUpdate');
    if (time) time.textContent = new Date().toLocaleTimeString();
}

function clearBuses() {
    busMarkers.forEach(m => trackingMap.removeLayer(m));
    routePolylines.forEach(p => trackingMap.removeLayer(p));
    busMarkers = [];
    routePolylines = [];
    const list = document.getElementById('busList');
    if (list) list.innerHTML = '';
}

// ========================================
// ROUTES MAP
// ========================================
function initRoutesMap() {
    const mapEl = document.getElementById('routesMap');
    if (!mapEl) return;

    routesMap = L.map('routesMap').setView([44.6488, -63.5752], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(routesMap);
    
    window.routeLayers = {};

    // Add routes
    Object.entries(ROUTE_DATA).forEach(([name, data]) => {
        const path = getRoutePath(name);
        if (!path.length) return;
        
        const polyline = L.polyline(path, { color: data.color, weight: 4, opacity: 0.8 }).addTo(routesMap);
        const mid = path[Math.floor(path.length / 2)];
        const marker = L.marker(mid, {
            icon: L.divIcon({
                className: 'route-number-marker',
                html: `<div class="route-number-circle" style="background:${data.color}">${name.split(' ')[1]}</div>`,
                iconSize: [30, 30], iconAnchor: [15, 15]
            })
        }).addTo(routesMap).on('click', () => showRouteInfo(name));
        
        window.routeLayers[name] = { polyline, marker };
    });

    // Add stops
    BUS_STOPS.forEach(stop => {
        L.marker([stop.lat, stop.lng], {
            icon: L.divIcon({ className: 'bus-stop-marker', html: '<i class="fas fa-map-marker-alt"></i>', iconSize: [20, 20], iconAnchor: [10, 20] })
        }).addTo(routesMap).bindPopup(`<b>${stop.name}</b><br>Routes: ${stop.routes.join(', ')}`);
    });

    // Route links
    document.querySelectorAll('.route-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            highlightRoute(link.dataset.route);
        });
    });

    document.getElementById('centerRoutesBtn')?.addEventListener('click', () => routesMap?.setView([44.6488, -63.5752], 11));
    document.getElementById('refreshRoutesBtn')?.addEventListener('click', () => {
        const el = document.getElementById('routesLastUpdate');
        if (el) el.textContent = new Date().toLocaleTimeString();
    });
}

function highlightRoute(name) {
    if (!window.routeLayers?.[name]) return;
    
    Object.values(window.routeLayers).forEach(l => l.polyline.setStyle({ opacity: 0.8, weight: 4 }));
    const layer = window.routeLayers[name];
    layer.polyline.setStyle({ opacity: 1, weight: 6 });
    routesMap.fitBounds(layer.polyline.getBounds(), { padding: [20, 20] });
    showRouteInfo(name);
}

function showRouteInfo(name) {
    const panel = document.getElementById('routeDetails');
    if (!panel || !ROUTE_DATA[name]) return;
    
    const data = ROUTE_DATA[name];
    const stops = BUS_STOPS.filter(s => s.routes.includes(name)).map(s => s.name);
    
    panel.innerHTML = `
        <div class="route-info">
            <h6 class="mb-2">${name}: ${data.desc}</h6>
            <p class="mb-2"><strong>Frequency:</strong> Every 30 minutes</p>
            <p class="mb-2"><strong>Hours:</strong> ${data.first} - ${data.last}</p>
            <p class="mb-1"><strong>Stops:</strong></p>
            <ul class="mb-0 small">${stops.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>`;
}

// ========================================
// UTILITIES
// ========================================
function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">${content}</div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
