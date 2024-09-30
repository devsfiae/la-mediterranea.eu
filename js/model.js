// model.js contains the data and logic for the application. 
// It is responsible for fetching data from external sources, saving data to local storage, and handling the logic for the application.

// Handles saving/loading theme preferences
export const ThemeModel = {
    saveThemePreference: (isDarkMode) => {
        localStorage.setItem('darkMode', isDarkMode);
    },
    getThemePreference: () => {
        return localStorage.getItem('darkMode') === 'true';
    }
};

// Handles fetching and logic for the header

export const HeaderModel = {
    // Fetch the header HTML from an external file
    fetchHeader: () => {
        return fetch('header.html')
            .then(response => response.text())
            .catch(error => {
                console.error('Error fetching header:', error);
                throw error;
            });
    },

    // Get the current page URL (e.g., "reserve.html")
    getCurrentPage: () => {
        return window.location.pathname.split('/').pop();
    }
};

// Handles fetching and logic for the slideshows

export const SlideshowModel = {
    slideIndex: 1,

    // Show the current slide
    showSlides: function(index) {
        const slides = document.getElementsByClassName('slide');
        const dots = document.getElementsByClassName('dot');

        if (index > slides.length) {
            this.slideIndex = 1;
        }
        if (index < 1) {
            this.slideIndex = slides.length;
        }

        // Hide all slides
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.display = 'none';
        }

        // Remove active class from all dots
        for (let i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(' active', '');
        }

        // Display the current slide and mark the dot as active
        slides[this.slideIndex - 1].style.display = 'block';
        dots[this.slideIndex - 1].className += ' active';
    },

    // Move to the next slide
    nextSlide: function() {
        this.showSlides(this.slideIndex += 1);
    },

    // Move to the previous slide
    prevSlide: function() {
        this.showSlides(this.slideIndex -= 1);
    },

    // Jump to a specific slide
    currentSlide: function(index) {
        this.showSlides(this.slideIndex = index);
    }
};