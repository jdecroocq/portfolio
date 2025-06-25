fetch('footer.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('footer-placeholder').innerHTML = html;

    // === ICI ON AJOUTE LE SCRIPT POUR LA VERSION AUTOMATIQUE ===
    fetch('https://api.github.com/repos/jdecroocq/portfolio/releases/latest')
      .then(response => response.json())
      .then(data => {
        document.getElementById('build-version').textContent = 'Build ' + data.tag_name;
        const date = new Date(data.published_at);
        document.getElementById('build-date').textContent = date.toLocaleDateString();
      })
      .catch(() => {
        document.getElementById('build-version').textContent = 'Version inconnue';
        document.getElementById('build-date').textContent = '';
      });
    // === FIN DU SCRIPT ===
  })
  .catch(error => {
    console.error('Erreur lors du chargement du footer :', error);
  });
