// js/script.js

function initThemeSwitching() {
    const themeCheckbox = document.getElementById('theme-checkbox');
    const modeText = document.getElementById('mode-text');

    // Lade die Theme-Präferenz aus localStorage
    const darkMode = localStorage.getItem('dark-mode') === 'true';

    if (darkMode) {
        document.body.classList.add('dark-mode');
        themeCheckbox.checked = true;
        modeText.textContent = 'Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        themeCheckbox.checked = false;
        modeText.textContent = 'Dark Mode';
    }

    // Event Listener für den Wechsel des Themes
    themeCheckbox.addEventListener('change', () => {
        if (themeCheckbox.checked) {
            document.body.classList.add('dark-mode');
            modeText.textContent = 'Light Mode';
            localStorage.setItem('dark-mode', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            modeText.textContent = 'Dark Mode';
            localStorage.setItem('dark-mode', 'false');
        }
    });
}

// Initialisieren des Theme Switches, nachdem der DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', () => {
    initThemeSwitching();
});

document.addEventListener('DOMContentLoaded', function() {
    // Funktion zur Bestimmung des aktuellen Tagtyps
    function getDayType() {
        const today = new Date();
        const day = today.getDay(); // 0 (Sonntag) bis 6 (Samstag)

        // Definieren Sie Feiertage hier (Beispiel: 25. Dezember)
        const holidays = [
            { month: 11, day: 25 }, // Dezember 25
            // Weitere Feiertage hinzufügen
        ];

        // Prüfen, ob heute ein Feiertag ist
        for (let holiday of holidays) {
            if (today.getMonth() === holiday.month && today.getDate() === holiday.day) {
                return 'holiday';
            }
        }

        // Wochenende: Samstag (6) und Sonntag (0)
        if (day === 0 || day === 6) {
            return 'weekend';
        }

        // Werktag
        return 'weekday';
    }

    // Funktion zur Anzeige der passenden Reservierungszeilen
    function displayReservations() {
        const dayType = getDayType();
        const reservationRows = document.querySelectorAll('.reservation-row');

        reservationRows.forEach(row => {
            if (row.getAttribute('data-day') === dayType) {
                row.style.display = 'flex';
            } else {
                row.style.display = 'none';
            }
        });
    }

    displayReservations();
});