import { SlideshowModel, HeaderModel, DynamicContentModel } from './model.js';

document.addEventListener('DOMContentLoaded', () => {
    // Load header and footer dynamically
    loadHeader();
    loadFooter();

    // Initialize the Slideshow
    initializeSlideshow();

    // Load all menus initially (falls benötigt)
    loadMenus('all');

    // Add event listener to dropdown for category selection
    const categoryDropdown = document.getElementById('category-dropdown');
    if (categoryDropdown) {
        categoryDropdown.addEventListener('change', (e) => {
            const selectedCategory = e.target.value;
            loadMenus(selectedCategory); // Fetch menus based on selected category
        });
    }
});

function initializeSlideshow() {
    // Initialisiere die Slideshow
    SlideshowModel.showSlides(SlideshowModel.slideIndex);

    // Event Listener für die Navigationspfeile
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

    // Event Listener für die Dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            SlideshowModel.currentSlide(index + 1);
        });
    });
}

function loadMenus(category) {
    // Build the URL based on the category
    const url = category === 'all' ? '/app/api/get_menues.php' : `/app/api/get_menues.php?category=${category}`;
    
    // Fetch and render the menus
    DynamicContentModel.fetchData(url)
        .then(menus => {
            DynamicContentModel.renderContent(menus, 'menu');
        })
        .catch(error => {
            console.error('Error rendering menus:', error);
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