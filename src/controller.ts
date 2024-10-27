import {
    DateModel,
    DynamicContentModel,
    HeaderModel,
    ReservationModel,
    SlideshowModel,
    ThemeModel
} from './model.js';

// Wait for DOM content to load and then initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializePage();
        initializeThemeSwitch();
        HeaderModel.hideActivePageLink();
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

// Main initialization function
async function initializePage(): Promise<void> {
    ThemeModel.applyTheme();
    await loadComponents(['header', 'footer']);
    setupCardButtonListeners();
    initializeSlideshow();

    if (getCurrentPage() === 'reservations.html') {
        initializeDatePicker();
        loadReservations(DateModel.getDate());
    }
}

// Core page functions

// Function to get the current page name
function getCurrentPage(): string {
    return window.location.pathname.split('/').pop() || '';
}

// Event listeners for card buttons
function setupCardButtonListeners(): void {
    document.querySelectorAll('.load-card-button').forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            const contentType = (event.currentTarget as HTMLElement).dataset.content;
            contentType ? loadCard(contentType) : console.warn('No content type specified.');
        });
    });
}

// Load content card view based on content type (e.g., food, drink)
async function loadCard(contentType: string): Promise<void> {
    const container = getElement('#dynamic-content');
    if (!container) return;

    const templatePath = getTemplatePath(contentType);
    if (!templatePath) return console.error(`No template path found for "${contentType}"`);

    try {
        container.innerHTML = await loadTemplate(templatePath);
        container.classList.remove('hidden');
        loadCategoryDropdown(contentType, `${contentType}CategoryDropdown`);
    } catch (error) {
        console.error(`Error loading ${contentType} card:`, error);
    }
}

// Function to load an HTML template from a given path
async function loadTemplate(path: string): Promise<string> {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Error loading template from ${path}`);
    return await response.text();
}

// Initialize date picker for reservations
function initializeDatePicker(): void {
    const dateButton = getElement('#dateButton');
    if (!dateButton) return console.warn('Date button not found for date picker initialization.');

    if (!(dateButton as any)._flatpickrInstance) {
        flatpickr(dateButton, {
            enableTime: false,
            dateFormat: 'Y-m-d',
            defaultDate: DateModel.getDate(),
            onChange: (selectedDates: Date[]) => {
                const selectedDate = selectedDates[0];
                DateModel.setDate(selectedDate);
                updateDateButton(selectedDate);
                loadReservations(selectedDate);
            }
        });
    }
    updateDateButton(DateModel.getDate());
}

// Update date button with selected date
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

// Utility functions

// Map content types to template paths
function getTemplatePath(contentType: string): string | undefined {
    const paths: { [key: string]: string } = {
        menu: '/app/html/food_card.html',
        drink: '/app/html/drink_card.html'
    };
    return paths[contentType];
}

// Load category dropdown dynamically
async function loadCategoryDropdown(contentType: string, dropdownId: string): Promise<void> {
    const dropdown = document.getElementById(dropdownId) as HTMLSelectElement;
    if (!dropdown) return console.warn(`Dropdown "${dropdownId}" not found.`);

    try {
        const response = await fetch(`/app/api/get_categories.php?content=${contentType}`);
        const categories = await response.json();

        if (Array.isArray(categories)) {
            dropdown.innerHTML = `<option value="all">all</option>` + 
                categories.map(c => `<option value="${c.category_id}">${c.category_name}</option>`).join('');
            
            dropdown.addEventListener('change', (event) => {
                const selectedCategory = (event.target as HTMLSelectElement).value;
                loadContent(contentType, selectedCategory);
            });
        } else {
            dropdown.innerHTML = '<option>Error loading categories</option>';
        }
    } catch (error) {
        console.error('Category dropdown error:', error);
    }
}

// Load reservations for a specific date
function loadReservations(date: Date): void {
    const formattedDate = date.toISOString().split('T')[0];
    const url = `/app/api/get_reservations.php?date=${formattedDate}`;

    DynamicContentModel.fetchData(url)
        .then((data: any[]) => {
            const reservations = data.map((item) => new ReservationModel(item));
            renderContent(reservations, 'reservation');
        })
        .catch((error) => console.error('Error loading reservations:', error));
}

// Load content by category
function loadContent(contentType: string, category: string = 'all'): void {
    const url = `/app/api/get_${contentType}s.php${category !== 'all' ? `?category=${category}` : ''}`;

    DynamicContentModel.fetchData(url)
        .then(data => renderContent(data, contentType))
        .catch(error => console.error(`Error loading ${contentType} data:`, error));
}

// Render loaded content
async function renderContent(data: any[], contentType: string): Promise<void> {
    const container = getElement('#dynamic-content');
    if (!container) return;

    container.innerHTML = ''; // Clear existing content
    const templatePath = getTemplatePath(contentType);
    const baseImagePath = getBaseImagePath(contentType);

    if (!templatePath) return;

    for (const item of data) {
        item.imagePath = baseImagePath + (item.image_filename || 'placeholder.jpg');
        const template = await loadTemplate(templatePath);
        const cardContent = replacePlaceholders(template, item);

        const cardElement = document.createElement('div');
        cardElement.innerHTML = cardContent;
        container.appendChild(cardElement.firstElementChild!);
    }
}

// Utility to get base image path by content type
function getBaseImagePath(contentType: string): string {
    const paths: { [key: string]: string } = {
        menu: '/images/food/',
        drink: '/images/drinks/'
    };
    return paths[contentType] || '/images/';
}

// Replace placeholders in templates with actual data
function replacePlaceholders(template: string, data: any): string {
    return template
        .replace('{{title}}', data.menu_name || data.drink_name || `Table: ${data.table}`)
        .replace('{{description}}', data.menu_ingredients || data.drink_description || '')
        .replace('{{price}}', data.menu_price || data.price || '')
        .replace('{{degrees}}', data.drink_degrees || data.degree_name || '')
        .replace('{{volume}}', data.drink_volume || data.volume || '')
        .replace('{{category}}', data.category_name || '')
        .replace('{{imagePath}}', data.imagePath || '/images/icons/no_picture.png');
}

// Load external HTML components
async function loadComponents(components: string[]): Promise<void> {
    for (const component of components) {
        await loadExternalHTML(`/app/html/${component}.html`, component);
    }
}

// Fetch and insert external HTML into the page
async function loadExternalHTML(url: string, selector: string): Promise<void> {
    const element = getElement(selector);
    if (!element) return;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error loading ${url}`);
    element.innerHTML = await response.text();
}

// Initialize slideshow if applicable
function initializeSlideshow(): void {
    const slideshowContainer = getElement('.slideshow-container');
    if (!slideshowContainer) return;

    SlideshowModel.showSlides(SlideshowModel.slideIndex);
    setupSlideNavigation('.prev', () => SlideshowModel.prevSlide());
    setupSlideNavigation('.next', () => SlideshowModel.nextSlide());

    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.addEventListener('click', () => SlideshowModel.currentSlide(index + 1));
    });
}

// Set up slideshow navigation
function setupSlideNavigation(selector: string, callback: () => void): void {
    const button = getElement(selector);
    if (button) button.addEventListener('click', callback);
}

// Utility to get an HTML element and log if not found
function getElement(selector: string): HTMLElement | null {
    const element = document.querySelector(selector);
    if (!element) console.warn(`${selector} not found.`);
    return element as HTMLElement | null;
}

// Initialize theme switcher
function initializeThemeSwitch(): void {
    const toggleSwitch = getElement('#theme-checkbox') as HTMLInputElement;
    const modeText = getElement('#mode-text');

    if (!toggleSwitch || !modeText) {
        console.warn('Theme switch elements not found!');
        return;
    }

    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    updateTheme(isDarkMode);

    toggleSwitch.checked = isDarkMode;
    toggleSwitch.addEventListener('change', () => updateTheme(toggleSwitch.checked));
}

// Update theme and store preference
function updateTheme(isDarkMode: boolean): void {
    document.body.classList.toggle('dark-theme', isDarkMode);
    const modeText = getElement('#mode-text');
    if (modeText) modeText.textContent = isDarkMode ? 'Dark' : 'Light';
    localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
}
