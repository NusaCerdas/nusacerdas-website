/* ================================================================
   main.js — dipakai index.html dan halaman kategori produk
   (dasbor-kelas.html, lab-virtual.html, pustaka-digital.html, nusaquiz.html).
   Setiap fitur memeriksa elemennya dulu, jadi aman dimuat di halaman
   yang tidak memiliki semua section.
   ================================================================ */

(function () {
  /* === Device capability & reduced motion === */
  const isLowEnd = (() => {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    return cores < 4 || memory < 4 || (isMobile && cores < 6);
  })();
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Layout untuk efek scroll dimatikan lewat CSS body.reduced-motion, jadi JS-nya juga harus berhenti
  const disableScrollFX = prefersReduced || isLowEnd;
  if (disableScrollFX) document.body.classList.add('reduced-motion');

  /* === Keyboard untuk elemen non-button yang berperan sebagai tombol === */
  document.addEventListener('keydown', e => {
    const el = e.target;
    if (!(el instanceof HTMLElement) || el.getAttribute('role') !== 'button' || el.tagName === 'BUTTON') return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.click();
    }
  });

  /* === NusaQuiz: tombol mode mengganti gambar mockup === */
  const quizOptions = document.querySelectorAll('.quiz-option');
  quizOptions.forEach((option, i) => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.quiz-mockup-inner img').forEach((img, j) => img.classList.toggle('active', i === j));
      quizOptions.forEach(o => o.setAttribute('aria-pressed', String(o === option)));
    });
  });

  /* === Count-up === */
  function animateCountUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    if (prefersReduced) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* === Reveal-on-scroll === */
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('.count-up').forEach(animateCountUp);
      revealIO.unobserve(e.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(
    'section, .product-card, .quote-card, .problem-card, .trust-card, .stat-band-inner, .stat-cell, .product-grid, .quote-grid, .problem-grid, .solution-grid, .trust-grid, .comparison-grid, .compare-card'
  ).forEach(el => {
    el.classList.add('reveal');
    revealIO.observe(el);
  });

  /* === Nav auto-hide on scroll down, reveal on scroll up === */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    let lastScrollY = window.scrollY;
    const updateNav = () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 30);
      nav.classList.toggle('nav-hidden', y > lastScrollY && y > 80);
      lastScrollY = y;
    };
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  /* === Hero image parallax zoom === */
  function updateHeroParallax() {
    if (disableScrollFX) return;
    const heroImg = document.querySelector('.hero-visual-img .hero-slide.active img');
    if (!heroImg) return;
    const rect = heroImg.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / (rect.height || 1)));
    heroImg.style.transform = `scale(${1.06 + progress * 0.08}) translateY(${progress * -20}px)`;
  }
  if (!disableScrollFX && document.querySelector('.hero-visual-img')) {
    window.addEventListener('scroll', updateHeroParallax, { passive: true });
    updateHeroParallax();
  }

  /* === Hero slider === */
  (function () {
    const hero = document.querySelector('.hero-visual-img');
    const slides = document.querySelectorAll('.hero-visual-img .hero-slide');
    const dots = document.querySelectorAll('.hero-visual-img .hero-dot');
    if (!hero || !slides.length) return;
    let current = 0;
    let timer = null;
    let heroVisible = true;

    function goTo(idx) {
      slides[current].classList.remove('active');
      dots[current]?.classList.remove('active');
      dots[current]?.setAttribute('aria-current', 'false');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current]?.classList.add('active');
      dots[current]?.setAttribute('aria-current', 'true');
    }

    // Autoplay hanya bila pengguna tidak meminta reduced motion, tab aktif, dan hero terlihat
    function syncAutoplay() {
      clearInterval(timer);
      timer = null;
      if (prefersReduced || document.hidden || !heroVisible) return;
      timer = setInterval(() => goTo(current + 1), 4000);
    }

    document.querySelector('.hero-slider-prev')?.addEventListener('click', () => { goTo(current - 1); syncAutoplay(); });
    document.querySelector('.hero-slider-next')?.addEventListener('click', () => { goTo(current + 1); syncAutoplay(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); syncAutoplay(); }));

    document.addEventListener('visibilitychange', syncAutoplay);
    new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
      syncAutoplay();
    }).observe(hero);
  })();

  /* === Smooth scroll for anchors === */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    // Trigger & link di mega-menu punya handler sendiri (tutup menu dulu, baru scroll)
    if (a.id === 'produkTrigger' || a.closest('#produkMenu')) return;
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* === "Lihat Selengkapnya" toggle === */
  (function () {
    const btn = document.querySelector('.selengkapnya-button');
    const toggleCards = document.querySelectorAll('.product-toggle');
    if (!btn || !toggleCards.length) return;
    let expanded = false;
    btn.addEventListener('click', () => {
      expanded = !expanded;
      toggleCards.forEach(card => { card.style.display = expanded ? 'flex' : 'none'; });
      btn.setAttribute('aria-expanded', String(expanded));
      const label = btn.querySelector('u');
      if (label) label.textContent = expanded ? 'Sembunyikan <' : 'Lihat Selengkapnya >';
    });
  })();

  /* === Modal YouTube === */
  (function () {
    const overlay = document.getElementById('ytModalOverlay');
    const container = document.getElementById('ytModalContainer');
    const iframe = document.getElementById('ytIframe');
    if (!overlay || !container || !iframe) return;
    let returnFocus = null;

    window.openYTModal = function (videoId) {
      returnFocus = document.activeElement;
      iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      document.getElementById('ytCloseMobile')?.focus({ preventScroll: true });
    };

    window.closeYTModal = function () {
      overlay.classList.remove('active');
      setTimeout(() => {
        iframe.src = '';
        document.body.style.overflow = '';
      }, 300);
      returnFocus?.focus?.({ preventScroll: true });
    };

    overlay.addEventListener('click', e => { if (!container.contains(e.target)) closeYTModal(); });
    document.getElementById('ytCloseMobile')?.addEventListener('click', closeYTModal);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeYTModal();
    });
  })();

  /* === Solution cards: per-card staggered reveal === */
  (function () {
    const grid = document.querySelector('.solution-grid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.solution-card');
    new IntersectionObserver((entries, obs) => {
      if (!entries.some(e => e.isIntersecting)) return;
      cards.forEach((card, i) => setTimeout(() => card.classList.add('card-in'), i * 140));
      obs.disconnect();
    }, { threshold: 0.2 }).observe(grid);
  })();

  /* === NusaQuiz feature rows: staggered entrance === */
  (function () {
    const list = document.querySelector('.quiz-feature-list');
    if (!list) return;
    const rows = list.querySelectorAll('.quiz-feature-row');
    new IntersectionObserver((entries, obs) => {
      if (!entries.some(e => e.isIntersecting)) return;
      rows.forEach((row, i) => setTimeout(() => row.classList.add('row-in'), i * 180));
      obs.disconnect();
    }, { threshold: 0.2 }).observe(list);
  })();

  /* ============================================== */
  /* ====== CINEMATIC ENGINE ===================== */
  /* ============================================== */

  /* === Scroll-driven cinematic hero === */
  const cinematicHero = document.querySelector('.cinematic-hero');
  const cinematicHeroStage = document.querySelector('.cinematic-hero-stage');
  const cinematicHeroContent = document.querySelector('.cinematic-hero-content');
  const cinematicHeroTitle = document.querySelector('.cinematic-hero-title');
  const cinematicHeroSub = document.querySelector('.cinematic-hero-sub');
  const depthLayers = document.querySelectorAll('.cinematic-hero .depth-layer');

  function updateCinematicHero() {
    if (!cinematicHero || !cinematicHeroStage || disableScrollFX) return;
    const rect = cinematicHero.getBoundingClientRect();
    // Ukur stage, bukan innerHeight yang berubah saat toolbar iOS muncul
    const sectionH = cinematicHero.offsetHeight - cinematicHeroStage.offsetHeight;
    if (sectionH <= 0) return;
    const progress = Math.max(0, Math.min(1, -rect.top / sectionH));

    const scale = 1 + progress * 0.5;
    const zPush = progress * -200;
    const titleY = progress * -120;
    const titleOpacity = 1 - progress * 0.8;
    const subOpacity = 1 - progress * 1.2;

    if (cinematicHeroContent) {
      cinematicHeroContent.style.setProperty('--hero-scale', scale.toFixed(3));
      cinematicHeroContent.style.setProperty('--hero-z', zPush.toFixed(1) + 'px');
    }
    if (cinematicHeroTitle) {
      cinematicHeroTitle.style.setProperty('--title-y', titleY.toFixed(1) + 'px');
      cinematicHeroTitle.style.setProperty('--title-opacity', Math.max(0, titleOpacity).toFixed(3));
    }
    if (cinematicHeroSub) {
      cinematicHeroSub.style.setProperty('--sub-y', (titleY * 0.6).toFixed(1) + 'px');
      cinematicHeroSub.style.setProperty('--sub-opacity', Math.max(0, subOpacity).toFixed(3));
    }
    depthLayers.forEach(layer => {
      const depth = parseFloat(layer.dataset.depth || 0.5);
      layer.style.setProperty('--depth-y', '-' + (progress * 300 * depth).toFixed(1) + 'px');
    });
  }

  /* === Scroll-scrubbed product reveal === */
  const productReveal = document.querySelector('.product-reveal');
  const productRevealStage = document.querySelector('.product-reveal-stage');
  const deviceFrames = document.querySelectorAll('.device-frame');
  const captionGroups = document.querySelectorAll('[data-caption]');
  const progressDots = document.querySelectorAll('.reveal-progress-dot');
  let currentFrame = -1;

  // Tanpa efek scroll: tampilkan frame pertama secara statis agar section tidak kosong
  if (disableScrollFX) {
    deviceFrames[0]?.classList.add('active');
    progressDots[0]?.classList.add('active');
  }

  function updateProductReveal() {
    if (!productReveal || !productRevealStage || disableScrollFX) return;
    const rect = productReveal.getBoundingClientRect();
    const sectionH = productReveal.offsetHeight - productRevealStage.offsetHeight;
    if (sectionH <= 0) return;
    const progress = Math.max(0, Math.min(1, -rect.top / sectionH));

    const totalFrames = 4;
    const segmentLength = 1 / totalFrames;
    const frameIndex = Math.min(totalFrames - 1, Math.floor(progress * totalFrames));
    const localProgress = (progress - frameIndex * segmentLength) / segmentLength;

    if (frameIndex !== currentFrame) {
      currentFrame = frameIndex;
      deviceFrames.forEach((f, i) => f.classList.toggle('active', i === frameIndex));
      captionGroups.forEach(c => {
        c.style.display = parseInt(c.dataset.caption, 10) === frameIndex ? '' : 'none';
      });
      progressDots.forEach((d, i) => d.classList.toggle('active', i === frameIndex));
    }

    const activeFrame = deviceFrames[frameIndex];
    if (activeFrame) {
      activeFrame.style.setProperty('--frame-scale', (0.94 + localProgress * 0.06).toFixed(3));
      activeFrame.style.setProperty('--frame-ry', ((localProgress - 0.5) * 4).toFixed(1) + 'deg');
      activeFrame.style.setProperty('--frame-rx', ((1 - localProgress) * 2).toFixed(1) + 'deg');
    }

    const captionOpacity = Math.min(1, localProgress * 3);
    const captionY = Math.max(0, (1 - captionOpacity) * 20);
    document.querySelectorAll(`[data-caption="${frameIndex}"]`).forEach(c => {
      c.style.setProperty('--caption-opacity', captionOpacity.toFixed(3));
      c.style.setProperty('--caption-y', captionY.toFixed(1) + 'px');
    });
  }

  /* === Cinematic particle field (canvas) === */
  const canvas = document.getElementById('particle-canvas');
  if (canvas && !disableScrollFX) {
    const ctx = canvas.getContext('2d');
    const PARTICLE_COUNT = 60;
    let particles = [];
    let lastWidth = 0;

    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
      const rect = canvas.parentElement.getBoundingClientRect();
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.5 + 0.2,
      }));
    }

    resizeCanvas();
    initParticles();
    lastWidth = window.innerWidth;

    // Debounce; resize yang hanya mengubah tinggi (toolbar browser HP muncul/hilang) tidak me-reset partikel
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
        if (window.innerWidth !== lastWidth) {
          lastWidth = window.innerWidth;
          initParticles();
        }
      }, 200);
    });

    let canvasRafId = null;
    let isCanvasVisible = false;

    function animateParticles() {
      const rect = canvas.parentElement.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = rect.width;
        if (p.x > rect.width) p.x = 0;
        if (p.y < 0) p.y = rect.height;
        if (p.y > rect.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 15, 46, ${p.opacity})`;
        ctx.fill();
      });
      canvasRafId = isCanvasVisible ? requestAnimationFrame(animateParticles) : null;
    }

    new IntersectionObserver(entries => {
      isCanvasVisible = entries[0].isIntersecting;
      if (isCanvasVisible && !canvasRafId) {
        canvasRafId = requestAnimationFrame(animateParticles);
      } else if (!isCanvasVisible && canvasRafId) {
        cancelAnimationFrame(canvasRafId);
        canvasRafId = null;
      }
    }).observe(canvas);
  }

  /* === Master RAF loop: jalankan update sinematik selama scroll === */
  if (!disableScrollFX && (cinematicHero || productReveal)) {
    let masterRafId = null;
    let isScrolling = false;
    let scrollEndTimer = null;

    const masterUpdate = () => {
      updateCinematicHero();
      updateProductReveal();
      masterRafId = isScrolling ? requestAnimationFrame(masterUpdate) : null;
    };

    window.addEventListener('scroll', () => {
      isScrolling = true;
      if (!masterRafId) masterRafId = requestAnimationFrame(masterUpdate);
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => { isScrolling = false; }, 100);
    }, { passive: true });

    masterUpdate();
  }

  /* === Mega-menu (Produk dropdown) + hamburger === */
  (function () {
    const dropdown = document.getElementById('produkDropdown');
    const trigger = document.getElementById('produkTrigger');
    const menu = document.getElementById('produkMenu');
    const backdrop = document.getElementById('mmBackdrop');
    const navToggle = document.getElementById('navToggle');
    if (!dropdown || !trigger || !menu || !backdrop) return;

    let closeTimer = null;

    function openMenu() {
      clearTimeout(closeTimer);
      navToggle?.setAttribute('aria-expanded', 'true');
      navToggle?.setAttribute('aria-label', 'Tutup menu');
      dropdown.classList.add('open');
      menu.classList.add('open');
      backdrop.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
      navToggle?.setAttribute('aria-expanded', 'false');
      navToggle?.setAttribute('aria-label', 'Buka menu');
      dropdown.classList.remove('open');
      menu.classList.remove('open');
      backdrop.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function scheduleClose() {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(closeMenu, 200);
    }

    // Hover hanya untuk mouse. Di layar sentuh, tap memicu mouseenter lalu click
    // sehingga menu terbuka lalu langsung tertutup lagi.
    const onMouse = fn => e => { if (e.pointerType === 'mouse') fn(); };
    dropdown.addEventListener('pointerenter', onMouse(openMenu));
    dropdown.addEventListener('pointerleave', onMouse(scheduleClose));
    menu.addEventListener('pointerenter', onMouse(() => clearTimeout(closeTimer)));
    menu.addEventListener('pointerleave', onMouse(scheduleClose));

    navToggle?.addEventListener('click', () => {
      if (menu.classList.contains('open')) closeMenu();
      else openMenu();
    });

    trigger.addEventListener('click', e => {
      e.preventDefault();
      // Mouse: menu sudah dibuka oleh hover, jadi klik jangan menutupnya lagi
      if (e.pointerType === 'mouse') openMenu();
      else if (menu.classList.contains('open')) closeMenu();
      else openMenu();
    });

    backdrop.addEventListener('click', closeMenu);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
    });

    // Link di dalam menu: tutup menu, lalu scroll (anchor di halaman ini) atau pindah halaman
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href') || '';
        if (!href.startsWith('#') || href.length <= 1) {
          closeMenu();
          return;
        }
        e.preventDefault();
        closeMenu();
        setTimeout(() => {
          document.querySelector(href)?.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
        }, 200);
      });
    });
  })();
})();

/* ================================================================
   Galeri gambar per subjek — fungsi global karena dipanggil dari
   atribut onclick di markup (openSubjectGallery, closeGalleryModal,
   navigateGallery).
   Menambah gambar galeri = taruh file .webp di assets/<Subjek>/ DAN
   tambahkan namanya ke fileDatabase.
   ================================================================ */
const fileDatabase = {
  NusaBiology: ['bungamekar.webp', 'ecoli.webp', 'fotosintesis.webp', 'jenistanaman.webp', 'rafflesia.webp'],
  NusaFisika: ['Bandul.webp', 'Bangku Optik.webp', 'Bidang Miring.webp', 'Katrol.webp', 'Lampu Bohlam.webp', 'Magnet 3.webp', 'Optik 2.webp', 'Timbangan.webp'],
  NusaChem: ['etanol.webp', 'natrium.webp', 'protein.webp'],
  NusaMath: ['fungsi.webp', 'sudut.webp', 'keliling2.webp', 'volume.webp', 'luas.webp', 'phytagoras.webp', 'poligon.webp', 'tools.webp'],
  NusaPeriodic: ['home.webp', 'deskripsi.webp', 'carbon.webp', 'cesium.webp', 'john.webp', 'produk1.webp', 'produk2.webp', 'tahun.webp'],
  // Sampul sementara — ganti dengan nama file screenshot .webp di assets/NusaCoding/ dan assets/NusaEnglish/
  NusaAnatomy: [
    'assets/NusaSuites- Screenshot/NusaAnatomy/Main Menu.webp',
    'assets/NusaSuites- Screenshot/NusaAnatomy/Jantung.webp',
    'assets/NusaSuites- Screenshot/NusaAnatomy/Kulit.webp',
    'assets/NusaSuites- Screenshot/NusaAnatomy/Kulit Rotate.webp',
  ],
  NusaCoding: ['cover.webp'],
  NusaEnglish: ['cover.webp'],
};

const imageList = [];
let currentIndex = 0;
let isModalOpen = false;
let galleryReturnFocus = null;

const galleryModal = document.getElementById('galleryModal');
const galleryFrame = document.getElementById('galleryFrame');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const thumbnailGrid = document.getElementById('thumbnailGrid');

function openSubjectGallery(subjectKey) {
  const files = fileDatabase[subjectKey];
  if (!galleryModal || !files || files.length === 0) return;

  imageList.length = 0;
  // Entri berisi '/' dianggap path lengkap (mis. screenshot di assets/NusaSuites- Screenshot/...)
  files.forEach(fileName => imageList.push(fileName.includes('/') ? fileName : `assets/${subjectKey}/${fileName}`));

  generateGalleryUI(subjectKey);
  galleryReturnFocus = document.activeElement;
  galleryModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  isModalOpen = true;
  viewImg(0);
  galleryModal.querySelector('.close-btn')?.focus({ preventScroll: true });
}

function generateGalleryUI(subjectKey) {
  thumbnailGrid.innerHTML = '';
  imageList.forEach((url, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'thumb-btn';
    btn.setAttribute('aria-label', `${subjectKey} — gambar ${index + 1}`);
    btn.addEventListener('click', () => viewImg(index));
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = url;
    img.alt = '';
    btn.appendChild(img);
    thumbnailGrid.appendChild(btn);
  });
}

function closeGalleryModal() {
  if (!galleryModal) return;
  galleryModal.style.display = 'none';
  galleryFrame.src = '';
  isModalOpen = false;
  document.body.style.overflow = '';
  galleryReturnFocus?.focus?.({ preventScroll: true });
}

function viewImg(index) {
  currentIndex = index;
  galleryFrame.src = imageList[currentIndex];

  const buttons = thumbnailGrid.getElementsByClassName('thumb-btn');
  for (let i = 0; i < buttons.length; i++) {
    const active = i === currentIndex;
    buttons[i].classList.toggle('active', active);
    buttons[i].setAttribute('aria-current', String(active));
    if (active) buttons[i].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  prevBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
  nextBtn.style.display = currentIndex === imageList.length - 1 ? 'none' : 'flex';
}

function navigateGallery(direction) {
  const targetIndex = currentIndex + direction;
  if (targetIndex >= 0 && targetIndex < imageList.length) viewImg(targetIndex);
}

document.addEventListener('keydown', event => {
  if (!isModalOpen) return;
  if (event.key === 'ArrowRight') navigateGallery(1);
  else if (event.key === 'ArrowLeft') navigateGallery(-1);
  else if (event.key === 'Escape') closeGalleryModal();
});
