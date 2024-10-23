// model.ts

// Model for theme
export class ThemeModel {
    static saveThemePreference(isDarkMode: boolean): void {
        localStorage.setItem('darkMode', isDarkMode.toString());
    }

    static getThemePreference(): boolean {
        return localStorage.getItem('darkMode') === 'true';
    }

    static applyTheme(): void {
        const isDarkMode = this.getThemePreference();
        document.body.classList.toggle('dark-theme', isDarkMode);
    }
}

// Model for headers
export class HeaderModel {
    static async fetchHeader(): Promise<string> {
        const response = await fetch('html/header.html');
        if (!response.ok) throw new Error('Error loading the header');
        return response.text();
    }

    static getCurrentPage(): string {
        return window.location.pathname.split('/').pop() || '';
    }

    static hideActivePageLink(): void {
        const currentPage = this.getCurrentPage();
        const navLinks = document.querySelectorAll('.header-center ul li a');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.parentElement?.classList.add('hidden');
            }
        });
    }
}

// Model for slide show
export class SlideshowModel {
    static slideIndex: number = 1;

    static showSlides(index: number): void {
        const slides = document.getElementsByClassName('slide') as HTMLCollectionOf<HTMLElement>;
        const dots = document.getElementsByClassName('dot') as HTMLCollectionOf<HTMLElement>;

        // Check whether there are slides and dots
        if (slides.length === 0 || dots.length === 0) {
            console.warn("No slides or dots found.");
            return;
        }

        // Ensure that the index is within the valid range
        if (index > slides.length) {
            this.slideIndex = 1;
        } else if (index < 1) {
            this.slideIndex = slides.length;
        } else {
            this.slideIndex = index;
        }

        // Hide all slides and deactivate dots
        Array.from(slides).forEach(slide => (slide.style.display = 'none'));
        Array.from(dots).forEach(dot => dot.classList.remove('active'));

        // Activate current slide and dot
        slides[this.slideIndex - 1].style.display = 'block';
        dots[this.slideIndex - 1].classList.add('active');
    }

    static nextSlide(): void {
        this.showSlides(this.slideIndex + 1);
    }

    static prevSlide(): void {
        this.showSlides(this.slideIndex - 1);
    }

    static currentSlide(index: number): void {
        this.showSlides(index);
    }
}

// Model for date
export class DateModel {
    private static selectedDate: Date = new Date();

    static setDate(date: Date): void {
        this.selectedDate = date;
    }

    static getDate(): Date {
        return this.selectedDate;
    }

    static formatDate(date: Date): string {
        return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    }
}

// Model for drinks
export class DrinksModel {
    static async fetchDrinks(category: string = 'all'): Promise<any[]> {
        const url = category === 'all' ? 'app/api/get_drinks.php' : `app/api/get_drinks.php?category=${category}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error when loading the drinks');
        return response.json();
    }
}

// Dynamic content model for menus, drinks, etc.
// Model should only return the data, not generate HTML
export class DynamicContentModel {
    static fetchData(url: string): Promise<any> {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Fehler beim Laden der Daten von ${url}`);
                }
                return response.json();
            });
    }
}

// Model for reservations
export class ReservationModel {
    static async fetchReservations(date: Date): Promise<any[]> {
        const formattedDate = DateModel.formatDate(date);
        const url = `app/api/get_reservations.php?date=${formattedDate}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Fehler beim Laden der Reservierungen');
        return response.json();
    }

    static async saveReservation(data: any): Promise<any> {
        const url = 'app/api/set_reservations.php';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Fehler beim Speichern der Reservierung');
        return response.json();
    }
}

// Utility functions
export class Utils {
    static slugify(text: string): string {
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
