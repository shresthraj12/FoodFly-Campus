document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================================================
  // State Variables
  // ==========================================================================
  let currentSlide = 1;
  const totalSlides = 10;
  let autoplayInterval = null;
  const autoplayDelay = 5000; // 5 seconds per slide

  // ==========================================================================
  // DOM Elements
  // ==========================================================================
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const currentSlideSpan = document.getElementById('current-slide');
  const playBtn = document.getElementById('play-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const printBtn = document.getElementById('print-btn');
  const slides = document.querySelectorAll('.slide');
  const thumbs = document.querySelectorAll('.thumb-btn');
  
  // Modal Elements
  const zoomModal = document.getElementById('zoom-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const closeModalSpan = document.querySelector('.close-modal');

  // ==========================================================================
  // Core Slide Navigation
  // ==========================================================================
  function goToSlide(slideNum) {
    if (slideNum < 1) slideNum = 1;
    if (slideNum > totalSlides) slideNum = totalSlides;

    currentSlide = slideNum;

    // Toggle slide active class
    slides.forEach(slide => {
      slide.classList.remove('active');
    });
    document.getElementById(`slide-${currentSlide}`).classList.add('active');

    // Update numbers
    currentSlideSpan.textContent = currentSlide;

    // Sync Thumbnails in footer
    thumbs.forEach(thumb => {
      thumb.classList.remove('active');
      if (parseInt(thumb.getAttribute('data-slide')) === currentSlide) {
        thumb.classList.add('active');
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }

  function nextSlide() {
    if (currentSlide < totalSlides) {
      goToSlide(currentSlide + 1);
    } else {
      if (autoplayInterval) {
        goToSlide(1);
      }
    }
  }

  function prevSlide() {
    if (currentSlide > 1) {
      goToSlide(currentSlide - 1);
    }
  }

  // ==========================================================================
  // Navigation Event Listeners
  // ==========================================================================
  prevBtn.addEventListener('click', () => {
    stopAutoplay();
    prevSlide();
  });

  nextBtn.addEventListener('click', () => {
    stopAutoplay();
    nextSlide();
  });

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      stopAutoplay();
      const slideNum = parseInt(thumb.getAttribute('data-slide'));
      goToSlide(slideNum);
    });
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ': // Spacebar
        e.preventDefault();
        stopAutoplay();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        stopAutoplay();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        stopAutoplay();
        goToSlide(1);
        break;
      case 'End':
        e.preventDefault();
        stopAutoplay();
        goToSlide(totalSlides);
        break;
      default:
        break;
    }
  });

  // ==========================================================================
  // Autoplay Timer Actions
  // ==========================================================================
  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, autoplayDelay);
    playBtn.textContent = 'Pause';
    playBtn.classList.add('accent-btn');
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
      playBtn.textContent = 'Auto-Play';
      playBtn.classList.remove('accent-btn');
    }
  }

  playBtn.addEventListener('click', () => {
    if (autoplayInterval) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  // ==========================================================================
  // Fullscreen Mode Toggle
  // ==========================================================================
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        alert(`Error enabling fullscreen mode: ${err.message}`);
      });
      fullscreenBtn.textContent = 'Exit Full';
    } else {
      document.exitFullscreen();
      fullscreenBtn.textContent = 'Fullscreen';
    }
  });

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      fullscreenBtn.textContent = 'Fullscreen';
    } else {
      fullscreenBtn.textContent = 'Exit Full';
    }
  });

  // ==========================================================================
  // Print Handler
  // ==========================================================================
  printBtn.addEventListener('click', () => {
    stopAutoplay();
    window.print();
  });

  // ==========================================================================
  // Screenshot Modal Zooms
  // ==========================================================================
  
  // Helper to open modal
  function openZoomModal(imgSrc, imgAlt) {
    zoomModal.style.display = 'block';
    modalImg.src = imgSrc;
    modalCaption.textContent = imgAlt;
  }

  // Zoom on UI items (Slide 10)
  const uiItems = document.querySelectorAll('.ui-showcase-card');
  uiItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const label = item.querySelector('.ui-card-label');
      openZoomModal(img.src, label.textContent);
    });
  });

  // Zoom on pipeline and monitoring screenshot/illustration elements (Slides 7, 8, 9)
  const illustrations = document.querySelectorAll('.side-illustration-small, .dock-graphic');
  illustrations.forEach(img => {
    img.addEventListener('click', () => {
      openZoomModal(img.src, img.alt || "Visual Showcase");
    });
  });

  function closeModal() {
    zoomModal.style.display = 'none';
  }

  closeModalSpan.addEventListener('click', closeModal);
  
  zoomModal.addEventListener('click', (e) => {
    if (e.target === zoomModal || e.target === closeModalSpan) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

});
