// rates_script.js — Tab filter for Jo-Nin Rates page

document.addEventListener('DOMContentLoaded', function () {
  var tabs = document.querySelectorAll('.rates-tab');
  var categories = document.querySelectorAll('.rates-category');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var selected = tab.getAttribute('data-cat');

      // Update active tab
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');

      // Show / hide categories
      categories.forEach(function (cat) {
        if (selected === 'all' || cat.getAttribute('data-cat') === selected) {
          cat.classList.remove('hidden');
          // Subtle entrance animation
          cat.style.opacity = '0';
          cat.style.transform = 'translateY(12px)';
          requestAnimationFrame(function () {
            cat.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            cat.style.opacity = '1';
            cat.style.transform = 'translateY(0)';
          });
        } else {
          cat.classList.add('hidden');
          cat.style.transition = '';
        }
      });
    });
  });
});