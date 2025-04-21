// footer.js
fetch('/footer.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('footer-placeholder').innerHTML = html;
  })
  .catch(error => {
    console.error('Erreur lors du chargement du footer :', error);
  });
