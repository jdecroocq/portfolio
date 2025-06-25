const API_KEY = 'AIzaSyDH_v9G1JUD-NEkm1bnpWlbty588Kml5Hs';
const ROOT_FOLDER_ID = '1UzmdatXkevjNC4-D_D_kL8s8BcAS8vEC';

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

async function getFileContent(projectId, filename) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${projectId}'+in+parents+and+name='${filename}'+and+trashed=false&key=${API_KEY}&fields=files(id,name)`;
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
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
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
  let html = `<h1>${getQueryParam('projectName')}</h1>`;
  html += date
    ? `<span class="project-date">${date}</span>`
    : `<span class="project-date">Date not found</span>`;
  if (description) {
    html += `<p class="project-description">${description}</p>`;
  }
  return { html, videoUrl };
}

async function getImagesFolderId(projectId) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${projectId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+name='images'&key=${API_KEY}&fields=files(id,name)`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.files || data.files.length === 0) {
    throw new Error("The 'images' subfolder was not found in this project.");
  }
  return data.files[0].id;
}

async function getImagesFromFolder(imagesFolderId) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${imagesFolderId}'+in+parents+and+mimeType+contains+'image/'&key=${API_KEY}&fields=files(id,name,mimeType)`;
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
    const imageFiles = await getImagesFromFolder(imagesFolderId);
    imageFiles.sort((a, b) => {
      return parseInt(a.name.split('.')[0], 10) - parseInt(b.name.split('.')[0], 10);
    });
    let imagesHTML = '';
    imageFiles.forEach((file, index) => {
      const imagePath = `https://lh3.googleusercontent.com/d/${file.id}`;
      const originalUrl = `https://lh3.googleusercontent.com/d/${file.id}=s0`;
      imagesHTML += `
        <div class="project-image">
          <div class="img-hq-wrapper">
            <img src="${imagePath}" alt="Project Image ${index + 1}" class="project-img"/>
            <a href="${originalUrl}" target="_blank" rel="noopener noreferrer" class="hq-button" aria-label="Open high quality image in new tab">HQ</a>
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

async function listProjectFolders(projectsFolderId) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${projectsFolderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'&key=${API_KEY}&fields=files(id,name,createdTime)`;
  const res = await fetch(url);
  const data = await res.json();
  return data.files;
}

async function updateProjectNavigation() {
  const currentProjectId = getQueryParam('id');
  const projectsFolderId = await getFolderIdByName(ROOT_FOLDER_ID, 'Projects');
  if (!projectsFolderId) {
    console.error("The 'Projects' folder was not found.");
    return;
  }
  const projectFolders = await listProjectFolders(projectsFolderId);
  const currentIndex = projectFolders.findIndex(project => project.id === currentProjectId);
  if (currentIndex === -1) {
    console.error("The specified project was not found.");
    return;
  }
  const prevIndex = (currentIndex - 1 + projectFolders.length) % projectFolders.length;
  const nextIndex = (currentIndex + 1) % projectFolders.length;
  const prevProject = projectFolders[prevIndex];
  const nextProject = projectFolders[nextIndex];
  const prevProjectLink = `project_details.html?id=${prevProject.id}&projectName=${encodeURIComponent(prevProject.name)}`;
  const nextProjectLink = `project_details.html?id=${nextProject.id}&projectName=${encodeURIComponent(nextProject.name)}`;
  const prevArrow = document.getElementById('prevProject');
  const nextArrow = document.getElementById('nextProject');
  if (prevArrow) prevArrow.setAttribute('href', prevProjectLink);
  if (nextArrow) nextArrow.setAttribute('href', nextProjectLink);
}

async function loadProjectContent() {
  const projectId = getQueryParam('id');
  const projectName = getQueryParam('projectName');
  const contentContainer = document.getElementById('projectContent');
  const videoContainer = document.getElementById('videoSection');
  await updateProjectNavigation();
  if (!projectId || !projectName) {
    contentContainer.innerHTML = '<p>Error: Project ID or name is missing.</p>';
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
          <div class="project-media">
            <iframe 
              class="media-content"
              src="https://www.youtube.com/embed/${videoId}"
              frameborder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              title="YouTube video">
            </iframe>
          </div>
        `;
      }
    }
    await displayProjectImages();
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
  } catch (error) {
    console.error("Error loading project content:", error);
    contentContainer.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadProjectContent();
});
