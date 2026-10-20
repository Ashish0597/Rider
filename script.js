/**
 * THE RIDE - Showcase Application (Mobile Interactivity Enhanced)
 * Features:
 *  1. Custom Arrow Cursor Tracking (Desktop Only)[cite: 1, 2]
 *  2. Desktop Mouse Parallax + Mobile Gyroscope Tilt (DeviceOrientation)
 *  3. Mobile Touch Drag Physics (Horizontal swipe leaning in Hero section)
 *  4. Audio Management with Auto-Stop on Scroll & Mobile Header Sync
 *  5. Touch Carousel with Swipe Dot Indicators
 *  6. Eye-Visor Close/Open Blink Scroll Transition
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. CUSTOM CURSOR TRACKING (DESKTOP ONLY)
  // ==========================================================================
  const cursor = document.getElementById('custom-cursor');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let curX = mouseX;
  let curY = mouseY;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!isTouchDevice && cursor) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateCursor() {
      curX += (mouseX - curX) * 0.25;
      curY += (mouseY - curY) * 0.25;
      cursor.style.transform = `translate(${curX}px, ${curY}px)`;
      requestAnimationFrame(updateCursor);
    }
    updateCursor();
  }

  // ==========================================================================
  // 2. INTRO FULLSCREEN BACKGROUND IMAGE PARALLAX
  // ==========================================================================
  const introBgImg = document.getElementById('intro-bg-img');
  let bgTiltX = 0;
  let bgTiltY = 0;
  let targetBgX = 0;
  let targetBgY = 0;

  window.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = (e.clientY / window.innerHeight) * 2 - 1;
    targetBgX = normX * 15;
    targetBgY = normY * 12;
  });

  function animateIntroBackground() {
    bgTiltX += (targetBgX - bgTiltX) * 0.05;
    bgTiltY += (targetBgY - bgTiltY) * 0.05;
    if (introBgImg) {
      introBgImg.style.transform = `scale(1.08) translate(${-bgTiltX}px, ${-bgTiltY}px)`;
    }
    requestAnimationFrame(animateIntroBackground);
  }
  animateIntroBackground();

  // ==========================================================================
  // 3. AUDIO MANAGEMENT (DESKTOP HUD & MOBILE HEADER BUTTON)
  // ==========================================================================
  const rideAudio = document.getElementById('custom-ride-audio');
  const audioBtn = document.getElementById('audio-toggle-btn');
  const mobileHeaderSoundBtn = document.getElementById('header-mobile-sound-btn');
  const soundIconOn = document.getElementById('sound-icon-on');
  const soundIconOff = document.getElementById('sound-icon-off');
  const soundLabel = document.getElementById('sound-label');

  let isAudioManuallyMuted = false;
  let isPlayingBeforeScrollOut = false;

  function syncAudioUI(isPlaying) {
    if (isPlaying) {
      if (soundIconOn) soundIconOn.classList.remove('hidden');
      if (soundIconOff) soundIconOff.classList.add('hidden');
      if (soundLabel) soundLabel.textContent = 'SOUND ON';
      if (mobileHeaderSoundBtn) mobileHeaderSoundBtn.textContent = '🔊';
    } else {
      if (soundIconOn) soundIconOn.classList.add('hidden');
      if (soundIconOff) soundIconOff.classList.remove('hidden');
      if (soundLabel) soundLabel.textContent = 'MUTED';
      if (mobileHeaderSoundBtn) mobileHeaderSoundBtn.textContent = '🔇';
    }
  }

  function toggleAudio() {
    if (!rideAudio) return;
    if (rideAudio.paused) {
      rideAudio.play().then(() => {
        isAudioManuallyMuted = false;
        isPlayingBeforeScrollOut = true;
        syncAudioUI(true);
      }).catch(() => {});
    } else {
      rideAudio.pause();
      isAudioManuallyMuted = true;
      syncAudioUI(false);
    }
  }

  if (audioBtn) audioBtn.addEventListener('click', toggleAudio);
  if (mobileHeaderSoundBtn) mobileHeaderSoundBtn.addEventListener('click', toggleAudio);

  function playCustomMusic() {
    if (!rideAudio) return;
    rideAudio.volume = 0.75;
    rideAudio.play().then(() => {
      isPlayingBeforeScrollOut = true;
      syncAudioUI(true);
    }).catch((err) => {
      console.warn("User interaction required for autoplay:", err);
    });
  }

  // ==========================================================================
  // 4. ENTER SITE TRANSITION ("I'M IN" BUTTON) & GYRO PERMISSION
  // ==========================================================================
  const enterBtn = document.getElementById('enter-btn');
  const introOverlay = document.getElementById('intro-overlay');
  const heroVideo = document.getElementById('hero-video');

  enterBtn.addEventListener('click', () => {
    playCustomMusic();

    if (heroVideo) {
      heroVideo.play().catch(() => {});
    }

    // Request Device Orientation permission on iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
        }
      }).catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    introOverlay.classList.add('dismissed');

    gsap.from('.hero-giant-title', {
      duration: 1.2,
      y: 60,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.2
    });

    gsap.from('.bubble', {
      duration: 1,
      scale: 0.8,
      opacity: 0,
      stagger: 0.15,
      ease: 'back.out(1.7)',
      delay: 0.4
    });
  });

  // Video progress fill
  const progressFill = document.getElementById('audio-progress');
  if (heroVideo) {
    heroVideo.addEventListener('timeupdate', () => {
      if (heroVideo.duration) {
        const pct = (heroVideo.currentTime / heroVideo.duration) * 100;
        progressFill.style.width = `${pct}%`;
      }
    });
  }

  // ==========================================================================
  // 5. HYBRID LEAN PHYSICS (MOUSE + GYROSCOPE + TOUCH DRAG)
  // ==========================================================================
  const tiltRig = document.getElementById('video-tilt-rig');
  let currentLean = 0;
  let targetLean = 0;

  // A. Desktop Mouse Move
  window.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    targetLean = normX * 6.5;
  });

  // B. Mobile Gyroscope / Device Tilt
  function handleOrientation(event) {
    if (event.gamma !== null) {
      // Gamma is left-to-right tilt in degrees (-90 to +90)
      const clampedGamma = Math.max(-30, Math.min(30, event.gamma));
      targetLean = (clampedGamma / 30) * 8.5; // Up to 8.5 degrees lean
    }
  }

  // C. Mobile Touch Drag on Hero Stage
  const heroStage = document.getElementById('hero-section');
  let touchStartX = 0;
  let isTouchingHero = false;

  if (heroStage) {
    heroStage.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      isTouchingHero = true;
    }, { passive: true });

    heroStage.addEventListener('touchmove', (e) => {
      if (!isTouchingHero) return;
      const touchX = e.touches[0].clientX;
      const diffX = touchX - touchStartX;
      const normDiff = Math.max(-1, Math.min(1, diffX / (window.innerWidth * 0.4)));
      targetLean = normDiff * 9.0;
    }, { passive: true });

    heroStage.addEventListener('touchend', () => {
      isTouchingHero = false;
      targetLean = 0; // Return to center when touch released
    });
  }

  function updateLeanPhysics() {
    currentLean += (targetLean - currentLean) * 0.08;
    if (tiltRig) {
      tiltRig.style.transform = `rotateZ(${currentLean}deg) scale(1.06) translateX(${-currentLean * 1.5}px)`;
    }
    requestAnimationFrame(updateLeanPhysics);
  }
  updateLeanPhysics();

  // ==========================================================================
  // 6. SCROLL ACTIONS: AUDIO AUTO-STOP & VISOR BLINK
  // ==========================================================================
  const visor = document.getElementById('visor-transition');
  const heroSection = document.getElementById('hero-section');
  let hasBlinked = false;

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;

    // Auto-Stop Audio below Hero Section
    if (rideAudio && !isAudioManuallyMuted) {
      if (scrollPos > (heroHeight - 140)) {
        if (!rideAudio.paused) {
          rideAudio.pause();
          syncAudioUI(false);
        }
      } else {
        if (rideAudio.paused && isPlayingBeforeScrollOut) {
          rideAudio.play().then(() => syncAudioUI(true)).catch(() => {});
        }
      }
    }

    // Visor blink effect
    if (scrollPos > 100 && scrollPos < 600 && !hasBlinked) {
      hasBlinked = true;
      visor.classList.add('blinking');
      setTimeout(() => {
        visor.classList.remove('blinking');
      }, 550);
    } else if (scrollPos <= 50) {
      hasBlinked = false;
    }
  });

  // ==========================================================================
  // 7. HELMET CAROUSEL CONTROLS & MOBILE DOT INDICATORS
  // ==========================================================================
  const slider = document.getElementById('helmet-slider');
  const btnLeft = document.getElementById('slide-left');
  const btnRight = document.getElementById('slide-right');
  const dotsContainer = document.getElementById('slider-dots');
  const cards = slider ? slider.querySelectorAll('.product-card') : [];

  // Generate mobile dots dynamically
  if (dotsContainer && cards.length > 0) {
    cards.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (idx === 0) dot.classList.add('active');
      dotsContainer.appendChild(dot);
    });
  }

  // Update active dot on scroll
  if (slider && dotsContainer) {
    slider.addEventListener('scroll', () => {
      const scrollLeft = slider.scrollLeft;
      const cardWidth = cards[0] ? cards[0].offsetWidth + 24 : 300;
      const activeIndex = Math.round(scrollLeft / cardWidth);
      const dots = dotsContainer.querySelectorAll('.dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex);
      });
    }, { passive: true });
  }

  if (btnLeft && btnRight && slider) {
    btnLeft.addEventListener('click', () => {
      const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.85 : 360;
      slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    btnRight.addEventListener('click', () => {
      const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.85 : 360;
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }

  // ==========================================================================
  // 8. MOBILE BOTTOM DOCK ACTIVE LINK SYNC ON SCROLL
  // ==========================================================================
  const dockBtns = document.querySelectorAll('.dock-btn');
  const sections = document.querySelectorAll('section[id], header');

  window.addEventListener('scroll', () => {
    let currentId = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 200;
      if (window.scrollY >= top) {
        currentId = sec.getAttribute('id');
      }
    });

    dockBtns.forEach((btn) => {
      const href = btn.getAttribute('href').replace('#', '');
      btn.classList.toggle('active', href === currentId);
    });
  }, { passive: true });

});