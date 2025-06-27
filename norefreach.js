function initNoRefresh() {

  document.querySelectorAll('a[href^="./"], a[href^="/"], a[href^="about_me"], a[href^="index"], a[href^="legal_information"]').forEach(link => {
    link.addEventListener('click', function (e) {
      
      const linkPath = new URL(this.href, window.location.origin).pathname.replace(/\/+$/, "");
      const currentPath = window.location.pathname.replace(/\/+$/, "");

      if (linkPath === currentPath) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNoRefresh();

  const observer = new MutationObserver(() => {
    initNoRefresh();
  });

  const footer = document.getElementById('footer-placeholder');
  if (footer) {
    observer.observe(footer, { childList: true, subtree: true });
  }
});
