// Main JavaScript for Regional Bus Transit Website

// Global variables for bus tracking
let trackingMap;
let busMarkers = [];
let routePolylines = [];

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionalities
    initSearch();
    initRouteSelection();
    initServiceUpdates();
    initNavigation();
    initGeneralEvents();
    initBusTracking();
    initRoutesMap();
});

// Search Functionality
function initSearch() {
    const searchInputs = document.querySelectorAll('input[type="text"]');
    searchInputs.forEach(input => {
        const searchButton = input.nextElementSibling;
        const container = input.parentElement;
        let dropdown = container.querySelector('.search-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('ul');
            dropdown.className = 'search-dropdown list-group position-absolute w-100 mt-1 shadow-sm';
            dropdown.style.zIndex = '1060'; // Higher than navbar
            dropdown.style.display = 'none';
            container.appendChild(dropdown);
        }

        // Input event for suggestions
        input.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            if (query.length > 0) {
                showSuggestions(query, dropdown, input);
            } else {
                dropdown.style.display = 'none';
            }
        });

        // Hide dropdown on focus out
        input.addEventListener('blur', function() {
            setTimeout(() => dropdown.style.display = 'none', 150); // Delay to allow click on dropdown
        });

        // Show dropdown on focus if has value
        input.addEventListener('focus', function() {
            const query = this.value.trim().toLowerCase();
            if (query.length > 0) {
                showSuggestions(query, dropdown, input);
            }
        });

        searchButton.addEventListener('click', function() {
            const query = input.value.trim().toLowerCase();
            if (query) {
                // Trigger search based on page
                if (window.location.pathname.includes('schedule.html')) {
                    filterRoutes(query);
                } else {
                    searchAddress(query);
                }
                dropdown.style.display = 'none';
            }
        });

        // Allow Enter key to trigger search as positive confirmation
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission if any
                searchButton.click();
            }
        });
    });
}

// Show Suggestions in Dropdown
function showSuggestions(query, dropdown, input) {
    dropdown.innerHTML = '';
    let suggestions = [];

    if (window.location.pathname.includes('schedule.html')) {
        // Route suggestions
        const routes = ['Route 1: Downtown - Valley', 'Route 2: Valley - Campus', 'Route 3: Campus - Harbor', 'Route 4: Harbor - Suburban', 'Route 5: Suburban - Downtown'];
        suggestions = routes.filter(route => route.toLowerCase().includes(query));
    } else {
        // Address suggestions
        const addresses = ['Downtown Terminal', 'Main Street', 'Central Park', 'Valley Station', 'University Ave', 'Campus Entrance', 'Library Stop', 'Harbor View', 'Marina District', 'Harbor Terminal', 'Suburban Mall', 'Residential Area', 'Suburban Station', 'City Center', 'Business District'];
        suggestions = addresses.filter(addr => addr.toLowerCase().includes(query));
    }

    if (suggestions.length > 0) {
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.className = 'list-group-item list-group-item-action';
            li.textContent = suggestion;
            li.addEventListener('click', function() {
                input.value = suggestion;
                dropdown.style.display = 'none';
                // Optionally trigger search
                const searchButton = input.nextElementSibling;
                if (searchButton) searchButton.click();
            });
            dropdown.appendChild(li);
        });
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
}

// Filter Routes on Schedule Page
function filterRoutes(query) {
    const routeCards = document.querySelectorAll('.route-card');
    routeCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        if (title.includes(query) || description.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Route Selection on Schedule Page
function initRouteSelection() {
    if (!window.location.pathname.includes('schedule.html')) return;

    const routeCards = document.querySelectorAll('.route-card');
    routeCards.forEach(card => {
        const link = card.closest('a');
        if (link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const routeId = this.getAttribute('href').substring(1); // e.g., 'route1'
                showRouteSchedule(routeId);
            });
        }
    });
}

// Show Route Schedule (Static Data for Demo)
function showRouteSchedule(routeId) {
    const schedules = {
        route1: {
            name: 'Route 1: Downtown - Valley',
            times: ['6:00 AM', '7:30 AM', '9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM', '6:00 PM', '7:30 PM'],
            stops: ['Downtown Terminal', 'Main Street', 'Central Park', 'Valley Station']
        },
        route2: {
            name: 'Route 2: Valley - Campus',
            times: ['6:15 AM', '7:45 AM', '9:15 AM', '10:45 AM', '12:15 PM', '1:45 PM', '3:15 PM', '4:45 PM', '6:15 PM', '7:45 PM'],
            stops: ['Valley Station', 'University Ave', 'Campus Entrance', 'Library Stop']
        },
        route3: {
            name: 'Route 3: Campus - Harbor',
            times: ['6:30 AM', '8:00 AM', '9:30 AM', '11:00 AM', '12:30 PM', '2:00 PM', '3:30 PM', '5:00 PM', '6:30 PM', '8:00 PM'],
            stops: ['Campus Entrance', 'Harbor View', 'Marina District', 'Harbor Terminal']
        },
        route4: {
            name: 'Route 4: Harbor - Suburban',
            times: ['6:45 AM', '8:15 AM', '9:45 AM', '11:15 AM', '12:45 PM', '2:15 PM', '3:45 PM', '5:15 PM', '6:45 PM', '8:15 PM'],
            stops: ['Harbor Terminal', 'Suburban Mall', 'Residential Area', 'Suburban Station']
        },
        route5: {
            name: 'Route 5: Suburban - Downtown',
            times: ['7:00 AM', '8:30 AM', '10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM', '7:00 PM', '8:30 PM'],
            stops: ['Suburban Station', 'City Center', 'Business District', 'Downtown Terminal']
        }
    };

    const schedule = schedules[routeId];
    if (schedule) {
        let content = `<h4>${schedule.name}</h4><h5>Departure Times:</h5><ul>`;
        schedule.times.forEach(time => {
            content += `<li>${time}</li>`;
        });
        content += `</ul><h5>Stops:</h5><ul>`;
        schedule.stops.forEach(stop => {
            content += `<li>${stop}</li>`;
        });
        content += `</ul>`;

        // Display in a modal or alert for simplicity
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${schedule.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">${content}</div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        modal.addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(modal);
        });
    }
}

// Service Updates Toggle on Index Page
function initServiceUpdates() {
    if (!window.location.pathname.includes('index.html')) return;

    const updateItems = document.querySelectorAll('.update-item');
    updateItems.forEach(item => {
        item.addEventListener('click', function() {
            // Toggle visibility or expand details
            const details = this.querySelector('p');
            if (details.style.display === 'none' || details.style.display === '') {
                details.style.display = 'block';
            } else {
                details.style.display = 'none';
            }
        });
    });
}

// Navigation Enhancements
function initNavigation() {
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Highlight active navigation item
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

// Search Address Functionality (for index.html) - Fetch from API
async function searchAddress(query) {
    try {
        const response = await fetch(`../backend/index.php/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();

        if (results.error) {
            alert(results.error);
            return;
        }

        if (results.length > 0) {
            // Use the first result's route_id
            const routeId = results[0].route_id;
            showRouteSchedule(routeId);
        } else {
            alert(`No route found for address: ${query}. Try searching for stops like "Downtown Terminal" or "Campus Entrance".`);
        }
    } catch (error) {
        console.error('Error searching address:', error);
        alert('Error searching. Please try again.');
    }
}

// General Event Listeners
function initGeneralEvents() {
    // Handle service card clicks
    const serviceCards = document.querySelectorAll('.service-card a');
    serviceCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Prevent default if needed, or add analytics/logging
            console.log('Service card clicked:', this.textContent.trim());
        });
    });

    // Handle route list clicks on routes-stops.html
    const routeLinks = document.querySelectorAll('.list-group-item-action');
    routeLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const routeName = this.querySelector('.route-name').textContent;
            const routeDesc = this.querySelector('small').textContent;
            showRouteDetails(routeName, routeDesc);
        });
    });

    // Add any form submissions if present
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Form submitted! (Demo)');
        });
    });
}

// Show Route Details (for routes-stops.html)
function showRouteDetails(routeName, routeDesc) {
    const routeDetails = {
        'Route 1': {
            stops: ['Downtown Terminal', 'Main Street', 'Central Park', 'Valley Station'],
            times: ['6:00 AM', '7:30 AM', '9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM', '6:00 PM', '7:30 PM']
        },
        'Route 2': {
            stops: ['Valley Station', 'University Ave', 'Campus Entrance', 'Library Stop'],
            times: ['6:15 AM', '7:45 AM', '9:15 AM', '10:45 AM', '12:15 PM', '1:45 PM', '3:15 PM', '4:45 PM', '6:15 PM', '7:45 PM']
        },
        'Route 3': {
            stops: ['Campus Entrance', 'Harbor View', 'Marina District', 'Harbor Terminal'],
            times: ['6:30 AM', '8:00 AM', '9:30 AM', '11:00 AM', '12:30 PM', '2:00 PM', '3:30 PM', '5:00 PM', '6:30 PM', '8:00 PM']
        },
        'Route 4': {
            stops: ['Harbor Terminal', 'Suburban Mall', 'Residential Area', 'Suburban Station'],
            times: ['6:45 AM', '8:15 AM', '9:45 AM', '11:15 AM', '12:45 PM', '2:15 PM', '3:45 PM', '5:15 PM', '6:45 PM', '8:15 PM']
        },
        'Route 5': {
            stops: ['Suburban Station', 'City Center', 'Business District', 'Downtown Terminal'],
            times: ['7:00 AM', '8:30 AM', '10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM', '7:00 PM', '8:30 PM']
        }
    };

    const details = routeDetails[routeName];
    if (details) {
        let content = `<h4>${routeName}: ${routeDesc}</h4><h5>Stops:</h5><ul>`;
        details.stops.forEach(stop => {
            content += `<li>${stop}</li>`;
        });
        content += `</ul><h5>Departure Times:</h5><ul>`;
        details.times.forEach(time => {
            content += `<li>${time}</li>`;
        });
        content += `</ul>`;

        // Display in a modal
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${routeName} Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">${content}</div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        modal.addEventListener('hidden.bs.modal', function() {
            document.body.removeChild(modal);
        });
    }
}

// Bus Tracking Functionality
function initBusTracking() {
    if (!window.location.pathname.includes('bus-tracking.html')) return;

    // Initialize map
    initMap();

    // Set up route selection
    const routeSelect = document.getElementById('routeSelect');
    if (routeSelect) {
        routeSelect.addEventListener('change', function() {
            const routeId = this.value;
            if (routeId) {
                loadRouteBuses(routeId);
            } else {
                clearBuses();
            }
        });
    }

    // Set up refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const routeId = routeSelect.value;
            if (routeId) {
                loadRouteBuses(routeId);
            }
        });
    }

    // Set up center button
    const centerBtn = document.getElementById('centerBtn');
    if (centerBtn) {
        centerBtn.addEventListener('click', function() {
            if (trackingMap) {
                trackingMap.setView([44.6488, -63.5752], 12);
            }
        });
    }
}

// Routes & Stops Map Functionality
function initRoutesMap() {
    if (!window.location.pathname.includes('routes-stops.html')) return;

    // Initialize routes map
    initRoutesMapView();
    window.routeLayers = {};

    // Set up route list interactions
    const routeLinks = document.querySelectorAll('.route-link');
    routeLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const routeName = this.getAttribute('data-route');
            highlightRouteOnMap(routeName);
        });
    });

    // Set up map controls
    const refreshBtn = document.getElementById('refreshRoutesBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            // Refresh map data (simulate)
            updateRoutesLastUpdate();
        });
    }

    const centerBtn = document.getElementById('centerRoutesBtn');
    if (centerBtn) {
        centerBtn.addEventListener('click', function() {
            if (window.routesMap) {
                window.routesMap.setView([44.6488, -63.5752], 11);
            }
        });
    }
}

// Initialize Routes Map
function initRoutesMapView() {
    const mapElement = document.getElementById('routesMap');
    if (!mapElement) return;

    // Initialize map centered on Halifax area
    const routesMap = L.map('routesMap').setView([44.6488, -63.5752], 11);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(routesMap);

    // Add route paths and stops
    addRoutePaths(routesMap);
    addRouteStops(routesMap);

    // Store map reference for interactions
    window.routesMap = routesMap;
}

// Add route paths to map
function addRoutePaths(map) {
    const routeColors = {
        'Route 1': '#233962', // Navy
        'Route 2': '#dc3545', // Red
        'Route 3': '#1a7f64', // Green
        'Route 4': '#d63384', // Pink
        'Route 5': '#ffc107'  // Yellow
    };

    const routePaths = {
        'Route 1': [
            [44.6488, -63.5752], // Downtown Terminal
            [44.6490, -63.5760], // Main Street
            [44.6475, -63.5735], // Central Park
            [44.6460, -63.5710]  // Valley Station
        ],
        'Route 2': [
            [44.6460, -63.5710], // Valley Station
            [44.6360, -63.5910], // University Ave
            [44.6350, -63.5890], // Campus Entrance
            [44.6340, -63.5870]  // Library Stop
        ],
        'Route 3': [
            [44.6350, -63.5890], // Campus Entrance
            [44.6600, -63.5800], // Harbor View
            [44.6650, -63.5850], // Marina District
            [44.6700, -63.5900]  // Harbor Terminal
        ],
        'Route 4': [
            [44.6700, -63.5900], // Harbor Terminal
            [44.6800, -63.6000], // Suburban Mall
            [44.6850, -63.6050], // Residential Area
            [44.6900, -63.6100]  // Suburban Station
        ],
        'Route 5': [
            [44.6900, -63.6100], // Suburban Station
            [44.6550, -63.5750], // City Center
            [44.6500, -63.5700], // Business District
            [44.6488, -63.5752]  // Downtown Terminal
        ]
    };

    // Store route layers for highlighting
    window.routeLayers = {};

    Object.keys(routePaths).forEach(routeName => {
        const path = routePaths[routeName];
        const color = routeColors[routeName];

        const polyline = L.polyline(path, {
            color: color,
            weight: 4,
            opacity: 0.8
        }).addTo(map);

        // Add route number markers
        const routeNumber = routeName.split(' ')[1];
        const midPoint = path[Math.floor(path.length / 2)];

        const routeMarker = L.marker(midPoint, {
            icon: L.divIcon({
                className: 'route-number-marker',
                html: `<div class="route-number-circle" style="background-color: ${color};">${routeNumber}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(map);

        routeMarker.on('click', function() {
            showRouteInfo(routeName);
        });

        window.routeLayers[routeName] = { polyline, marker: routeMarker };
    });
}

// Add route stops to map
function addRouteStops(map) {
    const busStops = [
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

    busStops.forEach(stop => {
        const stopIcon = L.divIcon({
            className: 'bus-stop-marker',
            html: '<i class="fas fa-map-marker-alt"></i>',
            iconSize: [20, 20],
            iconAnchor: [10, 20]
        });

        const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon })
            .addTo(map)
            .bindPopup(`<b>${stop.name}</b><br>Routes: ${stop.routes.join(', ')}`);

        marker.on('click', function() {
            showStopInfo(stop);
        });
    });
}

// Highlight route on map when clicked from list
function highlightRouteOnMap(routeName) {
    if (!window.routeLayers || !window.routeLayers[routeName]) return;

    // Reset all routes to normal opacity
    Object.values(window.routeLayers).forEach(layer => {
        layer.polyline.setStyle({ opacity: 0.8, weight: 4 });
    });

    // Highlight selected route
    const selectedLayer = window.routeLayers[routeName];
    selectedLayer.polyline.setStyle({ opacity: 1, weight: 6 });

    // Center map on route
    const bounds = selectedLayer.polyline.getBounds();
    window.routesMap.fitBounds(bounds, { padding: [20, 20] });

    // Show route info
    showRouteInfo(routeName);
}

// Show route information in details panel
function showRouteInfo(routeName) {
    const routeDetails = {
        'Route 1': {
            description: 'Downtown - Valley',
            stops: ['Downtown Terminal', 'Main Street', 'Central Park', 'Valley Station'],
            frequency: 'Every 30 minutes',
            firstBus: '6:00 AM',
            lastBus: '7:30 PM'
        },
        'Route 2': {
            description: 'Valley - Campus',
            stops: ['Valley Station', 'University Ave', 'Campus Entrance', 'Library Stop'],
            frequency: 'Every 30 minutes',
            firstBus: '6:15 AM',
            lastBus: '7:45 PM'
        },
        'Route 3': {
            description: 'Campus - Harbor',
            stops: ['Campus Entrance', 'Harbor View', 'Marina District', 'Harbor Terminal'],
            frequency: 'Every 30 minutes',
            firstBus: '6:30 AM',
            lastBus: '8:00 PM'
        },
        'Route 4': {
            description: 'Harbor - Suburban',
            stops: ['Harbor Terminal', 'Suburban Mall', 'Residential Area', 'Suburban Station'],
            frequency: 'Every 30 minutes',
            firstBus: '6:45 AM',
            lastBus: '8:15 PM'
        },
        'Route 5': {
            description: 'Suburban - Downtown',
            stops: ['Suburban Station', 'City Center', 'Business District', 'Downtown Terminal'],
            frequency: 'Every 30 minutes',
            firstBus: '7:00 AM',
            lastBus: '8:30 PM'
        }
    };

    const details = routeDetails[routeName];
    if (details) {
        const detailsPanel = document.getElementById('routeDetails');
        if (detailsPanel) {
            detailsPanel.innerHTML = `
                <div class="route-info">
                    <h6 class="mb-2">${routeName}: ${details.description}</h6>
                    <p class="mb-2"><strong>Frequency:</strong> ${details.frequency}</p>
                    <p class="mb-2"><strong>Service Hours:</strong> ${details.firstBus} - ${details.lastBus}</p>
                    <p class="mb-1"><strong>Stops:</strong></p>
                    <ul class="mb-0 small">
                        ${details.stops.map(stop => `<li>${stop}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
    }
}

// Show stop information
function showStopInfo(stop) {
    const detailsPanel = document.getElementById('routeDetails');
    if (detailsPanel) {
        detailsPanel.innerHTML = `
            <div class="stop-info">
                <h6 class="mb-2">${stop.name}</h6>
                <p class="mb-2"><strong>Routes:</strong> ${stop.routes.join(', ')}</p>
                <p class="mb-0 small text-muted">Click on route numbers to view schedules</p>
            </div>
        `;
    }
}

// Initialize Leaflet Map
function initMap() {
    const mapElement = document.getElementById('trackingMap');
    if (!mapElement) return;

    // Initialize map centered on Halifax area
    trackingMap = L.map('trackingMap').setView([44.6488, -63.5752], 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(trackingMap);

    // Add bus stop markers
    addBusStops();
}

// Add bus stop markers to map
function addBusStops() {
    const busStops = [
        { name: 'Downtown Terminal', lat: 44.6488, lng: -63.5752 },
        { name: 'Main Street', lat: 44.6490, lng: -63.5760 },
        { name: 'Central Park', lat: 44.6475, lng: -63.5735 },
        { name: 'Valley Station', lat: 44.6460, lng: -63.5710 },
        { name: 'University Ave', lat: 44.6360, lng: -63.5910 },
        { name: 'Campus Entrance', lat: 44.6350, lng: -63.5890 },
        { name: 'Library Stop', lat: 44.6340, lng: -63.5870 },
        { name: 'Harbor View', lat: 44.6600, lng: -63.5800 },
        { name: 'Marina District', lat: 44.6650, lng: -63.5850 },
        { name: 'Harbor Terminal', lat: 44.6700, lng: -63.5900 },
        { name: 'Suburban Mall', lat: 44.6800, lng: -63.6000 },
        { name: 'Residential Area', lat: 44.6850, lng: -63.6050 },
        { name: 'Suburban Station', lat: 44.6900, lng: -63.6100 },
        { name: 'City Center', lat: 44.6550, lng: -63.5750 },
        { name: 'Business District', lat: 44.6500, lng: -63.5700 }
    ];

    busStops.forEach(stop => {
        L.marker([stop.lat, stop.lng])
            .addTo(trackingMap)
            .bindPopup(`<b>${stop.name}</b><br>Bus Stop`);
    });
}

// Load buses for selected route
function loadRouteBuses(routeId) {
    clearBuses();

    // Simulated bus data
    const busData = {
        route1: [
            { id: 'R1-001', lat: 44.6488, lng: -63.5752, status: 'On Time', nextStop: 'Main Street' },
            { id: 'R1-002', lat: 44.6475, lng: -63.5735, status: 'Delayed', nextStop: 'Valley Station' }
        ],
        route2: [
            { id: 'R2-001', lat: 44.6360, lng: -63.5910, status: 'On Time', nextStop: 'Campus Entrance' },
            { id: 'R2-002', lat: 44.6350, lng: -63.5890, status: 'On Time', nextStop: 'Library Stop' }
        ],
        route3: [
            { id: 'R3-001', lat: 44.6600, lng: -63.5800, status: 'On Time', nextStop: 'Marina District' }
        ],
        route4: [
            { id: 'R4-001', lat: 44.6800, lng: -63.6000, status: 'Delayed', nextStop: 'Residential Area' }
        ],
        route5: [
            { id: 'R5-001', lat: 44.6550, lng: -63.5750, status: 'On Time', nextStop: 'Business District' }
        ]
    };

    const buses = busData[routeId];
    if (buses) {
        buses.forEach(bus => {
            addBusMarker(bus);
        });
        updateBusList(buses);
        drawRoutePath(routeId);
    }

    updateLastUpdate();
}

// Add bus marker to map
function addBusMarker(bus) {
    const busIcon = L.divIcon({
        className: 'bus-marker',
        html: '<i class="fas fa-bus"></i>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    const marker = L.marker([bus.lat, bus.lng], { icon: busIcon })
        .addTo(trackingMap)
        .bindPopup(`
            <b>Bus ${bus.id}</b><br>
            Status: ${bus.status}<br>
            Next Stop: ${bus.nextStop}
        `);

    busMarkers.push(marker);
}

// Update bus list in sidebar
function updateBusList(buses) {
    const busList = document.getElementById('busList');
    if (!busList) return;

    busList.innerHTML = '';

    buses.forEach(bus => {
        const busItem = document.createElement('div');
        busItem.className = 'bus-item p-2 mb-2 border rounded';
        busItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>Bus ${bus.id}</strong><br>
                    <small class="text-muted">Next: ${bus.nextStop}</small>
                </div>
                <span class="badge ${bus.status === 'On Time' ? 'bg-success' : 'bg-warning'}">${bus.status}</span>
            </div>
        `;
        busList.appendChild(busItem);
    });
}

// Draw route path on map
function drawRoutePath(routeId) {
    const routePaths = {
        route1: [
            [44.6488, -63.5752], // Downtown Terminal
            [44.6490, -63.5760], // Main Street
            [44.6475, -63.5735], // Central Park
            [44.6460, -63.5710]  // Valley Station
        ],
        route2: [
            [44.6460, -63.5710], // Valley Station
            [44.6360, -63.5910], // University Ave
            [44.6350, -63.5890], // Campus Entrance
            [44.6340, -63.5870]  // Library Stop
        ],
        route3: [
            [44.6350, -63.5890], // Campus Entrance
            [44.6600, -63.5800], // Harbor View
            [44.6650, -63.5850], // Marina District
            [44.6700, -63.5900]  // Harbor Terminal
        ],
        route4: [
            [44.6700, -63.5900], // Harbor Terminal
            [44.6800, -63.6000], // Suburban Mall
            [44.6850, -63.6050], // Residential Area
            [44.6900, -63.6100]  // Suburban Station
        ],
        route5: [
            [44.6900, -63.6100], // Suburban Station
            [44.6550, -63.5750], // City Center
            [44.6500, -63.5700], // Business District
            [44.6488, -63.5752]  // Downtown Terminal
        ]
    };

    const path = routePaths[routeId];
    if (path) {
        const polyline = L.polyline(path, {
            color: 'blue',
            weight: 4,
            opacity: 0.7
        }).addTo(trackingMap);

        routePolylines.push(polyline);
    }
}

// Clear all bus markers and routes
function clearBuses() {
    busMarkers.forEach(marker => {
        trackingMap.removeLayer(marker);
    });
    busMarkers = [];

    routePolylines.forEach(polyline => {
        trackingMap.removeLayer(polyline);
    });
    routePolylines = [];

    const busList = document.getElementById('busList');
    if (busList) {
        busList.innerHTML = '';
    }
}

// Update last update timestamp
function updateLastUpdate() {
    const lastUpdateElement = document.getElementById('lastUpdate');
    if (lastUpdateElement) {
        const now = new Date();
        lastUpdateElement.textContent = now.toLocaleTimeString();
    }
}

// Update routes last update timestamp
function updateRoutesLastUpdate() {
    const routesLastUpdateElement = document.getElementById('routesLastUpdate');
    if (routesLastUpdateElement) {
        const now = new Date();
        routesLastUpdateElement.textContent = now.toLocaleTimeString();
    }
}
