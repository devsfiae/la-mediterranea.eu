// js/view.js

export class ReservationView {
    constructor() {
        this.dateButton = document.getElementById('date-button');
        this.reservationContainer = document.getElementById('reservation-container');
        this.closedMessage = document.getElementById('closed-message');
    }

    bindDateButton(handler) {
        this.dateButton.addEventListener('click', handler);
    }

    updateDateButton(dateText) {
        this.dateButton.textContent = dateText;
    }

    showClosedMessage(show) {
        this.closedMessage.style.display = show ? 'block' : 'none';
    }

    renderReservations(tables, availableTimes) {
        this.reservationContainer.innerHTML = '';

        if (tables.length === 0) {
            this.reservationContainer.innerHTML = '<p>Keine verfügbaren Tische.</p>';
            return;
        }

        availableTimes.forEach(time => {
            const reservationRow = document.createElement('div');
            reservationRow.classList.add('reservation-row');
            reservationRow.dataset.time = time;

            const timeColumn = document.createElement('div');
            timeColumn.classList.add('time-column');
            timeColumn.textContent = time;
            reservationRow.appendChild(timeColumn);

            const tableCardsContainer = document.createElement('div');
            tableCardsContainer.classList.add('table-cards-container');

            tables.forEach(table => {
                const tableCard = document.createElement('div');
                tableCard.classList.add('table-card');
                tableCard.dataset.table = table.id;

                const h3 = document.createElement('h3');
                h3.textContent = table.location;
                tableCard.appendChild(h3);

                const ul = document.createElement('ul');
                for (let i = 0; i < table.capacity; i++) {
                    const li = document.createElement('li');
                    li.innerHTML = '&nbsp;';
                    ul.appendChild(li);
                }
                tableCard.appendChild(ul);

                const reserveButton = document.createElement('button');
                reserveButton.classList.add('reserve-button');
                reserveButton.textContent = 'Reservieren';

                // Überprüfen, ob der Tisch zu dieser Zeit verfügbar ist
                if (table.reservations.includes(time)) {
                    reserveButton.disabled = true;
                    tableCard.classList.add('unavailable');
                } else {
                    reserveButton.disabled = false;
                }

                tableCard.appendChild(reserveButton);
                tableCardsContainer.appendChild(tableCard);
            });

            reservationRow.appendChild(tableCardsContainer);
            this.reservationContainer.appendChild(reservationRow);
        });
    }

    bindReserveButton(handler) {
        this.reservationContainer.addEventListener('click', event => {
            if (event.target.classList.contains('reserve-button') && !event.target.disabled) {
                const tableCard = event.target.closest('.table-card');
                const tableId = tableCard.dataset.table;
                const time = tableCard.closest('.reservation-row').dataset.time;
                handler(tableId, time);
            }
        });
    }
}
