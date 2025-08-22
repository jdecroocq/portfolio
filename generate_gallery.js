function adjustTextSize() {
  const gallery = document.querySelector('.gallery-grid');
  if (!gallery) return; 

  const galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryItems.length === 0) return;

  const galleryWidth = gallery.offsetWidth;
  const itemWidth = galleryItems[0].offsetWidth;
  const imagesPerRow = Math.floor(galleryWidth / itemWidth) || 1;

  galleryItems.forEach(item => {
    const text = item.querySelector('.image-label');
    const calculatedWidth = galleryWidth / imagesPerRow;
    const fontSize = calculatedWidth * 0.07;
    text.style.fontSize = fontSize + 'px';
  });
}

async function generateGallery() {
  const gallery = document.querySelector('.gallery-grid');
  if (!gallery) { console.error("Error: Could not find element with class '.gallery-grid'."); return; }
  
  gallery.style.display = 'grid';

  try {
    const response = await fetch('/projects/projects-list.json');
    if (!response.ok) { throw new Error(`HTTP Error: ${response.status}`); }
    const projects = await response.json();

    if (projects.length === 0) { gallery.innerHTML = "<p>No projects found.</p>"; return; }

    gallery.innerHTML = '';
    const STAGGER_DELAY_MS = 200;

    for (const project of projects) {
      const tilePath = `/projects/${project.id}/tile.jpg`;
      const projectUrl = `/portfolio/project_details.html?id=${project.id}`;

      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.innerHTML = `
        <a href="${projectUrl}">
          <div class="image-wrapper"><img src="${tilePath}" alt="${project.title}" /></div>
          <span class="image-label">${project.title}</span>
        </a>
      `;
      gallery.appendChild(item);

      const img = item.querySelector('img');

      const imageLoadPromise = new Promise(resolve => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = resolve;
          img.onerror = resolve;
        }
      });

      const delayPromise = new Promise(resolve => setTimeout(resolve, STAGGER_DELAY_MS));

      await Promise.all([imageLoadPromise, delayPromise]);

      item.classList.add('visible');
      adjustTextSize();
    }

    requestAnimationFrame(adjustTextSize);

  } catch (error) {
    console.error("Failed to load project gallery:", error);
    gallery.innerHTML = "<p>Error loading projects. Please try again later.</p>";
  }
}

window.addEventListener('DOMContentLoaded', generateGallery);
window.addEventListener('resize', adjustTextSize);
