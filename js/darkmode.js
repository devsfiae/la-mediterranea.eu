// js/darkmode.js

export function initDarkMode() {
    const themeSwitch = document.getElementById('theme-checkbox');
    const modeText = document.getElementById('mode-text');

    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
            document.body.classList.add('dark-mode');
            modeText.textContent = 'Light Mode';
        } else {
            document.body.classList.remove('dark-mode');
            modeText.textContent = 'Dark Mode';
        }
    });
}
