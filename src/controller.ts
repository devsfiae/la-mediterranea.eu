// controller.ts is the main entry point for the application. It initializes the page and loads external components, such as the header and footer. It also initializes the theme switch, slideshow, and dynamic content loading.

import { SlideshowModel, HeaderModel, DynamicContentModel, DrinksModel, DateModel, ReservationModel } from '../dist/model.js';

document.addEventListener('DOMContentLoaded', () => {
  initializePage();
});

function initializePage(): void {
  loadComponent('header', 'header');
  loadComponent('footer', 'footer');

  const currentPage = getCurrentPage();

  if (getElement('.slideshow-container')) {
      initializeSlideshow();
  }

  // Mapping of pages to content types
  const pageContentMap: { [key: string]: string } = {
      'food.html': 'menu',
      'drinks.html': 'drink',
      // Add more pages and content types here
  };

  if (pageContentMap[currentPage]) {
      const contentType = pageContentMap[currentPage];
      initializeContentButton(contentType);
  }

  // Initialise the date picker, if available
  if (getElement('#dateButton')) {
      initializeDatePicker();
      loadReservations(DateModel.getDate());
  }
}

// Initialize the content button to load dynamic content
function initializeContentButton(contentType: string): void {
  const contentButton = getElement('#content-button');
  if (!contentButton) {
      console.warn('Content button not found.');
      return;
  }

  contentButton.addEventListener('click', (event) => {
      event.preventDefault();

      // Hide slideshow elements
      const slideshowContainer = getElement('.slideshow-container');
      const dotsContainer = getElement('.dots-container');
      if (slideshowContainer) slideshowContainer.style.display = 'none';
      if (dotsContainer) dotsContainer.style.display = 'none';

      // Display dynamic content container
      const dynamicContent = getElement('#dynamic-content');
      if (dynamicContent) {
          dynamicContent.style.display = 'flex';
      }

      // Load and display dynamic content
      loadContent(contentType, 'all');
  });
}

// Utility function to get an element and log a warning if not found
function getElement(selector: string): HTMLElement | null {
  const element = document.querySelector(selector);
  if (!element) {
    console.warn(`${selector} not found.`);
  }
  return element as HTMLElement | null;
}

// Load external HTML components (e.g., header, footer)
function loadComponent(component: 'header' | 'footer', selector: string): void {
  loadExternalHTML(`/app/html/${component}.html`, selector)
    .then(() => {
      if (component === 'header') {
        initializeThemeSwitch(); // Initialize the theme switch after header is loaded
      }
    });
}

// Function to load external HTML into a specific element and return a Promise
function loadExternalHTML(url: string, elementSelector: string): Promise<void> {
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
    })
    .catch(error => console.error(error));
}

// Theme switch initialization
function initializeThemeSwitch(): void {
  const toggleSwitch = getElement('#theme-checkbox') as HTMLInputElement;
  const modeText = getElement('#mode-text');

  if (!toggleSwitch || !modeText) {
    console.warn('Theme switch elements not found!');
    return;
  }

  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  // Function for updating the theme
  const updateTheme = (isDarkMode: boolean) => {
      document.body.classList.toggle('dark-theme', isDarkMode);
      modeText.textContent = isDarkMode ? 'light' : 'dark';
      localStorage.setItem('darkMode', isDarkMode.toString());
  };

  updateTheme(isDarkMode);
  toggleSwitch.checked = isDarkMode;

  // Event Listener for Theme-Switch
  toggleSwitch.addEventListener('change', () => {
    updateTheme(toggleSwitch.checked);
  });
}

// Slideshow initialization
function initializeSlideshow(): void {
  SlideshowModel.showSlides(SlideshowModel.slideIndex);

  setupSlideNavigation('.prev', SlideshowModel.prevSlide.bind(SlideshowModel));
  setupSlideNavigation('.next', SlideshowModel.nextSlide.bind(SlideshowModel));

  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => SlideshowModel.currentSlide(index + 1));
  });
}

// Setup event listeners for slide navigation buttons
function setupSlideNavigation(selector: string, callback: () => void): void {
  const button = getElement(selector);
  if (button) {
    button.addEventListener('click', callback);
  }
}

// Load and render dynamic content (menus, cocktails)
function loadContent(contentType: string, category: string): void {
  const url = category === 'all'
      ? `app/api/get_${contentType}s.php`
      : `app/api/get_${contentType}s.php?category=${category}`;

  DynamicContentModel.fetchData(url)
      .then((data: any[]) => {
          renderContent(data, contentType);
      })
      .catch((error: Error) => console.error(`Error when loading ${contentType}s:`, error.message));
}

// Function to render content (menus, drinks) based on loaded data
function renderContent(data: any[], contentType: string): void {
  const container = getElement('#dynamic-content');

  if (!container) {
      console.warn('Container for dynamic content not found.');
      return;
  }

  container.innerHTML = ''; // Empty container

  data.forEach(item => {
      let id = '';
      let title = '';
      let description = '';
      let price = '';

      // Mapping the fields based on the content type
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
          // Example of another content type
          id = item.event_id;
          title = item.event_name;
          description = item.event_description;
          price = ''; // Price may not be relevant
      }

      // Create map content
      const cardContent = `
          <div class="card">
              <h3>${title}</h3>
              <p>${description}</p>
              ${price ? `<p>Preis: ${price} €</p>` : ''}
          </div>
      `;

      // Create a link around the map if detailed pages are available
      const link = document.createElement('a');
      link.href = `${contentType}_card.html?id=${id}`;
      link.innerHTML = cardContent;

      container.appendChild(link);
  });
}

// Function to render individual cards from the HTML template
function renderCard(item: any, type: 'menu' | 'drink'): HTMLElement {
  const card = document.createElement('div');
  card.classList.add('card');

  let templateUrl = '';
  if (type === 'menu') {
    templateUrl = 'app/html/menu_card.html';
  } else if (type === 'drink') {
    templateUrl = 'app/html/drink_card.html';
  }

  // Load template and populate card with item data
  loadTemplate(templateUrl).then(template => {
    let title = '';
    let description = '';
    let price = '';

    if (type === 'menu') {
      title = item.menu_name;
      description = item.menu_ingredients;
      price = item.menu_price;
    } else if (type === 'drink') {
      title = item.cocktail_name;
      description = item.cocktail_description;
      price = item.price;
    }

    const renderedHtml = template
      .replace('{{title}}', title)
      .replace('{{description}}', description)
      .replace('{{price}}', price ? `${price} €` : '');

    card.innerHTML = renderedHtml;
  });

  return card;
}

// Function to load HTML templates
function loadTemplate(templateUrl: string): Promise<string> {
  return fetch(templateUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error loading template from ${templateUrl}`);
      }
      return response.text();
    });
}

// Initialize date picker and handle date changes
function initializeDatePicker(): void {
  const dateButton = getElement('#dateButton');
  if (dateButton && !dateButton._flatpickr) {
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

// Update date button text with the selected date
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

// Load reservations for a specific date
function loadReservations(date: Date): void {
  ReservationModel.fetchReservations(date)
    .then(reservations => {
      renderReservations(reservations);
    })
    .catch(error => console.error('Error loading reservations:', error));
}

// Render reservations
function renderReservations(reservations: any[]): void {
  const container = getElement('#reservation-container');
  if (container) {
    container.innerHTML = reservations.length
      ? reservations.map(reservation => createReservationCard(reservation)).join('')
      : '<p>Keine Reservierungen für dieses Datum verfügbar.</p>';
  }
}

// Create HTML for a reservation card (placeholder function for actual template logic)
function createReservationCard(reservation: any): string {
  return `
    <div class="card">
      <p>table: ${reservation.table}</p>
      <p>persons: ${reservation.persons}</p>
      <p>time: ${reservation.time}</p>
      <p>state0,0,: ${reservation.state}</p>
    </div>
  `;
}

// Get the current page name from the URL
function getCurrentPage(): string {
  return window.location.pathname.split('/').pop() || '';
}
