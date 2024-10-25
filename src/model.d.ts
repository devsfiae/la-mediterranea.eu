// src/model.d.ts
declare module 'model' {
    
    export class DateModel {
        static getDate(): Date;
        static setDate(date: Date): void;
    }

    export class DrinkModel {
        static fetchDrinks(category: string): Promise<any[]>;
    }
    export class DynamicContentModel {
        static fetchData(url: string): Promise<any>;
        static renderContent(data: any, type: string): void;
    }
    export class HeaderModel {
        static fetchHeader(): Promise<string>;
        static getCurrentPage(): string;
        static hideActivePageLink(): void;
    }
    export class ReservationModel {
        static fetchReservations(date: Date): Promise<any>;
        static setReservation(reservationData: any): Promise<any>;
    }
    export class SlideshowModel {
        static slideIndex: number;
        static showSlides(index: number): void;
        static nextSlide(): void;
        static prevSlide(): void;
        static currentSlide(index: number): void;
    }
    export class ThemeModel {
        static saveThemePreference(isDarkMode: boolean): void;
        static getThemePreference(): boolean;
        static applyTheme(): void;
    }
    // Declare further classes and types here...
}