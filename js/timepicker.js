$(function() {
    $('#timepicker').timepicker({
        timeFormat: 'HH:mm',
        interval: 120,
        minTime: '17:00',
        maxTime: '23:00',
        defaultTime: '17:00',
        startTime: '17:00',
        dynamic: false,
        dropdown: true,
        scrollbar: true
    });
});