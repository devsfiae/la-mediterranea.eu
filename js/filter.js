// js/filter.js

function initCategoryFilter() {
    const buttons = document.querySelectorAll('.category-button');
    const cards = document.querySelectorAll('.card');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Entferne aktive Klasse und aria-pressed von allen Buttons
            buttons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            // Füge aktive Klasse und aria-pressed zum geklickten Button hinzu
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');

            const category = button.getAttribute('data-category');

            cards.forEach(card => {
                if (category === 'alle' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Standardmäßig alle Karten anzeigen
    const allButton = document.querySelector('.category-button[data-category="alle"]');
    if (allButton) {
        allButton.click();
    }
}

// Initialisieren der Filterfunktion, nachdem der DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', () => {
    initCategoryFilter();
});