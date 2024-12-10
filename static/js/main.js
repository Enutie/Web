// Add this to a new file: static/js/main.js
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.mobile-menu-button');
    const sideNav = document.querySelector('.side-nav');
    
    menuButton.addEventListener('click', function() {
        sideNav.classList.toggle('active');
        menuButton.classList.toggle('active');
    });
});