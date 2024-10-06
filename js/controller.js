import { SlideshowModel, HeaderModel, DynamicContentModel, CocktailsModel } from './model.js';

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