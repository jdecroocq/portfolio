const API_KEY = 'AIzaSyDH_v9G1JUD-NEkm1bnpWlbty588Kml5Hs';
const ROOT_FOLDER_ID = '1UzmdatXkevjNC4-D_D_kL8s8BcAS8vEC'; // ID du dossier racine "Portfolio"

// Obtenir un paramètre d'URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Récupérer le contenu d'un fichier sur Google Drive
async function getFileContent(projectId, filename) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${projectId}'+in+parents+and+name='${filename}'+and+trashed=false&key=${API_KEY}&fields=files(id,name)`;
  console.log(`Fetching file content from: ${url}`);
  const res = await fetch(url);
  const data = await res.json();
  if (!data.files || data.files.length === 0) {
    throw new Error(`Fichier '${filename}' introuvable.`);
  }

  const fileId = data.files[0].id;
  const contentRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`);
  return await contentRes.text();
}

// Convertir les liens en balises <a>
function convertLinks(text) {
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
}

// Extraire l'ID de la vidéo YouTube
function extractYouTubeVideoId(url) {
  const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/)?([a-zA-Z0-9_-]{11}))/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Analyse du contenu texte
function parseContent(raw) {
  const lines = raw.trim().split('\n');
  let date = '';
  let description = '';
  let videoUrl = '';
  let isDescription = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('content-01')) {
      const nextLine = lines[i + 1];
      if (nextLine) {
        date = nextLine.trim();
        i++;
      }
    } else if (line.startsWith('content-02')) {
      isDescription = true;
      const nextLine = lines[i + 1];
      if (nextLine) {
        description = convertLinks(nextLine.trim());
        i++;
      }
    } else if (line.startsWith('content-03')) {
      const nextLine = lines[i + 1];
      if (nextLine && nextLine.startsWith('http')) {
        videoUrl = nextLine.trim();
        i++;
      }
    } else if (isDescription) {
      description += `<br>${convertLinks(line.trim())}`;
    }
  }

  // Construction du HTML description
  let html = `<h1>${getQueryParam('projectName')}</h1>`;
  html += date
    ? `<span class="project-date">${date}</span>`
    : `<span class="project-date">Date non trouvée</span>`;
  if (description) {
    html += `<p class="project-description">${description}</p>`;
  }

  console.log("Parsed Content HTML:", html);
  console.log("Parsed Video URL:", videoUrl);

  // Retourne l'objet complet
  return { html, videoUrl };
}

// Fonction pour récupérer les fichiers du sous-dossier "images" dans Google Drive
async function getImagesFolderId(projectId) {
  // Rechercher le sous-dossier "images" dans le dossier du projet
  const url = `https://www.googleapis.com/drive/v3/files?q='${projectId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+name='images'&key=${API_KEY}&fields=files(id,name)`;
  console.log(`Fetching images folder ID from: ${url}`);

  const res = await fetch(url);
  const data = await res.json();

  if (!data.files || data.files.length === 0) {
    throw new Error("Le sous-dossier 'images' n'a pas été trouvé dans ce projet.");
  }

  return data.files[0].id; // Retourner l'ID du sous-dossier "images"
}

async function getImagesFromFolder(imagesFolderId) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${imagesFolderId}'+in+parents+and+mimeType+contains+'image/'&key=${API_KEY}&fields=files(id,name,mimeType)`;
  console.log(`Fetching images from folder: ${url}`);

  const res = await fetch(url);
  const data = await res.json();

  if (!data.files || data.files.length === 0) {
    throw new Error("Aucune image trouvée dans le sous-dossier 'images'.");
  }

  return data.files; // Retourner la liste des fichiers image trouvés dans le sous-dossier "images"
}

async function displayProjectImages() {
  const imagesSection = document.getElementById('imagesSection');
  const projectId = getQueryParam('id'); // ID du projet, nécessaire pour récupérer les images

  try {
    // 1: Récupérer l'ID du sous-dossier "images" à partir de l'ID du projet
    const imagesFolderId = await getImagesFolderId(projectId);
    console.log("Images Folder ID:", imagesFolderId);

    // 2: Récupérer les images du sous-dossier "images"
    const imageFiles = await getImagesFromFolder(imagesFolderId);
    console.log("Image Files:", imageFiles);

    let imagesHTML = '';

    // Tri des images par ordre croissant basé sur le nom de fichier (par exemple 01.jpg, 02.jpg, etc.)
    imageFiles.sort((a, b) => {
      return parseInt(a.name.split('.')[0], 10) - parseInt(b.name.split('.')[0], 10);
    });

    // Affichage des images
    imageFiles.forEach((file, index) => {
      const imagePath = `https://lh3.googleusercontent.com/d/${file.id}`;
      const originalUrl = `https://lh3.googleusercontent.com/d/${file.id}=s0`;

      imagesHTML += `
        <div class="project-image">
          <div class="img-hq-wrapper">
            <img src="${imagePath}" alt="Project Image ${index + 1}" class="project-img"/>
            <a href="${originalUrl}" target="_blank" rel="noopener noreferrer" class="hq-button" aria-label="Afficher en haute qualité">
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" focusable="false">
                <g stroke="#fff" stroke-width="2" fill="none">
                  <polyline points="2,7 2,2 7,2"/>
                  <polyline points="15,2 20,2 20,7"/>
                  <polyline points="20,15 20,20 15,20"/>
                  <polyline points="7,20 2,20 2,15"/>
                </g>
              </svg>
            </a>
          </div>
        </div>
      `;
    });

    // Insérer les images dans la section
    imagesSection.innerHTML = imagesHTML;

  } catch (error) {
    console.error("Error displaying images:", error);
    imagesSection.innerHTML = `<p>Erreur : ${error.message}</p>`;
  }
}


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



// Chargement du contenu
async function loadProjectContent() {
  const projectId = getQueryParam('id');
  const projectName = getQueryParam('projectName');
  const contentContainer = document.getElementById('projectContent');
  const videoContainer = document.getElementById('videoSection');

  
  if (!projectId || !projectName) {
    contentContainer.innerHTML = '<p>Erreur : ID ou nom du projet manquant.</p>';
    return;
  }
  
  try {
    const rawContent = await getFileContent(projectId, 'content.txt');
    const { html, videoUrl } = parseContent(rawContent);
    
    // Injecte le contenu dans le conteneur avec l'effet
    contentContainer.innerHTML = html;

  
    // Affichage de la vidéo si elle existe
    if (videoUrl) {
      const videoId = extractYouTubeVideoId(videoUrl);
      if (videoId) {
          videoContainer.innerHTML = `
            <div class="project-media">
              <iframe 
                class="media-content"
                src="https://www.youtube.com/embed/${videoId}"
                frameborder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
              </iframe>
            </div>
          `;
        }
      }

    
    // Attendre que les images soient affichées avant de montrer le contenu principal
    await displayProjectImages();  
        
    // ✅ Masquer le loading, afficher le vrai contenu
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';


  } catch (error) {
    console.error("Error loading project content:", error);
    contentContainer.innerHTML = `<p>Erreur : ${error.message}</p>`;
  }

}


window.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM fully loaded and parsed");
  await loadProjectContent();
});

  // === NAVIGATION DOCK DYNAMIQUE ===

  // Retourne l'ID du dossier "Projects"
  async function getProjectsFolderId() {
      return await getFolderIdByName(ROOT_FOLDER_ID, 'Projects');
  }

  // Liste tous les dossiers projets dans "Projects"
  async function listProjectFolders(projectsFolderId) {
      const url = `https://www.googleapis.com/drive/v3/files?q='${projectsFolderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&key=${API_KEY}&fields=files(id,name,createdTime)`;
      const res = await fetch(url);
      const data = await res.json();
      // Trie par date de création croissante (ou adapte selon ordre voulu)
      return data.files.sort((a, b) => new Date(a.createdTime) - new Date(b.createdTime));
  }

  // Met à jour les liens du dock
  async function updateDockNavigation() {
      const currentProjectId = getQueryParam('id');
      const projectsFolderId = await getProjectsFolderId();
      if (!projectsFolderId) return;

      const projectFolders = await listProjectFolders(projectsFolderId);
      if (!projectFolders || !Array.isArray(projectFolders)) return;

      const currentIndex = projectFolders.findIndex(project => project.id === currentProjectId);
      if (currentIndex === -1) return;

      // Calcul précédent/suivant
      const prevIndex = (currentIndex - 1 + projectFolders.length) % projectFolders.length;
      const nextIndex = (currentIndex + 1) % projectFolders.length;

      const prevProject = projectFolders[prevIndex];
      const nextProject = projectFolders[nextIndex];

      // Construction des liens
      const prevProjectLink = `project_details.html?id=${prevProject.id}&projectName=${encodeURIComponent(prevProject.name)}`;
      const nextProjectLink = `project_details.html?id=${nextProject.id}&projectName=${encodeURIComponent(nextProject.name)}`;

      // Mise à jour des href des flèches dock
      const dockPrev = document.getElementById('dockPrevProject');
      const dockNext = document.getElementById('dockNextProject');
      if (dockPrev) dockPrev.setAttribute('href', nextProjectLink);
      if (dockNext) dockNext.setAttribute('href', prevProjectLink);
  }

  // Appelle la fonction au chargement
  window.addEventListener('DOMContentLoaded', async () => {
      await updateDockNavigation();
  });
