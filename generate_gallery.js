const API_KEY = 'AIzaSyDH_v9G1JUD-NEkm1bnpWlbty588Kml5Hs';
const ROOT_FOLDER_ID = '1UzmdatXkevjNC4-D_D_kL8s8BcAS8vEC';

async function getFolderIdByName(parentId, folderName) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${parentId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+name='${folderName}'&key=${API_KEY}&fields=files(id,name)`;
  const res = await fetch(url);
  const data = await res.json();
  return data.files[0]?.id;
}

async function listProjectFolders(projectsFolderId) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${projectsFolderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&key=${API_KEY}&fields=files(id,name,createdTime)`;
  const res = await fetch(url);
  const data = await res.json();
  return data.files;
}

async function findTileImage(folderId) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+name='tile.jpg'+and+trashed=false&key=${API_KEY}&fields=files(id,name)`;
  const res = await fetch(url);
  const data = await res.json();
  return data.files[0];
}

async function generateGallery() {
  const gallery = document.querySelector('.gallery-grid');
  const loading = document.getElementById('loading');

  loading.style.display = 'flex';
  gallery.style.display = 'none';

  const projectsFolderId = await getFolderIdByName(ROOT_FOLDER_ID, 'Projects');
  if (!projectsFolderId) {
    console.error("Error: 'Projects' folder not found.");
    loading.innerText = "Error: 'Projects' folder not found.";
    return;
  }

  const projectFolders = await listProjectFolders(projectsFolderId);

  let hasInsertedAtLeastOne = false;

  for (const folder of projectFolders) {
    const tile = await findTileImage(folder.id);

    if (tile) {
      const imageUrl = `https://lh3.googleusercontent.com/d/${tile.id}`;
      const projectLink = `project_details.html?id=${folder.id}&projectName=${encodeURIComponent(folder.name)}`;

      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.innerHTML = `
        <a href="${projectLink}">
          <div class="image-wrapper">
            <img src="${imageUrl}" alt="${folder.name}" />
          </div>
          <span class="image-label">${folder.name}</span>
        </a>
      `;

      gallery.appendChild(item);

      const img = item.querySelector('img');

      img.onload = () => {
        setTimeout(() => {
          item.classList.add('visible');
          adjustTextSize();
        }, 50);
      };

      if (img.complete) {
        setTimeout(() => {
          item.classList.add('visible');
          adjustTextSize();
        }, 50);
      }

      if (!hasInsertedAtLeastOne) {
        loading.style.display = 'none';
        gallery.style.display = 'grid';
        hasInsertedAtLeastOne = true;
      }

      requestAnimationFrame(() => {
        adjustTextSize();
      });
    } else {
      console.warn(`Warning: No 'tile.jpg' found in folder: ${folder.name}`);
    }
  }

  window.addEventListener('resize', adjustTextSize);

  if (!hasInsertedAtLeastOne) {
    loading.innerText = "No projects with images found.";
  }
}

function adjustTextSize() {
  const gallery = document.querySelector('.gallery-grid');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryWidth = gallery.offsetWidth;
  const itemWidth = galleryItems[0]?.offsetWidth || 0;
  const imagesPerRow = Math.floor(galleryWidth / itemWidth) || 1;

  galleryItems.forEach(item => {
    const text = item.querySelector('.image-label');
    const calculatedWidth = galleryWidth / imagesPerRow;
    const fontSize = calculatedWidth * 0.07;
    text.style.fontSize = fontSize + 'px';
  });
}

window.addEventListener('DOMContentLoaded', generateGallery);
