import { API_KEY, ROOT_FOLDER_ID } from './config.js';

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

async function getFileContent(projectId, filename) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${projectId}'+in+parents+and+name='${filename}'+and+trashed=false&key=${API_KEY}&fields=files(id,name)`;
  console.log(`Fetching file content from: ${url}`);
  const res = await fetch(url);
  const data = await res.json();
  if (!data.files || data.files.length === 0) {
    throw new Error(`File '${filename}' not found.`);
  }

  const fileId = data.files[0].id;
  const contentRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`);
  return await contentRes.text();
}

function convertLinks(text) {
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
}

function extractYouTubeVideoId(url) {
  const regex = /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/)?([a-zA-Z0-9_-]{11}))/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

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

  let html = `<h2>${getQueryParam('projectName')}</h2>`;
  html += date
    ? `<h5>${date}</h5>`
    : `<h5>Date not found</h5>`;
  if (description) {
    html += `<p>${description}</p>`;
  }

  console.log("Parsed Content HTML:", html);
  console.log("Parsed Video URL:", videoUrl);

  return { html, videoUrl };
}

async function getImagesFolderId(projectId) {
  
  const url = `https://www.googleapis.com/drive/v3/files?q='${projectId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+name='images'&key=${API_KEY}&fields=files(id,name)`;
  console.log(`Fetching images folder ID from: ${url}`);

  const res = await fetch(url);
  const data = await res.json();

  if (!data.files || data.files.length === 0) {
    throw new Error("The 'images' subfolder was not found in this project.");
  }

  return data.files[0].id;
}

async function getImagesFromFolder(imagesFolderId) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${imagesFolderId}'+in+parents+and+mimeType+contains+'image/'&key=${API_KEY}&fields=files(id,name,mimeType)`;
  console.log(`Fetching images from folder: ${url}`);

  const res = await fetch(url);
  const data = await res.json();

  if (!data.files || data.files.length === 0) {
    throw new Error("No images found in the 'images' subfolder.");
  }

  return data.files;
}

async function displayProjectImages() {
  const imagesSection = document.getElementById('imagesSection');
  const projectId = getQueryParam('id');

  try {
    const imagesFolderId = await getImagesFolderId(projectId);
    console.log("Images Folder ID:", imagesFolderId);

    const imageFiles = await getImagesFromFolder(imagesFolderId);
    console.log("Image Files:", imageFiles);

    let imagesHTML = '';

    imageFiles.sort((a, b) => {
      return parseInt(a.name.split('.')[0], 10) - parseInt(b.name.split('.')[0], 10);
    });

    imageFiles.forEach((file, index) => {
      const imagePath = `https://lh3.googleusercontent.com/d/${file.id}`;
      const originalUrl = `https://lh3.googleusercontent.com/d/${file.id}=s0`;

      imagesHTML += `
        <div class="project-image">
          <div class="img-hq-wrapper">
            <img src="${imagePath}" alt="Project Image ${index + 1}" class="project-img"/>
            <a href="${originalUrl}" target="_blank" rel="noopener noreferrer" class="hq-button" title="View image in high quality">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="miter" stroke-linecap="square" aria-hidden="true" focusable="false" role="img">
                <path d="M3 8 V3 H8 M16 3 H21 V8 M21 16 V21 H16 M8 21 H3 V16"/>
              </svg>
            </a>
          </div>
        </div>
      `;
    });

    imagesSection.innerHTML = imagesHTML;

  } catch (error) {
    console.error("Error displaying images:", error);
    imagesSection.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}


async function getFolderIdByName(parentId, folderName) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${parentId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+name='${folderName}'&key=${API_KEY}&fields=files(id,name)`;
  const res = await fetch(url);
  const data = await res.json();
  return data.files[0]?.id;
}



async function loadProjectContent() {
  const projectId = getQueryParam('id');
  const projectName = getQueryParam('projectName');
  const contentContainer = document.getElementById('projectContent');
  const videoContainer = document.getElementById('videoSection');

  
  if (!projectId || !projectName) {
    contentContainer.innerHTML = '<p>Error: Missing project ID or name.</p>';
    return;
  }
  
  try {
    const rawContent = await getFileContent(projectId, 'content.txt');
    const { html, videoUrl } = parseContent(rawContent);
    
    contentContainer.innerHTML = html;

  
    if (videoUrl) {
      const videoId = extractYouTubeVideoId(videoUrl);
      if (videoId) {
        videoContainer.innerHTML = `
          <div class="project-video-container">
            <iframe
              src="https://www.youtube.com/embed/${videoId}"
              frameborder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>
          </div>
        `;
        }
      }

    
    await displayProjectImages();  
        
    document.getElementById('loading').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';


  } catch (error) {
    console.error("Error loading project content:", error);
    contentContainer.innerHTML = `<p>Error: ${error.message}</p>`;
  }

}


window.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM fully loaded and parsed");
  await loadProjectContent();
});


  async function getProjectsFolderId() {
      return await getFolderIdByName(ROOT_FOLDER_ID, 'Projects');
  }

  async function listProjectFolders(projectsFolderId) {
      const url = `https://www.googleapis.com/drive/v3/files?q='${projectsFolderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&key=${API_KEY}&fields=files(id,name,createdTime)`;
      const res = await fetch(url);
      const data = await res.json();
      return data.files.sort((a, b) => new Date(a.createdTime) - new Date(b.createdTime));
  }

  async function updateDockNavigation() {
      const currentProjectId = getQueryParam('id');
      const projectsFolderId = await getProjectsFolderId();
      if (!projectsFolderId) return;

      const projectFolders = await listProjectFolders(projectsFolderId);
      if (!projectFolders || !Array.isArray(projectFolders)) return;

      const currentIndex = projectFolders.findIndex(project => project.id === currentProjectId);
      if (currentIndex === -1) return;

      const prevIndex = (currentIndex - 1 + projectFolders.length) % projectFolders.length;
      const nextIndex = (currentIndex + 1) % projectFolders.length;

      const prevProject = projectFolders[prevIndex];
      const nextProject = projectFolders[nextIndex];

      const prevProjectLink = `project_details.html?id=${prevProject.id}&projectName=${encodeURIComponent(prevProject.name)}`;
      const nextProjectLink = `project_details.html?id=${nextProject.id}&projectName=${encodeURIComponent(nextProject.name)}`;

      const dockPrev = document.getElementById('dockPrevProject');
      const dockNext = document.getElementById('dockNextProject');
      if (dockPrev) dockPrev.setAttribute('href', nextProjectLink);
      if (dockNext) dockNext.setAttribute('href', prevProjectLink);
  }

  window.addEventListener('DOMContentLoaded', async () => {
      await updateDockNavigation();
  });
