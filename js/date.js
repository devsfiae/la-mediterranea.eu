document.addEventListener('DOMContentLoaded', function() {
    var dateButton = document.querySelector('.category-button.active[data-category="alle"]');
    if (dateButton) {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); // Monate sind nullbasiert
        var yyyy = today.getFullYear();
        dateButton.textContent = dd + '.' + mm + '.' + yyyy;
    }
});
