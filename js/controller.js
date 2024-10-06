// controller.js
import { SlideshowModel, HeaderModel, DynamicContentModel, CocktailsModel, DateModel, ReservationModel } from './model.js';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Header-Element abrufen
    const headerElement = document.querySelector('header');
    if (headerElement && headerElement.innerHTML.trim() === '') {
        // Header is empty, load it dynamically
        loadHeader();
    } else {
        // Header already exists, initialize dependent functions
        initializeThemeSwitch();
        HeaderModel.hideActivePageLink();
    }

    // Retrieve footer element
    const footerElement = document.querySelector('footer');
    if (footerElement && footerElement.innerHTML.trim() === '') {
        // Footer is empty, load it dynamically
        loadFooter();
    }

    // Determine current page
    const currentPage = window.location.pathname.split('/').pop();

    // When we are on the menu or cocktails page
    if (currentPage === 'card.html' || currentPage === 'menus.html' || currentPage === 'food.html' || currentPage === 'cocktails.html') {
        if (currentPage === 'cocktails.html') {
            // Load cocktails data when on the cocktails page
            loadCocktails('all');
        } else {
            // Load menu data when on menu-related pages
            loadMenus('all');
        }

        // Add event listeners for the category dropdown
        const categoryDropdown = document.getElementById('category-dropdown');
        if (categoryDropdown) {
            categoryDropdown.addEventListener('change', (e) => {
                const selectedCategory = e.target.value;
                if (currentPage === 'cocktails.html') {
                    loadCocktails(selectedCategory);
                } else {
                    loadMenus(selectedCategory);
                }
            });
        }
    } else {
        // Check for other pages whether dynamic content needs to be loaded
        const dynamicContentElement = document.getElementById('dynamic-content');
        if (dynamicContentElement && dynamicContentElement.children.length === 0) {
            // Load dynamic content (if required)
        }
    }

    // Initialize the slideshow, if available
    initializeSlideshow();

    // Initialize the date picker on the date button
    initializeDatePicker();

    // Load the reservations for the initial date
    loadReservations(DateModel.getDate());
});

// Function to initialize the slideshow
function initializeSlideshow() {
    // Initialize the slideshow
    SlideshowModel.showSlides(SlideshowModel.slideIndex);

    // Event listener for the navigation arrows
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

    // Event listener for the dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            SlideshowModel.currentSlide(index + 1);
        });
    });
}

// Function to load menus based on category
function loadMenus(category) {
    const url = category === 'all' ? 'app/api/get_menues.php' : `app/api/get_menues.php?category=${category}`;
    DynamicContentModel.fetchData(url)
        .then(menus => {
            DynamicContentModel.renderContent(menus, 'menu');
        })
        .catch(error => {
            console.error('Error rendering menus:', error);
        });
}

// Function to load cocktails based on category
function loadCocktails(category) {
    const url = category === 'all' ? 'app/api/get_drinks.php' : `app/api/get_drinks.php?category=${category}`;
    CocktailsModel.fetchCocktails(category)
        .then(cocktails => {
            DynamicContentModel.renderContent(cocktails, 'cocktail');
        })
        .catch(error => {
            console.error('Error rendering cocktails:', error);
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


// Aktualisieren der Funktion `initializeDatePicker`
function initializeDatePicker() {
    const dateButton = document.getElementById('dateButton');

    if (!dateButton) {
        console.warn('Datum-Button nicht gefunden.');
        return;
    }

    // Initiales Datum auf dem Button anzeigen
    updateDateButton(DateModel.getDate());

    // Flatpickr auf dem Button initialisieren
    flatpickr(dateButton, {
        enableTime: false,
        dateFormat: "Y-m-d",
        defaultDate: DateModel.getDate(),
        onChange: function(selectedDates, dateStr, instance) {
            // Modell mit dem ausgewählten Datum aktualisieren
            DateModel.setDate(selectedDates[0]);
            // Button-Text aktualisieren
            updateDateButton(selectedDates[0]);
            // Reservierungen für das ausgewählte Datum laden
            loadReservations(selectedDates[0]);
        },
        clickOpens: true
    });
}

// Function for loading the reservations for a specific date
function loadReservations(date) {
    ReservationModel.fetchReservations(date)
        .then(reservations => {
            renderReservations(reservations);
        })
        .catch(error => {
            console.error('Error loading the reservations:', error);
        });
}

// Function for displaying reservations
function renderReservations(reservations) {
    const container = document.getElementById('reservation-container');
    container.innerHTML = ''; // Delete existing content

    if (reservations.length === 0) {
        container.innerHTML = '<p>No reservations available for this date.</p>';
        return;
    }

    // Group reservations by time slot
    const reservationsByTime = {};
    reservations.forEach(reservation => {
        const time = reservation.time;
        if (!reservationsByTime[time]) {
            reservationsByTime[time] = [];
        }
        reservationsByTime[time].push(reservation);
    });

    // Render the reservations for each time slot
    Object.keys(reservationsByTime).forEach(time => {
        const timeSlotReservations = reservationsByTime[time];

        // Create container for this time window
        const timeSlotContainer = document.createElement('div');
        timeSlotContainer.classList.add('time-slot-container');

        // Add heading for the time window
        const timeHeader = document.createElement('h2');
        timeHeader.textContent = `${time}`;
        timeSlotContainer.appendChild(timeHeader);

        // Create containers for the cards
        const cardsContainer = document.createElement('div');
        cardsContainer.classList.add('card-container');

        // Create tickets for each reservation in this time slot
        timeSlotReservations.forEach(reservation => {
            const card = document.createElement('div');
            card.classList.add('card');

            // Add reservation details to the card
            card.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">table ${reservation.table}</h3>
                </div>
                <hr class="divider">
                <p class="card-description">
                    people: ${reservation.persons}<br>
                    ${reservation.state}
                </p>
                ${reservation.available ? `<button class="primary-btn" data-table="${reservation.table}" data-time="${reservation.time}">reserve</button>` : ''}
            `;

            cardsContainer.appendChild(card);
        });

        timeSlotContainer.appendChild(cardsContainer);
        container.appendChild(timeSlotContainer);
    });

    // Event Listener für die Reservierungsbuttons hinzufügen
    const reserveButtons = document.querySelectorAll('.primary-btn');
    reserveButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const table = e.target.getAttribute('data-table');
            const time = e.target.getAttribute('data-time');
            // Reservierungsprozess starten
            makeReservation(table, time);
        });
    });
}

// Funktion zum Erstellen einer Reservierung
function makeReservation(table, time) {
    // Notwendige Daten sammeln, z.B. Name, E-Mail, etc.
    const name = prompt('Bitte geben Sie Ihren Namen ein:');
    const email = prompt('Bitte geben Sie Ihre E-Mail-Adresse ein:');
    const persons = prompt('Anzahl der Personen:');

    if (!name || !email || !persons) {
        alert('Alle Informationen sind erforderlich.');
        return;
    }

    const reservationData = {
        name: name,
        email: email,
        date: DateModel.getDate().toISOString().split('T')[0],
        time: time,
        table: table,
        persons: persons
    };
    console.log('Reservation Data:', reservationData);

    // Save reservation
    ReservationModel.setReservation(reservationData)
            .then(response => {
            if (response.success) {
                alert('Reservation successful!');
                // Reload reservations
                loadReservations(DateModel.getDate());
            } else {
                alert('Error in the reservation: ' + response.message);
            }
        })
        .catch(error => {
            console.error('Error saving the reservation:', error);
            alert('Error in the reservation.');
        });
}

// Function to update the date button with the selected date
function updateDateButton(date) {
    const dateButton = document.getElementById('dateButton');
    if (dateButton) {
        // Format the date as desired
        const options = { 
            year: 'numeric', month: 'long', day: 'numeric'
        };
        const dateString = date.toLocaleDateString('de-DE', options);
        dateButton.textContent = dateString;
    }
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