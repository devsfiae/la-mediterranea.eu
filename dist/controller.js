// controller.ts is the main entry point for the application. It initializes the page by loading external components (header, footer), setting up the slideshow, and handling dynamic content (menus, cocktails). It also initializes the date picker and loads reservations for the selected date.
import { SlideshowModel, DynamicContentModel, DateModel, ReservationModel } from '../dist/model.js';
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});
function initializePage() {
    loadComponent('header', 'header');
    loadComponent('footer', 'footer');
    const currentPage = getCurrentPage();
    if (getElement('.slideshow-container')) {
        initializeSlideshow();
    }
    if (currentPage === 'cocktails.html') {
        loadContent('drink', 'all');
    }
    else if (currentPage === 'menus.html') {
        loadContent('menu', 'all');
    }
    if (getElement('#dateButton')) {
        initializeDatePicker();
        loadReservations(DateModel.getDate());
    }
}
// Utility function to get an element and log a warning if not found
function getElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`${selector} not found.`);
    }
    // Cast the returned element to HTMLElement
    return element;
}
// Load external HTML components (e.g., header, footer)
function loadComponent(component, selector) {
    loadExternalHTML(`/app/html/${component}.html`, selector)
        .then(() => {
        if (component === 'header') {
            console.log('Header loaded and initializing theme switch.');
            initializeThemeSwitch(); // Make sure that the switch is initialized after loading the header
        }
    });
}
// Function to load external HTML into a specific element and return a Promise
function loadExternalHTML(url, elementSelector) {
    return fetch(url)
        .then(response => {
        if (!response.ok) {
            throw new Error(`Error loading ${url}: ${response.statusText}`);
        }
        return response.text();
    })
        .then(data => {
        const element = getElement(elementSelector);
        if (element) {
            element.innerHTML = data;
        }
        else {
            console.warn(`Element with selector ${elementSelector} not found.`);
        }
    })
        .catch(error => {
        console.error(`Failed to load ${url}: ${error.message}`);
    });
}
// Theme switch initialization
function initializeThemeSwitch() {
    const toggleSwitch = getElement('#theme-checkbox');
    const modeText = getElement('#mode-text');
    if (!toggleSwitch || !modeText) {
        console.warn('Theme switch elements not found!');
        return;
    }
    // Load the current theme from the LocalStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    console.log(`Current dark mode setting: ${isDarkMode}`);
    // Function for updating the theme
    const updateTheme = (isDarkMode) => {
        document.body.classList.toggle('dark-theme', isDarkMode);
        modeText.textContent = isDarkMode ? 'light' : 'dark';
        localStorage.setItem('darkMode', isDarkMode.toString());
        console.log(`Dark mode set to: ${isDarkMode}`);
    };
    updateTheme(isDarkMode);
    // Set checkbox accordingly
    toggleSwitch.checked = isDarkMode;
    // Event Listener for Theme-Switch
    toggleSwitch.addEventListener('change', () => {
        updateTheme(toggleSwitch.checked);
    });
}
// Slideshow initialization
function initializeSlideshow() {
    SlideshowModel.showSlides(SlideshowModel.slideIndex);
    setupSlideNavigation('.prev', SlideshowModel.prevSlide.bind(SlideshowModel));
    setupSlideNavigation('.next', SlideshowModel.nextSlide.bind(SlideshowModel));
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => SlideshowModel.currentSlide(index + 1));
    });
}
// Setup event listeners for slide navigation buttons
function setupSlideNavigation(selector, callback) {
    const button = getElement(selector);
    if (button) {
        button.addEventListener('click', callback);
    }
}
// Load and render dynamic content (e.g., menus, drinks)
function loadContent(type, category) {
    const url = category === 'all'
        ? `/app/api/get_${type}s.php`
        : `/app/api/get_${type}s.php?category=${category}`;
    DynamicContentModel.fetchData(url)
        .then(data => {
        DynamicContentModel.renderContent(data, type);
    })
        .catch(error => console.error(`Error loading ${type}s:`, error));
}
// Initialize date picker and handle date changes
function initializeDatePicker() {
    const dateButton = getElement('#dateButton');
    if (dateButton && !dateButton._flatpickr) {
        flatpickr(dateButton, {
            enableTime: false,
            dateFormat: 'Y-m-d',
            defaultDate: DateModel.getDate(),
            onChange: function (selectedDates) {
                const selectedDate = selectedDates[0];
                DateModel.setDate(selectedDate);
                updateDateButton(selectedDate);
                loadReservations(selectedDate);
            }
        });
    }
}
// Update date button text with the selected date
function updateDateButton(date) {
    const dateButton = getElement('#dateButton');
    if (dateButton) {
        dateButton.textContent = date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}
// Load reservations for a specific date
function loadReservations(date) {
    ReservationModel.fetchReservations(date)
        .then(reservations => {
        renderReservations(reservations);
    })
        .catch(error => console.error('Error loading reservations:', error));
}
// Render reservations (placeholder function for actual rendering logic)
function renderReservations(reservations) {
    const container = getElement('#reservation-container');
    if (container) {
        container.innerHTML = reservations.length
            ? reservations.map(reservation => createReservationCard(reservation)).join('')
            : '<p>Keine Reservierungen für dieses Datum verfügbar.</p>';
    }
}
// Create HTML for a reservation card (placeholder function for actual template logic)
function createReservationCard(reservation) {
    return `
    <div class="card">
      <p>Tisch: ${reservation.table}</p>
      <p>Personen: ${reservation.persons}</p>
      <p>Zeit: ${reservation.time}</p>
      <p>Status: ${reservation.state}</p>
    </div>
  `;
}
// Get the current page name from the URL
function getCurrentPage() {
    return window.location.pathname.split('/').pop() || '';
}
//# sourceMappingURL=controller.js.map