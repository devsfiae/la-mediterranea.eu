import { ThemeModel, HeaderModel, SlideshowModel } from './model.js';  // Consolidated imports

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the slideshow by showing the first slide
    SlideshowModel.showSlides(SlideshowModel.slideIndex = 1); // Display the first slide initially

    // Attach event listeners to the slideshow controls
    document.querySelector('.prev').addEventListener('click', () => {
        SlideshowModel.prevSlide();
    });

    document.querySelector('.next').addEventListener('click', () => {
        SlideshowModel.nextSlide();
    });

    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            SlideshowModel.currentSlide(index + 1);
        });
    });
    
    // Load footer dynamically
    loadFooter();

    // Load header dynamically and initialize theme-switch logic
    loadHeader();
});

// Function to load footer from external file
function loadFooter() {
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.querySelector('footer').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
}

// Function to load header from external file and initialize theme switch
function loadHeader() {
    HeaderModel.fetchHeader().then(headerHTML => {
        document.querySelector('header').innerHTML = headerHTML;

        // After the header is loaded, initialize theme switch
        initializeThemeSwitch();

        // Get the current page's URL
        const currentPage = HeaderModel.getCurrentPage();

        // Get all the navigation links
        const navLinks = document.querySelectorAll('.header-center ul li a');

        // Loop through links and hide the link for the current page
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.parentElement.style.display = 'none';  // Hide the current page link
            }
        });
    }).catch(error => console.error('Error loading header:', error));
}

// Function to initialize the theme switch after the header is loaded
function initializeThemeSwitch() {
    const toggleSwitch = document.getElementById('theme-checkbox');
    const modeText = document.getElementById('mode-text');

    // Load saved theme preference from localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    if (isDarkMode) {
        document.body.classList.add('dark-theme');
        toggleSwitch.checked = true;
        modeText.textContent = 'Light Mode';
    } else {
        document.body.classList.remove('dark-theme');
        modeText.textContent = 'Dark Mode';
    }

    // Toggle switch logic
    toggleSwitch.addEventListener('change', () => {
        if (toggleSwitch.checked) {
            document.body.classList.add('dark-theme');
            modeText.textContent = 'Light Mode';
            localStorage.setItem('darkMode', 'true');  // Save preference
        } else {
            document.body.classList.remove('dark-theme');
            modeText.textContent = 'Dark Mode';
            localStorage.setItem('darkMode', 'false');  // Save preference
        }
    });
}