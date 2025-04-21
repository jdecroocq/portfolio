const API_KEY = 'AIzaSyDH_v9G1JUD-NEkm1bnpWlbty588Kml5Hs';
const ROOT_FOLDER_ID = '1UzmdatXkevjNC4-D_D_kL8s8BcAS8vEC'; // ID du dossier racine "Portfolio"

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
  return data.files; // [{ id, name, createdTime }]
}

async function findTileImage(folderId) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+name='tile.jpg'+and+trashed=false&key=${API_KEY}&fields=files(id,name)`;
  const res = await fetch(url);
  const data = await res.json();
  return data.files[0]; // { id, name }
}

async function generateGallery() {
  const gallery = document.querySelector('.gallery-grid');
  const loading = document.getElementById('loadingGallery');

  loading.style.display = 'flex';
  gallery.style.display = 'none';

  const projectsFolderId = await getFolderIdByName(ROOT_FOLDER_ID, 'Projects');
  if (!projectsFolderId) {
    console.error("Dossier 'Projects' introuvable.");
    loading.innerText = "Erreur : Dossier 'Projects' introuvable.";
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

      // Attendre que l'image soit complètement chargée avant de l'afficher
      img.onload = () => {
        // Attendre un petit délai avant d'ajouter la classe visible
        setTimeout(() => {
          item.classList.add('visible');
          adjustTextSize();
        }, 50); // 50 ms de délai, tu peux ajuster si nécessaire
      };

      // Si l'image est déjà en cache (complète), on l'affiche immédiatement avec un léger délai
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

      // 💡 On ajuste après chaque ajout pour que le texte soit recalculé dynamiquement
      requestAnimationFrame(() => {
        adjustTextSize();
      });
    } else {
      console.warn(`Pas d’image 'tile.jpg' trouvée dans le dossier : ${folder.name}`);
    }
  }


  // Ajuster la taille du texte après que toutes les images ont été chargées
  window.addEventListener('resize', adjustTextSize);

  // Si rien n’a été injecté
  if (!hasInsertedAtLeastOne) {
    loading.innerText = "Aucun projet avec image trouvé.";
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
    const fontSize = calculatedWidth * 0.07; // Essayez avec 0.088, 0.081, etc.
    text.style.fontSize = fontSize + 'px';
  });
}

window.addEventListener('DOMContentLoaded', generateGallery);


