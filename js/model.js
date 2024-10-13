// model.js

// Handles saving/loading theme preferences
export const ThemeModel = {
    saveThemePreference: (isDarkMode) => {
        localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false'); // Save as a string 'true' or 'false'
    },
    getThemePreference: () => {
        return localStorage.getItem('darkMode') === 'true';  // Convert to boolean
    }
};

// Handles fetching and logic for the header
export const HeaderModel = {
    fetchHeader: () => {
        return fetch('header.html')
            .then(response => response.text())
            .catch(error => {
                console.error('Error fetching header:', error);
                throw error;
            });
    },

    getCurrentPage: () => {
        return window.location.pathname.split('/').pop();
    },

    hideActivePageLink: () => {
        const currentPage = HeaderModel.getCurrentPage(); // Get the current page's URL
        const navLinks = document.querySelectorAll('.header-center ul li a'); // Select all navigation links

        // Loop through all the links to hide the one matching the current page
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.parentElement.style.display = 'none';  // Hide the current page link
            }
        });
    }
};

// Handles slideshow functionality
export const SlideshowModel = {
    slideIndex: 1,
    showSlides: function(index) {
        const slides = document.getElementsByClassName('slide');
        const dots = document.getElementsByClassName('dot');

        if (slides.length === 0 || dots.length === 0) {
            console.warn("No slideshow elements found.");
            return;
        }

        if (index > slides.length) {
            this.slideIndex = 1;
        }
        if (index < 1) {
            this.slideIndex = slides.length;
        }

        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = 'none';
        }

        for (let i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(' active', '');
        }

        slides[this.slideIndex - 1].style.display = 'block';
        dots[this.slideIndex - 1].className += ' active';
    },
    nextSlide: function() {
        this.showSlides(this.slideIndex += 1);
    },
    prevSlide: function() {
        this.showSlides(this.slideIndex -= 1);
    },
    currentSlide: function(index) {
        this.showSlides(this.slideIndex = index);
    }
};

// DateModel: Handles date selection and storage
export const DateModel = {
    selectedDate: new Date(), // Initialize with current date

    setDate: function(date) {
        this.selectedDate = date;
    },

    getDate: function() {
        return this.selectedDate;
    }
};


// CocktailsModel: Handles fetching and rendering cocktails data
export const CocktailsModel = {
    fetchCocktails: (category) => {
        const url = category === 'all' ? 'app/api/get_drinks.php' : `app/api/get_drinks.php?category=${category}`;
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Error fetching cocktails:', error);
                throw error;
            });
    }
};

// General-purpose dynamic content model
export const DynamicContentModel = {
    // Helper function to slugify names for URL-safe image filenames
    slugify: (text) => {
        return text
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue') // Handle uppercase German characters
            .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss') // Lowercase
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .replace(/[^\w_]+/g, '') // Remove all non-word characters except underscores
            .replace(/\_\_+/g, '_') // Replace multiple underscores with a single underscore
            .toLowerCase(); // Convert to lowercase
    },

    // Generic fetch data method
    fetchData: (url) => {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error(`Error fetching data from ${url}:`, error);
                throw error;
            });
    },

    // Render dynamic content (can be used for menus, team members, etc.)
renderContent: (data, type) => {
    const container = document.getElementById('dynamic-content');
    container.innerHTML = ''; // Clear existing content

    data.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');

        let itemName = '';
        let imageUrl = '';
        let title = '';
        let description = '';
        let price = '';

        if (type === 'menu') {
            itemName = item.menu_name;
            imageUrl = `images/menu/${item.menu_id}_${item.category_id}_${DynamicContentModel.slugify(itemName)}.png`;
            title = itemName;
            description = item.menu_ingredients;
            price = item.menu_price;
        } else if (type === 'cocktail') {
            itemName = item.cocktail_name;
            imageUrl = `images/cocktails/${item.cocktail_id}_${item.category_id}_${DynamicContentModel.slugify(itemName)}.png`;
            title = itemName;
            description = item.cocktail_description;
            price = item.price;
        } else if (type === 'team') {
            itemName = item.name;
            imageUrl = `images/team/${DynamicContentModel.slugify(itemName)}.png`;
            title = itemName;
            description = item.position;
        }

        // Create the card HTML and handle image load error
        card.innerHTML = `
            <img class="card-image" src="${imageUrl}" alt="${title}">
            <div class="card-header">
                <h3 class="card-title">${title}</h3>
            </div>
            <hr class="divider">
            <p class="card-description">${description}</p>
            ${price ? `<hr class="divider"><div class="info-container"><span class="card-info">${price} €</span></div>` : ''}
        `;

        // Add image error handling
        const imgElement = card.querySelector('.card-image');
        imgElement.addEventListener('error', () => {
            imgElement.src = 'images/icons/no_picture.png'; // Fallback image
        });

        container.appendChild(card);
    });
}
};
// ReservationModel: Processes the retrieval and storage of reservations
export const ReservationModel = {
    fetchReservations: (date) => {
        const formattedDate = date.toISOString().split('T')[0]; // Format: 'YYYY-MM-DD'
        const url = `app/api/get_reservations.php?date=${formattedDate}`;
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Error fetching reservations:', error);
                throw error;
            });
    },
    setReservation: (reservationData) => {
        const url = 'app/api/set_reservations.php';
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservationData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error saving reservation: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Unknown error saving reservation');
            }
            return data;
        })
        .catch(error => {
            console.error('Error saving the reservation:', error);
            throw error; // Rethrow so the calling code knows about the error
        });
    }
    
    
};
window.SlideshowModel = SlideshowModel;
window.CocktailsModel = CocktailsModel;