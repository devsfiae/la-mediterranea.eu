// controller.ts initializes the main page components, loading external HTML (header and footer), initializing the theme switch, slideshow, and dynamic content.

import { DateModel, DynamicContentModel, HeaderModel, ReservationModel, SlideshowModel, ThemeModel } from 'model.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initializePage();
    const headerContent = await HeaderModel.fetchHeader();
    document.querySelector('header')!.innerHTML = headerContent;
    HeaderModel.hideActivePageLink();
});

// Main initialization function to set up the page components
async function initializePage(): Promise<void> {
    ThemeModel.applyTheme();

    // Load header and footer components
    await loadComponent('header', 'header');
    await loadComponent('footer', 'footer');

    const currentPage = getCurrentPage();

    // Check for slideshow container before initializing
    if (getElement('.slideshow-container')) {
        initializeSlideshow();
    }

    // Map pages to specific content types (for dynamic loading)
    const pageContentMap: { [key: string]: string } = {
        'food.html': 'menu',
        'drinks.html': 'drink',
        // Add more pages and content types here as needed
    };

    if (pageContentMap[currentPage]) {
        const contentType = pageContentMap[currentPage];
        initializeContentButton(contentType);
    }

    // Initialize the date picker if available
    if (getElement('#dateButton')) {
        initializeDatePicker();
        loadReservations(DateModel.getDate());
    }
}

// Sets up the content button to dynamically load specific content
function initializeContentButton(contentType: string): void {
    const contentButton = getElement('#content-button');
    if (!contentButton) {
        console.warn('Content button not found.');
        return;
    }

    contentButton.addEventListener('click', (event) => {
        event.preventDefault();

        // Hide slideshow elements if present
        const slideshowContainer = getElement('.slideshow-container');
        const dotsContainer = getElement('.dots-container');
        if (slideshowContainer) slideshowContainer.style.display = 'none';
        if (dotsContainer) dotsContainer.style.display = 'none';

        // Show dynamic content container
        const dynamicContent = getElement('#dynamic-content');
        if (dynamicContent) {
            dynamicContent.style.display = 'flex';
        }

        // Load and display dynamic content based on content type
        loadContent(contentType, 'all');
    });
}

// Utility function to select an element and log a warning if not found
function getElement(selector: string): HTMLElement | null {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`${selector} not found.`);
    }
    return element as HTMLElement | null;
}

// Loads external HTML components (header, footer) asynchronously
async function loadComponent(component: 'header' | 'footer', selector: string): Promise<void> {
    try {
        await loadExternalHTML(`/app/html/${component}.html`, selector);
        if (component === 'header') {
            initializeThemeSwitch(); // Initialize the theme switch after header loads
        }
    } catch (error) {
        console.error(`Error loading ${component}:`, error);
    }
}

// Loads external HTML into a specified element
async function loadExternalHTML(url: string, elementSelector: string): Promise<void> {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error loading ${url}: ${response.statusText}`);
        const data = await response.text();
        const element = getElement(elementSelector);
        if (element) element.innerHTML = data;
    } catch (error) {
        console.error(error);
    }
}

// Initializes the theme switch for dark/light mode
function initializeThemeSwitch(): void {
    const toggleSwitch = getElement('#theme-checkbox') as HTMLInputElement;
    const modeText = getElement('#mode-text');

    if (!toggleSwitch || !modeText) {
        console.warn('Theme switch elements not found!');
        return;
    }

    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    const updateTheme = (isDarkMode: boolean) => {
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
function initializeSlideshow(): void {
    SlideshowModel.showSlides(SlideshowModel.slideIndex);

    setupSlideNavigation('.prev', () => SlideshowModel.prevSlide());
    setupSlideNavigation('.next', () => SlideshowModel.nextSlide());

    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => SlideshowModel.currentSlide(index + 1));
    });
}

// Sets up event listeners for slideshow navigation
function setupSlideNavigation(selector: string, callback: () => void): void {
    const button = getElement(selector);
    if (button) {
        button.addEventListener('click', callback);
    }
}

// Loads and renders dynamic content based on the specified type and category
function loadContent(contentType: string, category: string): void {
    const url = category === 'all'
        ? `app/api/get_${contentType}s.php`
        : `app/api/get_${contentType}s.php?category=${category}`;

    DynamicContentModel.fetchData(url)
        .then((data: any[]) => {
            renderContent(data, contentType);
        })
        .catch((error) => console.error(`Error when loading ${contentType}s:`, error.message));
}

// Renders content (menus, drinks) based on loaded data
function renderContent(data: any[], contentType: string): void {
    const container = getElement('#dynamic-content');
    if (!container) {
        console.warn('Container for dynamic content not found.');
        return;
    }

    container.innerHTML = ''; // Clear container

    data.forEach(item => {
        let id = '';
        let title = '';
        let description = '';
        let price = '';

        if (contentType === 'menu') {
            id = item.menu_id;
            title = item.menu_name;
            description = item.menu_ingredients;
            price = item.menu_price;
        } else if (contentType === 'drink') {
            id = item.cocktail_id;
            title = item.cocktail_name;
            description = item.cocktail_description;
            price = item.price;
        } else if (contentType === 'event') {
            id = item.event_id;
            title = item.event_name;
            description = item.event_description;
            price = '';
        }

        const cardContent = `
            <div class="card">
                <h3>${title}</h3>
                <p>${description}</p>
                ${price ? `<p>Preis: ${price} €</p>` : ''}
            </div>
        `;

        const link = document.createElement('a');
        link.href = `${contentType}_card.html?id=${id}`;
        link.innerHTML = cardContent;

        container.appendChild(link);
    });
}

// Loads and initializes the date picker
function initializeDatePicker(): void {
    const dateButton = getElement('#dateButton');
    if (dateButton && !dateButton._flatpickrInstance) {
        flatpickr(dateButton, {
            enableTime: false,
            dateFormat: 'Y-m-d',
            defaultDate: DateModel.getDate(),
            onChange: function (selectedDates: Date[]) {
                const selectedDate = selectedDates[0];
                DateModel.setDate(selectedDate);
                updateDateButton(selectedDate);
                loadReservations(selectedDate);
            }
        });
    }
}

// Updates date button with selected date
function updateDateButton(date: Date): void {
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
function loadReservations(date: Date): void {
    ReservationModel.fetchReservations(date)
        .then(reservations => {
            renderReservations(reservations);
        })
        .catch(error => console.error('Error loading reservations:', error));
}

// Renders reservation data
function renderReservations(reservations: any[]): void {
    const container = getElement('#reservation-container');
    if (container) {
        container.innerHTML = reservations.length
            ? reservations.map(reservation => createReservationCard(reservation)).join('')
            : '<p>No reservations available for this date.</p>';
    }
}

// Creates HTML for each reservation card
function createReservationCard(reservation: any): string {
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
function getCurrentPage(): string {
    return window.location.pathname.split('/').pop() || '';
}
