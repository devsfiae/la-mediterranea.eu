// controller.ts initializes the main page components, loading external HTML (header and footer), initializing the theme switch, slideshow, and dynamic content.

import {
    DateModel,
    DynamicContentModel,
    HeaderModel,
    ReservationModel,
    SlideshowModel,
    ThemeModel
} from './model.js';

// Wait for the DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializePage();
        HeaderModel.hideActivePageLink();
        initializeThemeSwitch(); // Initialize theme switch after header is loaded
    } catch (error) {
        console.error('Error during initial page setup:', error);
    }
});

// Main initialization function to set up the page components
async function initializePage(): Promise<void> {
    ThemeModel.applyTheme();

    // Load header and footer components
    await loadComponent('header', 'header');
    await loadComponent('footer', 'footer');

    const currentPage = getCurrentPage();

    // Initialize slideshow if present
    const slideshowContainer = getElement('.slideshow-container');
    if (slideshowContainer) {
        initializeSlideshow();
    } else {
        console.warn('Slideshow container not found.');
    }

    // Map pages to specific content types (for dynamic loading)
    const pageContentMap: { [key: string]: { contentType: string; buttonId?: string } } = {
        'food.html': { contentType: 'menu', buttonId: 'foodcard_button' },
        'drinks.html': { contentType: 'drink', buttonId: 'drinkcard_button' },
        'reservations.html': { contentType: 'reservation' },
    };

    if (pageContentMap[currentPage]) {
        const { contentType, buttonId } = pageContentMap[currentPage];

        if (contentType === 'reservation') {
            initializeDatePicker(); // Initialize date picker for reservations
            loadReservations(DateModel.getDate()); // Load reservations for the current date
        } else if (buttonId) {
            initializeContentButton(contentType, buttonId);
        }
    }
}

// Sets up the content button to dynamically load specific content
function initializeContentButton(contentType: string, buttonId: string): void {
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
        if (slideshowContainer) slideshowContainer.style.display = 'none';
        if (dotsContainer) dotsContainer.style.display = 'none';

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

// Sets up navigation buttons for the slideshow
function setupSlideNavigation(selector: string, callback: () => void): void {
    const button = getElement(selector);
    if (button) {
        button.addEventListener('click', callback);
    }
}

// Loads and renders dynamic content based on the specified type and category
function loadContent(contentType: string, category: string): void {
    const url = category === 'all'
        ? `../api/get_${contentType}s.php`
        : `../api/get_${contentType}s.php?category=${category}`;

    DynamicContentModel.fetchData(url)
        .then((data: any[]) => {
            renderContent(data, contentType);
        })
        .catch((error) => console.error(`Error when loading ${contentType}s:`, error));
}

// Renders content (menus, drinks, reservations) based on loaded data
function renderContent(data: any[], contentType: string): void {
    let container: HTMLElement | null;
    if (contentType === 'reservation') {
        container = getElement('#reservation-container');
    } else {
        container = getElement('#dynamic-content');
    }

    if (!container) {
        console.warn('Container for dynamic content not found.');
        return;
    }

    container.innerHTML = ''; // Clear the container

    data.forEach(item => {
        let cardContent = '';

        if (contentType === 'menu' || contentType === 'drink') {
            const title = item.menu_name || item.drink_name;
            const description = item.menu_ingredients || item.drink_ingredients;
            const price = item.menu_price || item.drink_price;
            const imageUrl = contentType === 'menu'
                ? `../../images/food/${item.image_filename}`
                : `../../images/drinks/${item.image_filename}`;

            cardContent = `
                <div class="card">
                    <img src="${imageUrl}" alt="${title}" class="card-image" onerror="this.onerror=null;this.src='../../images/icons/no_picture.png';">
                    <h3 class="card-title">${title}</h3>
                    <p class="card-text">${description}</p>
                    ${price ? `<p>Price: ${price} €</p>` : ''}
                </div>
            `;
        } else if (contentType === 'reservation') {
            const table = item.table;
            const time = item.time;
            const persons = item.persons;
            const state = item.state;
            const available = item.available;
            const imageUrl = `../../images/bar/table_${table}.png`;

            cardContent = `
                <div class="card">
                    <img src="${imageUrl}" alt="Table ${table}" class="card-image" onerror="this.onerror=null;this.src='../../images/icons/no_picture.png';">
                    <h3 class="card-title">Table: ${table}</h3>
                    <p class="card-text">Time: ${time}</p>
                    <p class="card-text">Persons: ${persons}</p>
                    <p class="card-text">Status: ${state}</p>
                    ${available ? `<button class="btn primary-btn" data-table="${table}" data-time="${time}">Reserve</button>` : ''}
                </div>
            `;
        }

        const cardElement = document.createElement('div');
        cardElement.innerHTML = cardContent;

        container.appendChild(cardElement.firstElementChild!);
    });

    // Add event listeners for reservation buttons
    if (contentType === 'reservation') {
        const reserveButtons = container.querySelectorAll('.btn.primary-btn');
        reserveButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const target = event.currentTarget as HTMLElement;
                const table = target.getAttribute('data-table');
                const time = target.getAttribute('data-time');
                openReservationForm(table, time);
            });
        });
    }
}

// Opens the reservation form for a specific table and time
function openReservationForm(table: string | null, time: string | null): void {
    fetch('../html/reservation_form.html')
        .then(response => response.text())
        .then(html => {
            // Replace placeholders with actual values
            html = html.replace('{{table}}', table || '')
                       .replace('{{time}}', time || '');

            const container = getElement('#reservation-container');
            if (container) {
                container.innerHTML = html;

                // Add event listener for the reservation form
                const form = container.querySelector('.reservation-form') as HTMLFormElement;
                if (form) {
                    form.addEventListener('submit', handleReservationSubmit);
                }
            }
        })
        .catch(error => console.error('Error loading reservation form:', error));
}

// Handles the reservation form submission
function handleReservationSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const reservationData = {
        name: formData.get('name'),
        email: formData.get('email'),
        persons: formData.get('persons'),
        table: formData.get('table'),
        time: formData.get('time'),
        date: DateModel.getDate().toISOString().split('T')[0],
    };

    fetch('../api/submit_reservation.php', {
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
        } else {
            alert('Reservation failed: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error submitting reservation:', error);
        alert('An error occurred. Please try again.');
    });
}

// Gets the current page name from the URL
function getCurrentPage(): string {
    return window.location.pathname.split('/').pop() || '';
}

// Initializes the date picker for reservations
function initializeDatePicker(): void {
    const dateButton = getElement('#dateButton');
    if (dateButton && !(dateButton as any)._flatpickrInstance) {
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
    updateDateButton(DateModel.getDate()); // Update date button text on initialization
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
    const formattedDate = date.toISOString().split('T')[0]; // Date in 'YYYY-MM-DD' format
    const url = `../api/get_reservations.php?date=${formattedDate}`;

    DynamicContentModel.fetchData(url)
        .then((data: any[]) => {
            renderContent(data, 'reservation');
        })
        .catch((error) => console.error('Error loading reservations:', error));
}