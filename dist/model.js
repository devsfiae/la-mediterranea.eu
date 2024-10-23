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
// Modell für Theme
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
// Modell für Header
export class HeaderModel {
    static fetchHeader() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch('html/header.html');
            if (!response.ok)
                throw new Error('Fehler beim Laden des Headers');
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
// Model for slideshow
export class SlideshowModel {
    static showSlides(index) {
        const slides = document.getElementsByClassName('slide');
        const dots = document.getElementsByClassName('dot');
        // Überprüfe, ob es Slides und Dots gibt
        if (slides.length === 0 || dots.length === 0) {
            console.warn("Keine Slides oder Dots gefunden.");
            return;
        }
        // Sicherstellen, dass der Index im gültigen Bereich liegt
        if (index > slides.length) {
            this.slideIndex = 1;
        }
        else if (index < 1) {
            this.slideIndex = slides.length;
        }
        else {
            this.slideIndex = index;
        }
        // Alle Slides ausblenden und Dots deaktivieren
        Array.from(slides).forEach(slide => (slide.style.display = 'none'));
        Array.from(dots).forEach(dot => dot.classList.remove('active'));
        // Aktuelle Slide und Dot aktivieren
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
// Modell für Cocktails
export class CocktailsModel {
    static fetchCocktails() {
        return __awaiter(this, arguments, void 0, function* (category = 'all') {
            const url = category === 'all' ? 'app/api/get_drinks.php' : `app/api/get_drinks.php?category=${category}`;
            const response = yield fetch(url);
            if (!response.ok)
                throw new Error('Fehler beim Laden der Cocktails');
            return response.json();
        });
    }
}
// Dynamisches Inhaltsmodell für Menüs, Cocktails, etc.
export class DynamicContentModel {
    static fetchData(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(url);
            if (!response.ok)
                throw new Error(`Fehler beim Laden der Daten von ${url}`);
            return response.json();
        });
    }
    static renderContent(data, type) {
        const container = document.getElementById('dynamic-content');
        if (!container)
            return;
        container.innerHTML = ''; // Clear existing content
        data.forEach(item => {
            const card = this.createCard(item, type);
            container.appendChild(card);
        });
    }
    static createCard(item, type) {
        const card = document.createElement('div');
        card.classList.add('card');
        let title = '';
        let description = '';
        let price = '';
        if (type === 'menu') {
            title = item.menu_name;
            description = item.menu_ingredients;
            price = item.menu_price;
        }
        else if (type === 'cocktail') {
            title = item.cocktail_name;
            description = item.cocktail_description;
            price = item.price;
        }
        card.innerHTML = `
            <div class="card-header">
                <h3>${title}</h3>
            </div>
            <p>${description}</p>
            ${price ? `<p>Preis: ${price} €</p>` : ''}
        `;
        return card;
    }
}
// Modell für Reservierungen
export class ReservationModel {
    static fetchReservations(date) {
        return __awaiter(this, void 0, void 0, function* () {
            const formattedDate = DateModel.formatDate(date);
            const url = `app/api/get_reservations.php?date=${formattedDate}`;
            const response = yield fetch(url);
            if (!response.ok)
                throw new Error('Fehler beim Laden der Reservierungen');
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
                throw new Error('Fehler beim Speichern der Reservierung');
            return response.json();
        });
    }
}
// Utility Funktionen
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