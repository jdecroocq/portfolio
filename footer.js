fetch('/portfolio/footer.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('footer-placeholder').outerHTML = html;

    fetch('https://api.github.com/repos/jdecroocq/portfolio/releases/latest')
      .then(response => response.json())
      .then(data => {

        const date = new Date(data.published_at);
        const year = date.getFullYear();
        const monthName = date.toLocaleString('en-US', { month: 'long' });

        let monthDisplay;
        if (monthName.length > 4) {
          monthDisplay = monthName.slice(0, 3) + '.';
        } else {
          monthDisplay = monthName;
        }

        document.getElementById('build-version').textContent = 'Build ' + data.tag_name;
        document.getElementById('build-date').textContent = `${monthDisplay} ${year}`;
      })
      .catch(() => {
        document.getElementById('build-version').textContent = 'Version inconnue';
        document.getElementById('build-date').textContent = '';
      });
  })
  .catch(error => {
    console.error('Erreur lors du chargement du footer :', error);
  });
