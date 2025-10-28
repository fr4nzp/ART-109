class ProjectGallery {
  constructor(projectElement, projectName, imageCount) {
    this.projectElement = projectElement;
    this.projectName = projectName;
    this.imageCount = imageCount;
    this.currentIndex = 1;
    
    this.init();
  }
  
  init() {
    const img = this.projectElement.querySelector('img');
    const container = document.createElement('div');
    container.className = 'project-image-container';
    
    img.parentNode.insertBefore(container, img);
    container.appendChild(img);
    
    const nav = document.createElement('div');
    nav.className = 'gallery-nav';
    nav.innerHTML = `
      <button class="gallery-prev" aria-label="Previous image">‹</button>
      <button class="gallery-next" aria-label="Next image">›</button>
    `;
    container.appendChild(nav);
    
    const counter = document.createElement('div');
    counter.className = 'image-counter';
    counter.textContent = `${this.currentIndex} / ${this.imageCount}`;
    container.appendChild(counter);
    
    nav.querySelector('.gallery-prev').addEventListener('click', (e) => {
      e.stopPropagation();
      this.navigate(-1);
    });
    
    nav.querySelector('.gallery-next').addEventListener('click', (e) => {
      e.stopPropagation();
      this.navigate(1);
    });
    
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.navigate(-1);
      if (e.key === 'ArrowRight') this.navigate(1);
    });
    
    img.addEventListener('click', () => this.navigate(1));
    
    this.container = container;
    this.img = img;
    this.counter = counter;
  }
  
  navigate(direction) {
    this.currentIndex += direction;
    
    if (this.currentIndex < 1) this.currentIndex = this.imageCount;
    if (this.currentIndex > this.imageCount) this.currentIndex = 1;
    
    const newSrc = `images/${this.projectName}-${this.currentIndex}.png`;
    const newSrcset = `images/${this.projectName}-${this.currentIndex}.png 2x`;
    
    this.img.src = newSrc;
    this.img.srcset = newSrcset;
    
    this.counter.textContent = `${this.currentIndex} / ${this.imageCount}`;
    
    this.img.style.opacity = '0.7';
    setTimeout(() => {
      this.img.style.opacity = '1';
    }, 100);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const projectsConfig = [
    { name: 'Health', count: 3 },
    { name: 'AEroom', count: 2 },
    { name: 'Bee', count: 2 },
  ];
  
  const projectItems = document.querySelectorAll('.project-item');
  
  projectItems.forEach((item, index) => {
    if (projectsConfig[index]) {
      const config = projectsConfig[index];
      new ProjectGallery(item, config.name, config.count);
    }
  });
});