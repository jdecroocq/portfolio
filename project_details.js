function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function convertUrlsToLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

async function loadProjectContent() {
  const projectId = getQueryParam('id');
  
  const mainContent = document.getElementById('mainContent');
  const projectContentContainer = document.getElementById('projectContent');
  const videoContainer = document.getElementById('videoSection');
  const imagesContainer = document.getElementById('imagesSection');

  mainContent.style.display = 'block';

  if (!projectId) {
    mainContent.innerHTML = '<h1>Error: Project ID is missing from the URL.</h1>';
    return;
  }

  try {
    const response = await fetch(`/portfolio/projects/${projectId}/project.json`);
    if (!response.ok) {
      throw new Error(`Project not found (HTTP ${response.status})`);
    }
    const projectData = await response.json();

    const listResponse = await fetch('/portfolio/projects/projects-list.json');
    const projectList = await listResponse.json();
    const projectInfo = projectList.find(p => p.id === projectId);
    const projectTitle = projectInfo ? projectInfo.title : projectId;
    document.title = projectTitle;

    let contentHTML = `<h2>${projectTitle}</h2><h5>Published on ${projectData.date}</h5>`;
    const formattedDescription = convertUrlsToLinks(projectData.description);
    
    projectContentContainer.style.whiteSpace = 'pre-wrap';
    projectContentContainer.innerHTML = contentHTML + formattedDescription;

    videoContainer.innerHTML = '';
    if (projectData.youtubeId) {
      videoContainer.innerHTML = `
        <div class="project-video-container">
          <iframe
            src="https://www.youtube.com/embed/${projectData.youtubeId}"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      `;
    }
    
    imagesContainer.innerHTML = '';
    if (projectData.imageCount && projectData.imageCount > 0) {
      let imagesHTML = '';
      for (let i = 1; i <= projectData.imageCount; i++) {
        const imageNumber = String(i).padStart(2, '0');
        const imageExtension = 'jpg';
        const webPath = `/portfolio/projects/${projectId}/web/${imageNumber}.${imageExtension}`;
        const fullPath = `/portfolio/projects/${projectId}/full/${imageNumber}.${imageExtension}`;

        imagesHTML += `
          <div class="project-image">
            <div class="img-hq-wrapper">
              <img src="${webPath}" alt="${projectTitle} - Image ${i}" class="project-img"/>
              <a href="${fullPath}" target="_blank" rel="noopener noreferrer" class="hq-button" title="View image in high quality">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="miter" stroke-linecap="square" aria-hidden="true" focusable="false" role="img">
                  <path d="M3 8 V3 H8 M16 3 H21 V8 M21 16 V21 H16 M8 21 H3 V16"/>
                </svg>
              </a>
            </div>
          </div>
        `;
      }
      imagesContainer.innerHTML = imagesHTML;
    }

  } catch (error) {
    console.error("Failed to load project content:", error);
    mainContent.innerHTML = `<h1>Error loading project.</h1><p>${error.message}</p>`;
  }
}

async function updateDockNavigation() {
  const currentProjectId = getQueryParam('id');
  if (!currentProjectId) return;

  try {
    const response = await fetch('/portfolio/projects/projects-list.json');
    const projects = await response.json();
    
    const currentIndex = projects.findIndex(project => project.id === currentProjectId);
    if (currentIndex === -1) {
        console.error("Could not find current project in the project list. Navigation will not work.");
        return;
    }

    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    const nextIndex = (currentIndex + 1) % projects.length;

    const prevProject = projects[prevIndex];
    const nextProject = projects[nextIndex];

    document.getElementById('dockPrevProject').href = `/portfolio/project_details.html?id=${prevProject.id}`;
    document.getElementById('dockNextProject').href = `/portfolio/project_details.html?id=${nextProject.id}`;

  } catch (error) {
    console.error("Failed to update dock navigation:", error);
  }
}

function updateFloatingDockPosition() {
  const dock = document.querySelector('.floating-dock');
  const footer = document.getElementById('footer-placeholder');
  if (!dock || !footer) return;

  const minSpace = 0;
  const footerRect = footer.getBoundingClientRect();
  const overlap = window.innerHeight - footerRect.top + minSpace;

  if (overlap > 0) {
    dock.style.transform = `translateX(-50%) translateY(-${overlap}px)`;
  } else {
    dock.style.transform = 'translateX(-50%) translateY(0)';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadProjectContent();
  updateDockNavigation();
  updateFloatingDockPosition();
});

window.addEventListener('scroll', updateFloatingDockPosition);
window.addEventListener('resize', updateFloatingDockPosition);

const mainContentObserver = document.getElementById('mainContent');
if (mainContentObserver) {
  const resizeObserver = new ResizeObserver(updateFloatingDockPosition);
  resizeObserver.observe(mainContentObserver);
}
