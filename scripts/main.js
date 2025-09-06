// Set current year in the footer
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Smooth scrolling for internal anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const snowToggle = document.getElementById('snow-toggle');
if (snowToggle) {
  const root = document.documentElement;
  const apply = () => {
    if (snowToggle.checked) {
      root.classList.remove('snow-off');
    } else {
      root.classList.add('snow-off');
    }
  };
  snowToggle.addEventListener('change', apply);
  apply(); // initialize on load based on current checkbox state
}
