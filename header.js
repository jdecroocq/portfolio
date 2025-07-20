document.addEventListener("DOMContentLoaded", () => {
  fetch("header.html")
    .then(response => {
      if (!response.ok) throw new Error("Failed to load header.html");
      return response.text();
    })
    .then(data => {
      const container = document.getElementById("header-container");
      if (container) {
        container.innerHTML = data;
      }
    })
    .catch(error => console.error(error));
});
