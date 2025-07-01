document.addEventListener('click', function (e) {
  const link = e.target.closest('a[href^="/portfolio/"]');
  if (!link) return;

  if (link.target === "_blank" || link.href.startsWith("mailto:")) return;

  const linkPath = new URL(link.href, window.location.origin).pathname.replace(/\/+$/, "");
  const currentPath = window.location.pathname.replace(/\/+$/, "");

  if (linkPath === currentPath) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
