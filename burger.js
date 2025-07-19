document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('header nav');
  const navLinks = document.querySelector('header nav ul');
  let overlay = document.getElementById('overlay-dark');
  const header = document.querySelector('header');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'overlay-dark';
    document.body.appendChild(overlay);
  }

  function closeMenu() {
    nav.classList.remove('show');
    burger.classList.remove('open');
    overlay.classList.remove('active');
    header.classList.remove('open');
  }

  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.toggle('show');
    burger.classList.toggle('open');
    overlay.classList.toggle('active');
    header.classList.toggle('open');
  });

  overlay.addEventListener('click', () => {
    if (header.classList.contains('open')) {
      closeMenu();
    }
  });

  document.addEventListener('click', (e) => {
    const clickedInsideHeader = header.contains(e.target);
    if (!clickedInsideHeader && header.classList.contains('open')) {
      closeMenu();
    }
  });

  window.addEventListener('resize', function() {
    if (window.innerWidth > 700) {
      if (burger.classList.contains('open')) {
        closeMenu();
      }
    }
  });
});
