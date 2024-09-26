// js/controller.js

import { ReservationModel, Table } from './model.js';
import { ReservationView } from './view.js';

export class AppController {
    constructor() {
        this.model = new ReservationModel();
        this.view = new ReservationView();
        this.tables = [
            new Table(1, 'Strand', 4),
            new Table(2, 'Strand', 4),
            new Table(3, 'Innen', 4),
            new Table(4, 'Innen', 4)
        ];
        this.availableTimes = ['17:00', '19:00'];
        this.selectedDate = new Date();
    }

    async init() {
        this.view.bindDateButton(() => this.handleDateButtonClick());
        this.view.bindReserveButton((tableId, time) => this.handleReservation(tableId, time));
        await this.updateView();
    }

    async updateView() {
        const dayOfWeek = this.selectedDate.getDay();
        const selectedDateString = this.selectedDate.toISOString().split('T')[0]; // Format: 'YYYY-MM-DD'

        if (dayOfWeek === 1 || dayOfWeek === 2) {
            // Montags und Dienstags geschlossen
            this.view.showClosedMessage(true);
            this.view.reservationContainer.style.display = 'none';
        } else {
            this.view.showClosedMessage(false);
            this.view.reservationContainer.style.display = 'block';

            // Überprüfe, ob 21:00 Uhr hinzugefügt werden soll
            if (dayOfWeek === 5 || dayOfWeek === 6) {
                if (!this.availableTimes.includes('21:00')) {
                    this.availableTimes.push('21:00');
                }
            } else {
                this.availableTimes = this.availableTimes.filter(time => time !== '21:00');
            }

            // Lade die Reservierungen für das ausgewählte Datum
            await this.model.loadReservations(selectedDateString);
            const reservationsForDate = this.model.getReservationsByDate(selectedDateString);

            // Aktualisiere die Belegung der Tische
            this.tables.forEach(table => {
                table.reservations = [];
                reservationsForDate.forEach(reservation => {
                    if (parseInt(reservation.table_id) === table.id) {
                        const time = reservation.time_field.substring(0,5); // 'HH:MM'
                        table.reservations.push(time);
                    }
                });
            });

            this.view.renderReservations(this.tables, this.availableTimes);
        }
    }


    async handleReservation(tableId, time) {
        const reservation = {
            date_field: this.selectedDate.toISOString().split('T')[0],
            time_field: time + ':00',
            table_id: tableId.toString(),
            state_id: '1',
            persons: '0', // Sie können hier die tatsächliche Anzahl der Personen angeben
            name: '',     // Optional: Name des Kunden
            email: ''     // Optional: E-Mail des Kunden
        };

        // Speichern der Reservierung
        await this.model.saveReservation(reservation);

        // Aktualisiere die Ansicht
        await this.updateView();

        alert(`Reservierung für Tisch ${tableId} um ${time} Uhr am ${this.selectedDate.toLocaleDateString('de-DE')} wurde gespeichert.`);
    }

    handleDateButtonClick() {
        // ... (Ihr bestehender Code)
    }


    handleDateButtonClick() {
        const datePicker = document.createElement('input');
        datePicker.type = 'date';
        datePicker.valueAsDate = this.selectedDate;
        datePicker.style.display = 'none';
        document.body.appendChild(datePicker);
        datePicker.addEventListener('change', async () => {
            this.selectedDate = datePicker.valueAsDate;
            const dateText = this.selectedDate.toLocaleDateString('de-DE');
            this.view.updateDateButton(dateText);
            await this.updateView();
            document.body.removeChild(datePicker);
        });
        datePicker.click();
    }

    handleReservation(tableId, time) {
        alert(`Reservierung für Tisch ${tableId} um ${time} Uhr am ${this.selectedDate.toLocaleDateString('de-DE')}`);
        // Hier würden Sie den Reservierungsprozess fortsetzen
    }
}
