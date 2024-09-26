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

    async loadReservations(date) {
        try {
            const response = await fetch(`get_reservations.php?date=${date}`);
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

    async saveReservation(reservation) {
        try {
            const response = await fetch('save_reservation.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservation)
            });
            const result = await response.json();
            if (result.error) {
                throw new Error(result.error);
            }
            // Aktualisiere die lokale Liste der Reservierungen
            this.reservations.push(reservation);
        } catch (error) {
            console.error('Fehler beim Speichern der Reservierung:', error);
        }
    }
}
