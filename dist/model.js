// model.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Model for theme
export class ThemeModel {
    static saveThemePreference(isDarkMode) {
        localStorage.setItem('darkMode', isDarkMode.toString());
    }
    static getThemePreference() {
        return localStorage.getItem('darkMode') === 'true';
    }
    static applyTheme() {
        const isDarkMode = this.getThemePreference();
        document.body.classList.toggle('dark-theme', isDarkMode);
    }
}
// Model for headers
export class HeaderModel {
    static fetchHeader() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch('/app/html/header.html');
            if (!response.ok)
                throw new Error('Error loading the header');
            return response.text();
        });
    }
    static getCurrentPage() {
        return window.location.pathname.split('/').pop() || '';
    }
    static hideActivePageLink() {
        const currentPage = this.getCurrentPage();
        const navLinks = document.querySelectorAll('.header-center ul li a');
        navLinks.forEach(link => {
            var _a;
            if (link.getAttribute('href') === currentPage) {
                (_a = link.parentElement) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
            }
        });
    }
}
// Model for slide show
export class SlideshowModel {
    static showSlides(index) {
        const slides = document.getElementsByClassName('slide');
        const dots = document.getElementsByClassName('dot');
        // Check whether there are slides and dots
        if (slides.length === 0 || dots.length === 0) {
            console.warn("No slides or dots found.");
            return;
        }
        // Ensure that the index is within the valid range
        if (index > slides.length) {
            this.slideIndex = 1;
        }
        else if (index < 1) {
            this.slideIndex = slides.length;
        }
        else {
            this.slideIndex = index;
        }
        // Hide all slides and deactivate dots
        Array.from(slides).forEach(slide => (slide.style.display = 'none'));
        Array.from(dots).forEach(dot => dot.classList.remove('active'));
        // Activate current slide and dot
        slides[this.slideIndex - 1].style.display = 'block';
        dots[this.slideIndex - 1].classList.add('active');
    }
    static nextSlide() {
        this.showSlides(this.slideIndex + 1);
    }
    static prevSlide() {
        this.showSlides(this.slideIndex - 1);
    }
    static currentSlide(index) {
        this.showSlides(index);
    }
}
SlideshowModel.slideIndex = 1;
// Model for date
export class DateModel {
    static setDate(date) {
        this.selectedDate = date;
    }
    static getDate() {
        return this.selectedDate;
    }
    static formatDate(date) {
        return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    }
}
DateModel.selectedDate = new Date();
// Model for drinks
export class DrinkModel {
    static fetchDrinks() {
        return __awaiter(this, arguments, void 0, function* (category = 'all') {
            const url = category === 'all' ? 'app/api/get_drinks.php' : `app/api/get_drinks.php?category=${category}`;
            const response = yield fetch(url);
            if (!response.ok)
                throw new Error('Error when loading the drinks');
            return response.json();
        });
    }
}
// Dynamic content model for menus, drinks, etc.
// Model should only return the data, not generate HTML
export class DynamicContentModel {
    static fetchData(url) {
        return fetch(url)
            .then(response => {
            if (!response.ok) {
                throw new Error(`Error loading data from ${url}`);
            }
            return response.json();
        });
    }
}
// Model for reservations
export class ReservationModel {
    static fetchReservations(date) {
        return __awaiter(this, void 0, void 0, function* () {
            const formattedDate = DateModel.formatDate(date);
            const url = `app/api/get_reservations.php?date=${formattedDate}`;
            const response = yield fetch(url);
            if (!response.ok)
                throw new Error('Error loading the reservations');
            return response.json();
        });
    }
    static saveReservation(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'app/api/set_reservations.php';
            const response = yield fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok)
                throw new Error('Error when saving the reservation');
            return response.json();
        });
    }
}
// Utility functions
export class Utils {
    static slugify(text) {
        return text
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue')
            .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
            .replace(/\s+/g, '_')
            .replace(/[^\w_]+/g, '')
            .replace(/\_\_+/g, '_')
            .toLowerCase();
    }
}
//# sourceMappingURL=model.js.map