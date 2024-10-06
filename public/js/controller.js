// cotroller.js
import { SlideshowModel, HeaderModel, DynamicContentModel } from './model.js';

// Wait for the DOM to be fully loaded
// In controller.js

document.addEventListener('DOMContentLoaded', () => {
    // Header-Element abrufen
    const headerElement = document.querySelector('header');
    if (headerElement && headerElement.innerHTML.trim() === '') {
        // Header ist leer, lade ihn dynamisch
        loadHeader();
    } else {
        // Header ist bereits vorhanden, initialisiere abhängige Funktionen
        initializeThemeSwitch();
        HeaderModel.hideActivePageLink();
    }

    // Footer-Element abrufen
    const footerElement = document.querySelector('footer');
    if (footerElement && footerElement.innerHTML.trim() === '') {
        // Footer ist leer, lade ihn dynamisch
        loadFooter();
    }

    // Aktuelle Seite ermitteln
    const currentPage = window.location.pathname.split('/').pop();

    // Wenn wir auf der Menüseite sind
    if (currentPage === 'card.html' || currentPage === 'menus.html' || currentPage === 'food.html' || currentPage === 'drinks.html') {
        // Funktion `loadMenus` beim Laden der Seite aufrufen
        if (typeof loadMenus === 'function') {
            loadMenus('all');
        }

        // Füge Event Listener für das Kategorie-Dropdown hinzu
        const categoryDropdown = document.getElementById('category-dropdown');
        if (categoryDropdown) {
            categoryDropdown.addEventListener('change', (e) => {
                const selectedCategory = e.target.value;
                loadMenus(selectedCategory);
            });
        }
    } else {
        // Für andere Seiten prüfen, ob dynamischer Inhalt geladen werden muss
        const dynamicContentElement = document.getElementById('dynamic-content');
        if (dynamicContentElement && dynamicContentElement.children.length === 0) {
            // Dynamischen Inhalt laden (falls erforderlich)
        }
    }

    // Initialisiere die Slideshow, falls vorhanden
    initializeSlideshow();
});

// Function to initialize the slideshow
function initializeSlideshow() {
    // Initialisiere die Slideshow
    SlideshowModel.showSlides(SlideshowModel.slideIndex);

    // Event Listener für die Navigationspfeile
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');

    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            SlideshowModel.prevSlide();
        });

        nextButton.addEventListener('click', () => {
            SlideshowModel.nextSlide();
        });
    }

    // Event Listener für die Dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            SlideshowModel.currentSlide(index + 1);
        });
    });
}

function loadMenus(category) {
    // Build the URL based on the category
    const url = category === 'all' ? '/app/api/get_menues.php' : `/app/api/get_menues.php?category=${category}`;
    
    // Fetch and render the menus
    DynamicContentModel.fetchData(url)
        .then(menus => {
            DynamicContentModel.renderContent(menus, 'menu');
        })
        .catch(error => {
            console.error('Error rendering menus:', error);
        });
}

// Function to load footer from external file
function loadFooter() {
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            const footerElement = document.querySelector('footer');
            if (footerElement) {
                footerElement.innerHTML = data;
            }
        })
        .catch(error => console.error('Error loading footer:', error));
}

// Function to load header from external file
function loadHeader() {
    HeaderModel.fetchHeader()
        .then(headerHTML => {
            const headerElement = document.querySelector('header');
            if (headerElement) {
                headerElement.innerHTML = headerHTML;

                // After loading the header, initialize theme switch and hide active page link
                initializeThemeSwitch();
                HeaderModel.hideActivePageLink();
            }
        })
        .catch(error => console.error('Error loading header:', error));
}

// Function to initialize the theme switch
function initializeThemeSwitch() {
    const toggleSwitch = document.getElementById('theme-checkbox');
    const modeText = document.getElementById('mode-text');

    if (!toggleSwitch || !modeText) {
        console.warn('Theme switch elements not found.');
        return;
    }

    // Load saved theme preference from localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    if (isDarkMode) {
        document.body.classList.add('dark-theme');
        toggleSwitch.checked = true;
        modeText.textContent = 'light';
    } else {
        document.body.classList.remove('dark-theme');
        modeText.textContent = 'dark';
    }

    // Add event listener to toggle switch
    toggleSwitch.addEventListener('change', () => {
        if (toggleSwitch.checked) {
            document.body.classList.add('dark-theme');
            modeText.textContent = 'light';
            localStorage.setItem('darkMode', 'true');
        } else {
            document.body.classList.remove('dark-theme');
            modeText.textContent = 'dark';
            localStorage.setItem('darkMode', 'false');
        }
    });
}