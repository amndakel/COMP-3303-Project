// Main JavaScript for Regional Bus Transit Website

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionalities
    initSearch();
    initRouteSelection();
    initServiceUpdates();
    initNavigation();
    initGeneralEvents();
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

// Search Address Functionality (for index.html)
function searchAddress(query) {
    // Static address to route mapping
    const addressRoutes = {
        'downtown terminal': 'route1',
        'main street': 'route1',
        'central park': 'route1',
        'valley station': 'route1',
        'valley': 'route1',
        'university ave': 'route2',
        'campus entrance': 'route2',
        'library stop': 'route2',
        'campus': 'route2',
        'harbor view': 'route3',
        'marina district': 'route3',
        'harbor terminal': 'route3',
        'harbor': 'route3',
        'suburban mall': 'route4',
        'residential area': 'route4',
        'suburban station': 'route4',
        'suburban': 'route4',
        'city center': 'route5',
        'business district': 'route5',
        'downtown': 'route5'
    };

    const routeId = addressRoutes[query];
    if (routeId) {
        showRouteSchedule(routeId);
    } else {
        alert(`No route found for address: ${query}. Try searching for stops like "Downtown Terminal" or "Campus Entrance".`);
    }
}

// General Event Listeners
function initGeneralEvents() {
    // Example: Handle service card clicks
    const serviceCards = document.querySelectorAll('.service-card a');
    serviceCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Prevent default if needed, or add analytics/logging
            console.log('Service card clicked:', this.textContent.trim());
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
