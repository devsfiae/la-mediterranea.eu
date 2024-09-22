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