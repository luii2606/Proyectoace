document.addEventListener('DOMContentLoaded', function() {
  let calendarEl = document.getElementById('calendar');
  let calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev, next, today',
      center: 'title',
      right: 'dayGridMonth, timeGridWeek, listWeek'
    }
  });
  calendar.render();
});