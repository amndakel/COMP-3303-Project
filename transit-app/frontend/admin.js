// Admin Dashboard JavaScript
const ADMIN_API = window.BACKEND_URL || 'http://localhost:8001';

// Cache for routes data to avoid redundant API calls
let cachedRoutes = [];

// Check admin authentication
function checkAdminAuth() {
    if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'admin.html';
        return false;
    }
    return true;
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
    if (!checkAdminAuth()) return;
    
    initDarkMode();
    setupFormHandlers();
    await loadDashboardData();
});

// Load all dashboard data
async function loadDashboardData() {
    const [routes, updates] = await Promise.all([
        fetchData('/index.php/routes'),
        fetchData('/index.php/updates')
    ]);
    
    cachedRoutes = routes || [];
    displayRoutes(cachedRoutes);
    displayServiceUpdates(updates || []);
    updateStatistics();
}

// Generic fetch helper with error handling
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${ADMIN_API}${endpoint}`);
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);
        if (!Array.isArray(data)) throw new Error('Invalid response format');
        
        return data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
}

// Display routes with toggle switches
function displayRoutes(routes) {
    const container = document.getElementById('routesList');
    
    if (!routes || routes.length === 0) {
        container.innerHTML = `<div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>No routes found.</div>`;
        return;
    }

    const routeStates = JSON.parse(localStorage.getItem('routeStates') || '{}');
    
    container.innerHTML = routes.map(route => {
        const isActive = routeStates[route.id] !== false;
        return `
            <div class="route-item">
                <div class="route-item-header">
                    <div>
                        <h5 class="route-name">${escapeHtml(route.name)}</h5>
                        <p class="route-description">${escapeHtml(route.description || 'No description')}</p>
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="route-${route.id}" 
                               ${isActive ? 'checked' : ''} onchange="toggleRoute(${route.id}, this.checked)">
                        <label class="form-check-label" for="route-${route.id}">${isActive ? 'Active' : 'Inactive'}</label>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Toggle route active/inactive
function toggleRoute(routeId, isActive) {
    const routeStates = JSON.parse(localStorage.getItem('routeStates') || '{}');
    routeStates[routeId] = isActive;
    localStorage.setItem('routeStates', JSON.stringify(routeStates));
    
    const label = document.querySelector(`label[for="route-${routeId}"]`);
    if (label) label.textContent = isActive ? 'Active' : 'Inactive';
    
    updateStatistics();
}

// Display service updates
function displayServiceUpdates(updates) {
    const container = document.getElementById('updatesList');
    
    if (!updates || updates.length === 0) {
        container.innerHTML = `<div class="alert alert-info"><i class="fas fa-info-circle me-2"></i>No service updates found.</div>`;
        return;
    }

    container.innerHTML = updates.map(update => `
        <div class="service-update-item" id="update-${update.id}">
            <div class="service-update-header">
                <div class="flex-grow-1">
                    <h5 class="service-update-title">${escapeHtml(update.title)}</h5>
                    <div class="service-update-date">
                        <i class="fas fa-calendar me-1"></i>${formatDate(update.created_at)}
                    </div>
                </div>
                <button class="btn btn-delete" onclick="deleteServiceUpdate(${update.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p class="service-update-message">${escapeHtml(update.message)}</p>
        </div>
    `).join('');
}

// Delete service update
async function deleteServiceUpdate(updateId) {
    if (!confirm('Delete this service update?')) return;

    try {
        const response = await fetch(`${ADMIN_API}/index.php/updates/${updateId}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (result.error) throw new Error(result.error);

        // Animate removal
        const element = document.getElementById(`update-${updateId}`);
        if (element) {
            element.style.cssText = 'opacity:0; transform:translateX(-20px); transition:all 0.3s';
            setTimeout(() => {
                element.remove();
                updateStatistics();
            }, 300);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Setup form handlers
function setupFormHandlers() {
    document.getElementById('addUpdateForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addServiceUpdate();
    });
}

// Add new service update
async function addServiceUpdate() {
    const titleInput = document.getElementById('updateTitle');
    const messageInput = document.getElementById('updateMessage');
    const errorDiv = document.getElementById('addUpdateError');
    const successDiv = document.getElementById('addUpdateSuccess');

    errorDiv.classList.add('d-none');
    successDiv.classList.add('d-none');

    const title = titleInput.value.trim();
    const message = messageInput.value.trim();

    if (!title || !message) {
        showMessage(errorDiv, 'Please fill in both title and message.');
        return;
    }

    try {
        const response = await fetch(`${ADMIN_API}/index.php/updates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, message })
        });

        const result = await response.json();
        if (result.error) throw new Error(result.error);

        showMessage(successDiv, 'Service update added!', 3000);
        titleInput.value = '';
        messageInput.value = '';
        
        // Reload updates
        const updates = await fetchData('/index.php/updates');
        displayServiceUpdates(updates || []);
        updateStatistics();
    } catch (error) {
        showMessage(errorDiv, 'Error: ' + error.message);
    }
}

// Update statistics using cached data
function updateStatistics() {
    const routeStates = JSON.parse(localStorage.getItem('routeStates') || '{}');
    const activeCount = cachedRoutes.filter(route => routeStates[route.id] !== false).length;
    
    document.getElementById('routesCount').textContent = cachedRoutes.length;
    document.getElementById('activeRoutesCount').textContent = activeCount;
    
    // Count updates from DOM
    const updatesCount = document.querySelectorAll('.service-update-item').length;
    document.getElementById('updatesCount').textContent = updatesCount;
}

// Helper: Show message with optional auto-hide
function showMessage(element, text, autoHideMs = 0) {
    element.textContent = text;
    element.classList.remove('d-none');
    if (autoHideMs > 0) {
        setTimeout(() => element.classList.add('d-none'), autoHideMs);
    }
}

// Helper: Format date
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Helper: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
