// controller.js

import { SlideshowModel, HeaderModel, DynamicContentModel, CocktailsModel, DateModel, ReservationModel } from './model.js';

// Wait for the DOM to be fully loaded
function initializePage() {
    loadHeader();
    loadFooter();

    if (getElement('.slideshow-container')) {
        initializeSlideshow();
    }

    const currentPage = window.location.pathname.split('/').pop();
    if (['card.html', 'menus.html', 'food.html', 'cocktails.html'].includes(currentPage)) {
        loadPageContent(currentPage);
    }

    if (getElement('#dateButton')) {
        initializeDatePicker();
        loadReservations(DateModel.getDate());
    }
}

// Call the initializer on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializePage);

// Utility function to get an element and log a warning if not found
function getElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        console.warn(`${selector} not found.`);
    }
    return element;
}

// Utility function to load external HTML
function loadExternalHTML(url, elementSelector) {
    return fetch(url)
        .then(response => response.text())
        .then(data => {
            const element = getElement(elementSelector);
            if (element) {
                element.innerHTML = data;
            }
        })
        .catch(error => console.error(`Error loading ${url}:`, error));
}



// Function to load header from external file
function loadHeader() {
    loadExternalHTML('html/header.html', 'header')
        .then(() => {
            initializeThemeSwitch();
            HeaderModel.hideActivePageLink();
        });
}

// Function to load footer from external file
function loadFooter() {
    loadExternalHTML('html/footer.html', 'footer');
}

function initializeThemeSwitch() {
    const toggleSwitch = getElement('#theme-checkbox');
    const modeText = getElement('#mode-text');
    if (!toggleSwitch || !modeText) return;

    const updateTheme = (isDarkMode) => {
        document.body.classList.toggle('dark-theme', isDarkMode);
        modeText.textContent = isDarkMode ? 'light' : 'dark';
        localStorage.setItem('darkMode', isDarkMode.toString());
    };

    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    updateTheme(isDarkMode);

    toggleSwitch.addEventListener('change', () => {
        updateTheme(toggleSwitch.checked);
    });
}
// Function to initialize the slideshow
function initializeSlideshow() {
    SlideshowModel.showSlides(SlideshowModel.slideIndex);

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

// Function to load content based on the current page
function loadPageContent(currentPage) {
    if (currentPage === 'cocktails.html') {
        loadCocktails('all');
    } else {
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

// Function to debounce a function
function debounce(fn, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

// Function to initialize the date picker on the date button
function initializeDatePicker() {
    const dateButton = document.getElementById('dateButton');

    if (!dateButton) {
        console.warn('Date button not found.');
        return;
    }

    // Ensure flatpickr is initialized only once
    if (!dateButton._flatpickr) {
        flatpickr(dateButton, {
            enableTime: false,
            dateFormat: "Y-m-d",
            defaultDate: DateModel.getDate(),
            onChange: function (selectedDates, dateStr, instance) {
                // Update model with the selected date
                DateModel.setDate(selectedDates[0]);
                // Update button text
                updateDateButton(selectedDates[0]);
                // Load reservations for the selected date
                loadReservations(selectedDates[0]);
            },
            clickOpens: true
        });
    }

    // Explicitly update the date button with the current date on page load
    updateDateButton(DateModel.getDate());
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

// Function to load reservations for a specific date
function loadReservations(date) {
    // Check if the reservation container exists
    const container = document.getElementById('reservation-container');
    if (!container) {
        console.warn('Reservation container not found.');
        return;
    }

    ReservationModel.fetchReservations(date)
        .then(reservations => {
            renderReservations(reservations);
        })
        .catch(error => {
            console.error('Error loading the reservations:', error);
            container.innerHTML = '<p>Error loading the reservations.</p>';
        });
}

// Function to create a reservation card from a template and reservation data
function createReservationCard(template, reservation) {
    let cardHtml = template
        .replace(/{{table}}/g, reservation.table)
        .replace(/{{persons}}/g, reservation.persons)
        .replace(/{{state}}/g, reservation.state)
        .replace(/{{time}}/g, reservation.time);

    // If the reservation is not available, remove the reservation button
    if (!reservation.available) {
        cardHtml = cardHtml.replace(/<button.*<\/button>/, '');
    }

    return cardHtml;
}

// Function to show the selected card and the reservation form
function showReservationForm(table, time) {
    const container = document.getElementById('reservation-container');

    // Ensure the container exists
    if (!container) {
        console.warn('Reservation container not found.');
        return;
    }

    // Fetch the reservation form HTML and insert it into the container
    fetch('html/reservation_form.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load reservation form.');
            }
            return response.text();
        })
        .then(html => {
            // Replace placeholders with actual values
            html = html.replace('{{table}}', table)
            .replace('{{time}}', time);

            container.innerHTML = html;

            // Now that the HTML is loaded, add the event listener to the form
            const form = document.querySelector('.reservation-form');

            if (form) {
                form.addEventListener('submit', (event) => {
                    handleFormSubmit(event, table, time);
                });
            } else {
                console.warn('Reservation form not found.');
            }
        })
        .catch(error => {
            console.error('Error loading reservation form:', error);
        });
}

// Then define renderReservations
function renderReservations(reservations) {
    const container = getElement('#reservation-container');
    if (!container) return;

    container.innerHTML = ''; // Inhalt leeren

    if (!reservations || reservations.length === 0) {
        container.innerHTML = '<p>Keine Reservierungen für dieses Datum verfügbar.</p>';
        return;
    }

    
// Laden des reservation_card.html Templates
fetch('html/reservation_card.html')
.then(response => response.text())
.then(template => {
    const container = getElement('#reservation-container');
    if (!container) return;

    container.innerHTML = ''; // Inhalt leeren

    const cardsContainer = document.createElement('div');
    cardsContainer.classList.add('card-container');

    // Sortieren der Reservierungen nach Zeit und Tisch
    const sortedReservations = reservations.sort((a, b) => {
        if (a.time < b.time) return -1;
        if (a.time > b.time) return 1;
        if (a.table < b.table) return -1;
        if (a.table > b.table) return 1;
        return 0;
    });

    sortedReservations.forEach(reservation => {
        // Erstellen der Reservierungskarte aus dem Template
        let cardHtml = template
            .replace(/{{table}}/g, reservation.table)
            .replace(/{{persons}}/g, reservation.persons)
            .replace(/{{state}}/g, reservation.state)
            .replace(/{{time}}/g, reservation.time); // Zeit hinzufügen

        // Bedingtes Rendern des Reservierungsbuttons
        if (reservation.available) {
            cardHtml = cardHtml.replace(/{{#if available}}([\s\S]*?){{\/if}}/g, '$1');
        } else {
            cardHtml = cardHtml.replace(/{{#if available}}([\s\S]*?){{\/if}}/g, '');
        }

        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = cardHtml;
        cardsContainer.appendChild(card);

        // Fügen Sie das Klick-Event zum Reservierungsbutton hinzu
        const reserveButton = card.querySelector('.primary-btn');
        if (reserveButton) {
            reserveButton.addEventListener('click', () => {
                showReservationForm(reservation.table, reservation.time);
            });
        }
    });

    container.appendChild(cardsContainer);
})
.catch(error => console.error('Fehler beim Laden der Reservierungskarten:', error));

}
// Function to handle form submission with table and time
function handleFormSubmit(event, table, time) {
    event.preventDefault(); // Prevent the default form submission
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const persons = document.getElementById('persons').value;

    if (!name || !email || !persons) {
        alert('All information is required.');
        return;
    }

    const reservationData = {
        name: name,
        email: email,
        date: DateModel.getDate().toISOString().split('T')[0], // Ensure the date is formatted as 'YYYY-MM-DD'
        time: time,
        table: table,
        persons: persons
    };

    // Save reservation
ReservationModel.setReservation(reservationData)
.then(response => {
    if (response.success) {
        alert(`Reservation successful for ${reservationData.name}, ${reservationData.persons} person(s) on ${reservationData.date} at ${reservationData.time}!\nEmail sent to ${reservationData.email}`);
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