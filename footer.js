fetch('/portfolio/footer.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('footer-placeholder').outerHTML = html;
    document.getElementById('year').textContent = new Date().getFullYear();
    fetch('https://api.github.com/repos/jdecroocq/portfolio/releases/latest')
      .then(response => response.json())
      .then(data => {
        document.getElementById('build-version').textContent = 'Build ' + data.tag_name;
      })
      .catch(() => {
      });
  })
  .catch(error => {
    console.error('Error while loading the footer:', error);
  });
