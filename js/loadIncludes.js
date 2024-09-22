// js/loadIncludes.js

function loadHTML(elementId, url) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Netzwerkantwort war nicht ok für ${url}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
            // Wenn beide Header und Footer geladen sind, feuern wir ein Event
            if (elementId === 'footer') {
                document.dispatchEvent(new Event('includesLoaded'));
            }
        })
        .catch(error => {
            console.error(`Es gab ein Problem mit dem Laden von ${url}:`, error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    loadHTML('header', 'header.html');
    loadHTML('footer', 'footer.html');
});