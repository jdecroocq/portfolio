document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('header nav');
  const navLinks = document.querySelector('header nav ul');
  let overlay = document.getElementById('overlay-dark');
  const header = document.querySelector('header');

  // Crée l’overlay s’il n’existe pas déjà
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

  // Clique sur l'overlay = referme le menu
  overlay.addEventListener('click', () => {
    if (header.classList.contains('open')) {
      closeMenu();
    }
  });

  // Clique en dehors du header = referme aussi
  document.addEventListener('click', (e) => {
    const clickedInsideHeader = header.contains(e.target);
    if (!clickedInsideHeader && header.classList.contains('open')) {
      closeMenu();
    }
  });

  // Ajoutez l'écouteur d'événement pour le redimensionnement de la fenêtre
  window.addEventListener('resize', function() {
    if (window.innerWidth > 700) {
      if (burger.classList.contains('open')) {
        closeMenu();
      }
    }
  });
});
