/**
 * THE RIDE - Showcase Application
 * Features:
 *  1. Custom Arrow Cursor Tracking[cite: 1, 2]
 *  2. Subtle Parallax Float on Intro Fullscreen Background Image
 *  3. Music Play on "I'm in" Click
 *  4. Subtle Lean Tilt Physics for Highway Video
 *  5. Music Auto-Pause when leaving Hero Header zone (and resume on top)
 *  6. Horizontal Helmet Slider controls
 *  7. Eyelid Visor Blink on First Downward Scroll
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. CUSTOM CURSOR TRACKING
  // ==========================================================================
  const cursor = document.getElementById('custom-cursor');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let curX = mouseX;
  let curY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function updateCursor() {
    curX += (mouseX - curX) * 0.25;
    curY += (mouseY - curY) * 0.25;
    if (cursor) {
      cursor.style.transform = `translate(${curX}px, ${curY}px)`;
    }
    requestAnimationFrame(updateCursor);
  }
  updateCursor();

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
    targetBgX = normX * 15; // Subtle movement px
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
  // 3. AUDIO MANAGEMENT (CUSTOM USER AUDIO)
  // ==========================================================================
  const rideAudio = document.getElementById('custom-ride-audio');
  const audioBtn = document.getElementById('audio-toggle-btn');
  const soundIconOn = document.getElementById('sound-icon-on');
  const soundIconOff = document.getElementById('sound-icon-off');
  const soundLabel = document.getElementById('sound-label');

  let isAudioManuallyMuted = false;
  let isPlayingBeforeScrollOut = false;

  function playCustomMusic() {
    if (!rideAudio) return;
    rideAudio.volume = 0.75;
    rideAudio.play().then(() => {
      isPlayingBeforeScrollOut = true;
    }).catch((err) => {
      console.warn("Autoplay policy or interaction needed:", err);
    });
  }

  // Toggle button click
  audioBtn.addEventListener('click', () => {
    if (!rideAudio) return;
    if (rideAudio.paused) {
      rideAudio.play();
      isAudioManuallyMuted = false;
      soundIconOn.classList.remove('hidden');
      soundIconOff.classList.add('hidden');
      soundLabel.textContent = 'SOUND ON';
    } else {
      rideAudio.pause();
      isAudioManuallyMuted = true;
      soundIconOn.classList.add('hidden');
      soundIconOff.classList.remove('hidden');
      soundLabel.textContent = 'MUTED';
    }
  });

  // ==========================================================================
  // 4. ENTER SITE TRANSITION ("I'M IN" BUTTON)
  // ==========================================================================
  const enterBtn = document.getElementById('enter-btn');
  const introOverlay = document.getElementById('intro-overlay');
  const heroVideo = document.getElementById('hero-video');

  enterBtn.addEventListener('click', () => {
    // 1. Play your music
    playCustomMusic();

    // 2. Play highway video
    if (heroVideo) {
      heroVideo.play().catch(() => {});
    }

    // 3. Dismiss intro screen
    introOverlay.classList.add('dismissed');

    // 4. GSAP Text Animations
    gsap.from('.hero-giant-title', {
      duration: 1.2,
      y: 70,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.2
    });

    gsap.from('.bubble', {
      duration: 1,
      scale: 0.8,
      opacity: 0,
      stagger: 0.2,
      ease: 'back.out(1.7)',
      delay: 0.5
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
  // 5. SUBTLE LEAN TILT PHYSICS (NO DEGREE TEXT)
  // ==========================================================================
  const tiltRig = document.getElementById('video-tilt-rig');
  let currentLean = 0;
  let targetLean = 0;

  window.addEventListener('mousemove', (e) => {
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    targetLean = normX * 6.5; // Natural subtle 6.5 deg lean
  });

  function updateLeanPhysics() {
    currentLean += (targetLean - currentLean) * 0.08;
    if (tiltRig) {
      tiltRig.style.transform = `rotateZ(${currentLean}deg) scale(1.05) translateX(${-currentLean * 1.5}px)`;
    }
    requestAnimationFrame(updateLeanPhysics);
  }
  updateLeanPhysics();

  // ==========================================================================
  // 6. SCROLL ACTIONS:
  //    A. Auto-Stop Music when below Hero Section
  //    B. Visor Blink Animation
  // ==========================================================================
  const visor = document.getElementById('visor-transition');
  const heroSection = document.getElementById('hero-section');
  let hasBlinked = false;

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;

    // Music pauses when scrolling past hero section; resumes when back at the top
    if (rideAudio && !isAudioManuallyMuted) {
      if (scrollPos > (heroHeight - 150)) {
        if (!rideAudio.paused) {
          rideAudio.pause();
        }
      } else {
        if (rideAudio.paused && isPlayingBeforeScrollOut) {
          rideAudio.play().catch(() => {});
        }
      }
    }

    // Visor blink effect on transition
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
  // 7. HELMET CAROUSEL SLIDER CONTROLS
  // ==========================================================================
  const slider = document.getElementById('helmet-slider');
  const btnLeft = document.getElementById('slide-left');
  const btnRight = document.getElementById('slide-right');

  if (btnLeft && btnRight && slider) {
    btnLeft.addEventListener('click', () => {
      slider.scrollBy({ left: -380, behavior: 'smooth' });
    });
    btnRight.addEventListener('click', () => {
      slider.scrollBy({ left: 380, behavior: 'smooth' });
    });
  }

});