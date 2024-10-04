import { HeaderModel, SlideshowModel, ThemeModel } from './model.js';  // Import the correct models

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the slideshow if slideshow elements are present
    if (document.querySelectorAll('.slide').length > 0 && document.querySelectorAll('.dot').length > 0) {
        SlideshowModel.showSlides(SlideshowModel.slideIndex = 1);

        // Attach event listeners to slideshow controls
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
    } else {
        console.warn("No slideshow found on this page.");
    }

    // Load footer dynamically
    loadFooter();

    // Load header dynamically and initialize theme-switch logic
    loadHeader();

    // Initialize the dark mode switch
    initializeThemeSwitch();
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

        // After the header is loaded, hide the active page link
        HeaderModel.hideActivePageLink();

        // Initialize the theme switch once the header is loaded
        initializeThemeSwitch();
    }).catch(error => console.error('Error loading header:', error));
}

// Function to initialize the theme switch after the header is loaded
function initializeThemeSwitch() {
    const toggleSwitch = document.getElementById('theme-checkbox');
    const modeText = document.getElementById('mode-text');

    // Check if the toggle switch and mode text elements exist
    if (!toggleSwitch || !modeText) {
        console.error('Theme switch or mode text elements not found.');
        return;
    }

    // Load saved theme preference from localStorage
    const isDarkMode = ThemeModel.getThemePreference();

    if (isDarkMode) {
        document.body.classList.add('dark-theme');
        toggleSwitch.checked = true;
        modeText.textContent = 'light';
    } else {
        document.body.classList.remove('dark-theme');
        modeText.textContent = 'dark';
    }

    // Toggle switch logic
    toggleSwitch.addEventListener('change', () => {
        if (toggleSwitch.checked) {
            document.body.classList.add('dark-theme');
            modeText.textContent = 'light';
            ThemeModel.saveThemePreference(true);  // Save preference
        } else {
            document.body.classList.remove('dark-theme');
            modeText.textContent = 'dark';
            ThemeModel.saveThemePreference(false);  // Save preference
        }
    });
}