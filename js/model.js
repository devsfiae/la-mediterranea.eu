// js/model.js

export class Table {
    constructor(id, location, capacity, reservations = []) {
        this.id = id;
        this.location = location;
        this.capacity = capacity;
        this.reservations = reservations;
    }

    isAvailable(time) {
        return !this.reservations.includes(time);
    }
}

export class ReservationModel {
    constructor() {
        this.reservations = [];
    }

    async loadReservations() {
        try {
            const response = await fetch('data/reservations.json');
            const data = await response.json();
            this.reservations = data;
        } catch (error) {
            console.error('Fehler beim Laden der Reservierungen:', error);
            this.reservations = [];
        }
    }

    getReservationsByDate(date) {
        return this.reservations.filter(reservation => reservation.date_field === date);
    }
}
