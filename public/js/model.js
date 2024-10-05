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

    // Render dynamic content (can be used for menus, teams, etc.)
    renderContent: (data, type) => {
        const container = document.getElementById('dynamic-content');
        container.innerHTML = ''; // Clear existing content

        data.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('card');

            let slugifiedName = DynamicContentModel.slugify(item.name || item.menu_name);

            let imageUrl = '';
            let title = '';
            let description = '';
            let price = '';

            if (type === 'menu') {
                imageUrl = `images/menu/${item.menu_id}_${item.category_id}_${slugifiedName}.png`;
                title = item.menu_name;
                description = item.menu_ingredients;
                price = item.menu_price;
            } else if (type === 'team') {
                imageUrl = `images/team/${slugifiedName}.png`;
                title = item.name;
                description = item.position;
            }

            card.innerHTML = `
                <img class="card-image" src="${imageUrl}" alt="${title}">
                <div class="card-header">
                    <h3 class="card-title">${title}</h3>
                </div>
                <hr class="divider">
                <p class="card-description">${description}</p>
                ${price ? `<hr class="divider"><div class="info-container"><span class="card-info">${price} €</span></div>` : ''}
            `;

            container.appendChild(card);
        });
    }
};
window.SlideshowModel = SlideshowModel;