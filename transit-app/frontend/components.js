// Shared Components - Header & Footer

const HEADER_HTML = `
<!-- Search Bar -->
<div class="search-bar-section search-bar-padding">
    <div class="container">
        <div class="row align-items-center justify-content-end">
            <div class="col-md-3">
                <div class="input-group input-group-sm">
                    <input type="text" class="form-control border-0 search-input" placeholder="Search..." aria-label="Search">
                    <button class="btn btn-light border-0 search-button" type="button" aria-label="Search">
                        <i class="fas fa-search search-icon"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Navigation -->
<nav class="navbar navbar-expand-lg navbar-light bg-white sticky-top">
    <div class="container">
        <a class="navbar-brand fw-bold navbar-brand-color" href="index.html">
            <i class="fas fa-bus me-2 navbar-icon-color"></i>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="schedule.html">Schedule</a></li>
                <li class="nav-item"><a class="nav-link" href="fares-passes.html">Fares & Passes</a></li>
                <li class="nav-item"><a class="nav-link" href="routes-stops.html">Routes & Stops</a></li>
                <li class="nav-item"><a class="nav-link" href="contact.html">Contact</a></li>
                <li class="nav-item"><a class="nav-link" href="admin.html">Admin</a></li>
            </ul>
            <button id="darkModeToggle" class="dark-mode-toggle" type="button" aria-label="Toggle Dark Mode" title="Toggle Dark Mode">
                <i class="fas fa-moon"></i>
            </button>
        </div>
    </div>
</nav>
`;

const FOOTER_HTML = `
<footer class="bg-dark text-white py-4">
    <div class="container">
        <div class="row">
            <div class="col-md-6">
                <h5>Regional Bus Transit</h5>
                <p class="mb-0"><small>Est. 2025</small></p>
            </div>
            <div class="col-md-6">
                <h6>Quick Links</h6>
                <ul class="list-unstyled">
                    <li><a href="schedule.html" class="text-white-50">Schedule Information</a></li>
                    <li><a href="fares-passes.html" class="text-white-50">Fares & Passes</a></li>
                    <li><a href="routes-stops.html" class="text-white-50">Routes & Stops</a></li>
                    <li><a href="contact.html" class="text-white-50">Contact Us</a></li>
                </ul>
            </div>
        </div>
        <hr class="my-3">
        <div class="row align-items-center">
            <div class="col-md-6">
                <p class="mb-0">&copy; 2025 Regional Bus Transit | COMP-3303 Project</p>
                <small class="text-muted">Team: Amanda Kelly, Sadman Islam Aaraf, Eshaan Prakash</small>
            </div>
            <div class="col-md-6 text-md-end">
                <small class="text-muted">Inspired by Kings Transit Authority</small>
            </div>
        </div>
    </div>
</footer>
`;

// Inject components
document.addEventListener('DOMContentLoaded', () => {
    const headerEl = document.getElementById('shared-header');
    const footerEl = document.getElementById('shared-footer');
    
    if (headerEl) headerEl.innerHTML = HEADER_HTML;
    if (footerEl) footerEl.innerHTML = FOOTER_HTML;
});

