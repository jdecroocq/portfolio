fetch('/portfolio/header.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('header-placeholder').outerHTML = html;

    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav ul.nav-links a');
    navLinks.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    initBurgerMenu();
  })
  .catch(error => {
    console.error('Error while loading the header:', error);
  });

function initBurgerMenu() {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('header nav');
  const navLinks = document.querySelector('header nav ul');
  let overlay = document.getElementById('dark-overlay');
  const header = document.querySelector('header');

  if (!burger || !nav || !header) return;

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'dark-overlay';
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

  window.addEventListener('resize', function () {
    if (window.innerWidth > 700) {
      if (burger.classList.contains('open')) {
        closeMenu();
      }
    }
  });
}
