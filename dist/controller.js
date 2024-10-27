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
import { DateModel, DynamicContentModel, HeaderModel, ReservationModel, SlideshowModel, ThemeModel } from './model.js';
// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield initializePage();
        HeaderModel.hideActivePageLink();
        initializeThemeSwitch(); // Initialize theme switch after header is loaded
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
        const pageContentMap = {
            'food.html': { contentType: 'menu' },
            'drinks.html': { contentType: 'drink' },
            'reservations.html': { contentType: 'reservation' },
        };
        const pageConfig = pageContentMap[currentPage];
        if (pageConfig === null || pageConfig === void 0 ? void 0 : pageConfig.contentType) {
            yield loadCategoryDropdown(pageConfig.contentType); // Load category dropdown
            if (pageConfig.contentType === 'reservation') {
                initializeDatePicker();
                loadReservations(DateModel.getDate());
            }
            else {
                loadContent(pageConfig.contentType, 'all');
            }
        }
        ;
        // Initialize slideshow if present
        const slideshowContainer = getElement('.slideshow-container');
        if (slideshowContainer) {
            initializeSlideshow();
        }
        else {
            console.warn('Slideshow container not found.');
        }
    });
}
// Loads the category dropdown for dynamic content
function loadCategoryDropdown(contentType) {
    return __awaiter(this, void 0, void 0, function* () {
        const dropdownContainer = document.querySelector('.dropdown-container');
        if (!dropdownContainer) {
            console.warn('Dropdown container not found.');
            return;
        }
        // Build URL for fetching categories, using the 'content' parameter
        const url = `/app/api/get_categories.php?content=${contentType}`;
        console.log(`Fetching categories from: ${url}`); // Debug log
        // Populate the dropdown initially with "All Categories"
        dropdownContainer.innerHTML = `
        <select id="${contentType}CategoryDropdown" class="dropdown">
            <option value="all">All Categories</option>
        </select>
    `;
        try {
            const response = yield fetch(url);
            const categories = yield response.json();
            if (!Array.isArray(categories)) {
                console.error('Invalid data format for categories:', categories);
                dropdownContainer.innerHTML = '<p>Error loading categories</p>';
                return;
            }
            // Generate options for each category and append them to the dropdown
            const categoryOptions = categories.map((category) => `<option value="${category.category_id}">${category.category_name}</option>`).join('');
            const dropdown = document.getElementById(`${contentType}CategoryDropdown`);
            dropdown.innerHTML += categoryOptions;
            dropdown.addEventListener('change', (event) => {
                const selectedCategory = event.target.value;
                loadContent(contentType, selectedCategory);
            });
        }
        catch (error) {
            console.error('Error loading category dropdown:', error);
            dropdownContainer.innerHTML = '<p>Error loading categories</p>';
        }
    });
}
// Sets up the content button to dynamically load specific content
function initializeContentButton(contentType, buttonId) {
    const contentButton = getElement(`#${buttonId}`);
    if (!contentButton) {
        console.warn(`Content button with ID ${buttonId} not found.`);
        return;
    }
    contentButton.addEventListener('click', (event) => {
        event.preventDefault();
        // Make main content scrollable
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.classList.add('scrollable-content');
        }
        // Hide footer
        const footer = document.querySelector('footer');
        if (footer) {
            footer.style.display = 'none';
        }
        // Hide slideshow
        const slideshowContainer = getElement('.slideshow-container');
        const dotsContainer = getElement('.dots-container');
        if (slideshowContainer)
            slideshowContainer.style.display = 'none';
        if (dotsContainer)
            dotsContainer.style.display = 'none';
        // Show dynamic content container
        const dynamicContent = getElement('#dynamic-content');
        if (dynamicContent) {
            dynamicContent.style.display = 'flex';
        }
        // Load content
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
// Sets up navigation buttons for the slideshow
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
        .catch((error) => console.error(`Error when loading ${contentType}s:`, error));
}
// Fetches and renders content based on data and content type
function renderContent(data, contentType) {
    return __awaiter(this, void 0, void 0, function* () {
        const container = getElement('#dynamic-content'); // Use #dynamic-content as the main container
        if (!container) {
            console.warn('Container for dynamic content not found.');
            return;
        }
        container.innerHTML = ''; // Clear the container
        // Determine the template path based on content type
        let templatePath;
        let baseImagePath;
        switch (contentType) {
            case 'menu':
                templatePath = '/app/html/food_card.html';
                baseImagePath = '/images/food/';
                break;
            case 'drink':
                templatePath = '/app/html/drink_card.html';
                baseImagePath = '/images/drinks/';
                break;
            case 'reservation':
                templatePath = '/app/html/reservation_card.html';
                baseImagePath = '/images/bar/';
                break;
            case 'reservation_form':
                templatePath = '/app/html/reservation_form.html';
                break;
            default:
                console.warn(`Unknown content type: ${contentType}`);
                return;
        }
        // Load and render content items
        if (contentType === 'reservation_form') {
            if (data.length > 0) {
                const formData = data[0];
                formData.date = DateModel.getDate().toISOString().split('T')[0]; // Ensure date is included
                const formTemplate = yield loadTemplate(templatePath);
                const formContent = replacePlaceholders(formTemplate, formData);
                container.innerHTML = formContent;
                // Add submit event listener to the reservation form
                const form = container.querySelector('.reservation-form');
                if (form) {
                    form.addEventListener('submit', handleReservationSubmit);
                }
            }
        }
        else {
            // Render cards for each item and include image paths
            for (const item of data) {
                if (contentType === 'drink' || contentType === 'menu') {
                    item.imagePath = baseImagePath + (item.image_filename || 'placeholder.jpg');
                }
                const template = yield loadTemplate(templatePath);
                const cardContent = replacePlaceholders(template, item);
                const cardElement = document.createElement('div');
                cardElement.innerHTML = cardContent;
                // Add event listeners for reservations if content is reservation
                if (contentType === 'reservation' && item.available) {
                    const button = cardElement.querySelector('.primary-btn');
                    if (button) {
                        button.addEventListener('click', () => {
                            renderContent([item], 'reservation_form');
                        });
                    }
                }
                container.appendChild(cardElement.firstElementChild);
            }
        }
    });
}
// Helper function to replace placeholders in the template with data
function replacePlaceholders(template, data) {
    return template
        .replace('{{title}}', data.menu_name || data.drink_name || `Table: ${data.table}`)
        .replace('{{description}}', data.menu_ingredients || data.drink_description || '')
        .replace('{{price}}', data.menu_price || data.price || '')
        .replace('{{degrees}}', data.drink_degrees || data.degree_name || '')
        .replace('{{volume}}', data.drink_volume || data.volume || '')
        .replace('{{category}}', data.category_name || '')
        .replace('{{table}}', data.table || '')
        .replace('{{time}}', data.time || '')
        .replace('{{persons}}', data.persons || '')
        .replace('{{state}}', data.state || '')
        .replace('{{date}}', data.date || '')
        .replace('{{available}}', data.available || '')
        .replace('{{imagePath}}', data.imagePath || '/images/icons/no_picture.png');
}
// Helper function to fetch the template file
function loadTemplate(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load template from ${path}: ${response.statusText}`);
        }
        return response.text();
    });
}
// Handles the reservation form submission
function handleReservationSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const reservationData = {
        name: formData.get('name'),
        email: formData.get('email'),
        persons: formData.get('persons'),
        table: formData.get('table'),
        time: formData.get('time'),
        date: DateModel.getDate().toISOString().split('T')[0],
    };
    fetch('/app/api/submit_reservation.php', {
        method: 'POST',
        body: JSON.stringify(reservationData),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
        if (data.success) {
            alert('Reservation successful!');
            loadReservations(DateModel.getDate());
        }
        else {
            alert('Reservation failed: ' + data.error);
        }
    })
        .catch(error => {
        console.error('Error submitting reservation:', error);
        alert('An error occurred. Please try again.');
    });
}
// Gets the current page name from the URL
function getCurrentPage() {
    return window.location.pathname.split('/').pop() || '';
}
// Initializes the date picker for reservations
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
    updateDateButton(DateModel.getDate()); // Update date button text on initialization
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
    const formattedDate = date.toISOString().split('T')[0];
    const url = `/app/api/get_reservations.php?date=${formattedDate}`;
    DynamicContentModel.fetchData(url)
        .then((data) => {
        const reservations = data.map((item) => new ReservationModel(item)); // Using ReservationModel
        renderContent(reservations, 'reservation');
    })
        .catch((error) => console.error('Error loading reservations:', error));
}
