function initNoRefresh() {
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const linkPath = new URL(this.href, window.location.origin).pathname;
      const currentPath = window.location.pathname;

      if (linkPath === currentPath) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

// Appelle la fonction une première fois si les liens sont déjà là
document.addEventListener('DOMContentLoaded', () => {
  initNoRefresh();

  // Regarde si le footer est injecté dynamiquement
  const observer = new MutationObserver(() => {
    initNoRefresh(); // Réattache les events aux nouveaux liens
  });

  // Observe le placeholder du footer
  const footer = document.getElementById('footer-placeholder');
  if (footer) {
    observer.observe(footer, { childList: true, subtree: true });
  }
});
