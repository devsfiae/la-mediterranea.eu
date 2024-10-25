// controller.ts initializes the main page components, loading external HTML (header and footer), initializing the theme switch, slideshow, and dynamic content.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// controller.ts
import { DateModel, DynamicContentModel, HeaderModel, ReservationModel, SlideshowModel, ThemeModel } from './model.js';
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield initializePage();
        const headerContent = yield HeaderModel.fetchHeader();
        document.querySelector('header').innerHTML = headerContent;
        HeaderModel.hideActivePageLink();
        initializeThemeSwitch(); // Initialize theme switch after the final header load
    }
    catch (error) {
        console.error('Error during initial page setup:', error);
    }
}));
// Main initialization function to set up the page components
function initializePage() {
    return __awaiter(this, void 0, void 0, function* () {
        ThemeModel.applyTheme();
        // Load header and footer components
        yield loadComponent('header', 'header');
        yield loadComponent('footer', 'footer');
        const currentPage = getCurrentPage();
        // Check for slideshow container before initializing
        const slideshowContainer = getElement('.slideshow-container');
        if (slideshowContainer) {
            initializeSlideshow();
        }
        else {
            console.warn('Slideshow container not found.');
        }
        // Map pages to specific content types (for dynamic loading)
        const pageContentMap = {
            'food.html': { contentType: 'menu', buttonId: 'foodcard_button' },
            'drinks.html': { contentType: 'drink', buttonId: 'drinkcard_button' },
            // Add more pages and content types here as needed
        };
        if (pageContentMap[currentPage]) {
            const { contentType, buttonId } = pageContentMap[currentPage];
            initializeContentButton(contentType, buttonId);
        }
        // Initialize the date picker if available
        if (getElement('#dateButton')) {
            initializeDatePicker();
            loadReservations(DateModel.getDate());
        }
    });
}
// Sets up the content button to dynamically load specific content
function initializeContentButton(contentType) {
    const contentButton = getElement('#content-button');
    if (!contentButton) {
        console.warn('Content button not found.');
        return;
    }
    contentButton.addEventListener('click', (event) => {
        event.preventDefault();
        // Hauptinhalt scrollbar machen
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.classList.add('scrollable-content');
        }
        // Footer ausblenden
        const footer = document.querySelector('footer');
        if (footer) {
            footer.style.display = 'none';
        }
        // Slideshow ausblenden
        const slideshowContainer = getElement('.slideshow-container');
        const dotsContainer = getElement('.dots-container');
        if (slideshowContainer)
            slideshowContainer.style.display = 'none';
        if (dotsContainer)
            dotsContainer.style.display = 'none';
        // Dynamischen Inhalt einblenden
        const dynamicContent = getElement('#dynamic-content');
        if (dynamicContent) {
            dynamicContent.style.display = 'flex';
        }
        // Inhalt laden
        loadContent(contentType, 'all');
    });
}
// Utility function to select an element and log a warning if not found
function getElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`${selector} not found.`);
    }
    return element;
}
// Loads external HTML components (header, footer) asynchronously
function loadComponent(component, selector) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield loadExternalHTML(`/app/html/${component}.html`, selector);
            if (component === 'header') {
                initializeThemeSwitch(); // Initialize the theme switch after header loads
            }
        }
        catch (error) {
            console.error(`Error loading ${component}:`, error);
        }
    });
}
// Loads external HTML into a specified element
function loadExternalHTML(url, elementSelector) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(url);
            if (!response.ok)
                throw new Error(`Error loading ${url}: ${response.statusText}`);
            const data = yield response.text();
            const element = getElement(elementSelector);
            if (element)
                element.innerHTML = data;
        }
        catch (error) {
            console.error(error);
        }
    });
}
// Initializes the theme switch for dark/light mode
function initializeThemeSwitch() {
    const toggleSwitch = getElement('#theme-checkbox');
    const modeText = getElement('#mode-text');
    if (!toggleSwitch || !modeText) {
        console.warn('Theme switch elements not found!');
        return;
    }
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const updateTheme = (isDarkMode) => {
        document.body.classList.toggle('dark-theme', isDarkMode);
        modeText.textContent = isDarkMode ? 'light' : 'dark';
        localStorage.setItem('darkMode', isDarkMode.toString());
    };
    updateTheme(isDarkMode);
    toggleSwitch.checked = isDarkMode;
    // Event listener for theme toggle
    toggleSwitch.addEventListener('change', () => {
        updateTheme(toggleSwitch.checked);
    });
}
// Initializes slideshow if elements exist
function initializeSlideshow() {
    SlideshowModel.showSlides(SlideshowModel.slideIndex);
    setupSlideNavigation('.prev', () => SlideshowModel.prevSlide());
    setupSlideNavigation('.next', () => SlideshowModel.nextSlide());
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => SlideshowModel.currentSlide(index + 1));
    });
}
function setupSlideNavigation(selector, callback) {
    const button = getElement(selector);
    if (button) {
        button.addEventListener('click', callback);
    }
}
// Loads and renders dynamic content based on the specified type and category
function loadContent(contentType, category) {
    const url = category === 'all'
        ? `/app/api/get_${contentType}s.php`
        : `/app/api/get_${contentType}s.php?category=${category}`;
    DynamicContentModel.fetchData(url)
        .then((data) => {
        renderContent(data, contentType);
    })
        .catch((error) => console.error(`Error when loading ${contentType}s:`, error.message));
}
// Renders content (menus, drinks) based on loaded data
function renderContent(data, contentType) {
    const container = getElement('#dynamic-content');
    if (!container) {
        console.warn('Container für dynamischen Inhalt nicht gefunden.');
        return;
    }
    container.innerHTML = ''; // Container leeren
    data.forEach(item => {
        let title = item.menu_name;
        let description = item.menu_ingredients;
        let price = item.menu_price;
        let imageUrl = `../../images/food/${item.image_filename}`;
        const cardContent = `
            <div class="card">
                <img src="${imageUrl}" alt="${title}" class="card-image" onerror="this.onerror=null;this.src='../../images/icons/no_picture.png';">
                <h3 class="card-title">${title}</h3>
                <p class="card-text">${description}</p>
                ${price ? `<p>Preis: ${price} €</p>` : ''}
            </div>
        `;
        const cardElement = document.createElement('div');
        cardElement.innerHTML = cardContent;
        container.appendChild(cardElement.firstElementChild);
    });
}
// Loads and initializes the date picker
function initializeDatePicker() {
    const dateButton = getElement('#dateButton');
    if (dateButton && !dateButton._flatpickrInstance) {
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
// Updates date button with selected date
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
// Loads reservations for a specific date
function loadReservations(date) {
    ReservationModel.fetchReservations(date)
        .then(reservations => {
        renderReservations(reservations);
    })
        .catch(error => console.error('Error loading reservations:', error));
}
// Renders reservation data
function renderReservations(reservations) {
    const container = getElement('#reservation-container');
    if (container) {
        container.innerHTML = reservations.length
            ? reservations.map(reservation => createReservationCard(reservation)).join('')
            : '<p>No reservations available for this date.</p>';
    }
}
// Creates HTML for each reservation card
function createReservationCard(reservation) {
    return `
        <div class="card">
            <p>Table: ${reservation.table}</p>
            <p>Persons: ${reservation.persons}</p>
            <p>Time: ${reservation.time}</p>
            <p>Status: ${reservation.state}</p>
        </div>
    `;
}
// Gets the current page name from the URL
function getCurrentPage() {
    return window.location.pathname.split('/').pop() || '';
}
