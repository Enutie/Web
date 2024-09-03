// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Function to load HTML components
function loadComponent(url, elementId) {
    return fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        });
}

// Load header and footer
document.addEventListener('DOMContentLoaded', (event) => {
    loadComponent('header.html', 'header-placeholder');
    loadComponent('footer.html', 'footer-placeholder');

    // Load project cards
    const projectGrid = document.querySelector('.project-grid');
    if (projectGrid) {
        loadComponent('project-cards.html', 'project-grid')
            .then(() => {
                // If we're on the index page, limit the number of projects shown
                if (window.location.pathname.endsWith('index.html')) {
                    const projectCards = projectGrid.querySelectorAll('.project-card');
                    projectCards.forEach((card, index) => {
                        if (index >= 3) {
                            card.style.display = 'none';
                        }
                    });
                }
            });
    }
});

// You can add more JavaScript functionality here, such as:
// - Dark/Light mode toggle
// - Project filtering
// - Form validation for the contact page
// - Lazy loading for images