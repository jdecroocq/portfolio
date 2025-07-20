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
  })
  .catch(error => {
    console.error('Erreur lors du chargement du header :', error);
  });
