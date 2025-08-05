const headerHTML = `
<header>
  <div class="top-bar">
    <div class="logo">
      <a href="/portfolio/">
        <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" class="logo-svg">
          <path fill="currentColor" d="m128 35.624 80 46.188v92.376l-80 46.188-80-46.188v-45.95l12 3.75v35.272l68 39.26 68-39.26V88.74l-68-39.26-68 39.26v24.499l-12-2.062V81.812z"/>
          <path fill="currentColor" d="m0 108 128 22 63-10.828v9.141L128 148zm213 7.391L256 108l-43 13.437z"/>
        </svg>
      </a>
    </div>
    <button class="burger">
      <span class="bar bar1"></span>
      <span class="bar bar2"></span>
      <span class="bar bar3"></span>
    </button>
    <button class="theme-toggle" type="button">Thème</button>
  </div>
  <nav>
    <ul class="nav-links">
      <li><a href="/portfolio/">Projects</a></li>
      <li><a href="/portfolio/about_me">About me</a></li>
    </ul>
  </nav>
</header>`;

const footerHTML = `
<footer id="footer">
  <ul>
    <li><a href="/portfolio/legal_information">Legal Information</a></li>
    <li>
      <a href="https://github.com/jdecroocq/portfolio" target="_blank" rel="noopener noreferrer">
        <span id="build-version">Build …</span>
      </a>
    </li>
    <li>© <span id="year"></span> Jean Decroocq</li>
  </ul>
</footer>`;

(function () {
  const placeholder = document.getElementById('header-placeholder');
  if (!placeholder) return;
  placeholder.innerHTML = headerHTML;

  const currentPath = window.location.pathname;
  document.querySelectorAll('nav ul.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const burger = document.querySelector('.burger');
  const nav = document.querySelector('header nav');
  const header = document.querySelector('header');
  if (!burger || !nav || !header) return;

  let overlay = document.getElementById('dark-overlay');
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

  burger.addEventListener('click', e => {
    e.stopPropagation();
    nav.classList.toggle('show');
    burger.classList.toggle('open');
    overlay.classList.toggle('active');
    header.classList.toggle('open');
  });

  overlay.addEventListener('click', () => {
    if (header.classList.contains('open')) closeMenu();
  });

  document.addEventListener('click', e => {
    if (!header.contains(e.target) && header.classList.contains('open')) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 700 && burger.classList.contains('open')) closeMenu();
  });
})();

(function () {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;
  placeholder.innerHTML = footerHTML;

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const CACHE_KEY = 'portfolio_latest_release';
  const CACHE_TS_KEY = 'portfolio_latest_release_ts';
  const CACHE_DURATION_MS = 15 * 60 * 1000;

  function applyVersion(tag) {
    const versionEl = document.getElementById('build-version');
    if (versionEl && tag) versionEl.textContent = 'Build ' + tag;
  }

  const now = Date.now();
  const cachedTs = parseInt(localStorage.getItem(CACHE_TS_KEY) || '0', 10);
  const cached = localStorage.getItem(CACHE_KEY);

  if (cached && !isNaN(cachedTs) && now - cachedTs < CACHE_DURATION_MS) {
    applyVersion(cached);
  } else {
    fetch('https://api.github.com/repos/jdecroocq/portfolio/releases/latest')
      .then(res => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.json();
      })
      .then(data => {
        if (data.tag_name) {
          applyVersion(data.tag_name);
          try {
            localStorage.setItem(CACHE_KEY, data.tag_name);
            localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
          } catch (_) {}
        }
      })
      .catch(err => {
        console.error('Footer build version fetch failed:', err);
      });
  }
})();

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
