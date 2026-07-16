/* =========================================================
   ROOT & BLOOM — Script
   Navbar, scrollspy, vine progress, reveal, hero parallax,
   lightbox, testimonial slider, floating-label validation,
   accordion-free FAQ removed, back-to-top, page loader.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Page loader + transition ---------- */
  const pageLoader = document.getElementById('pageLoader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      pageLoader && pageLoader.classList.add('hidden');
      document.body.classList.add('page-ready');
    }, 250);
  });

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar scroll transition + vine progress + back-to-top ---------- */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  const vinePath = document.querySelector('.vine-path');
  const vinePathLength = vinePath ? vinePath.getTotalLength() : 0;

  if (vinePath) {
    vinePath.style.strokeDasharray = `${vinePathLength}`;
    vinePath.style.strokeDashoffset = `${vinePathLength}`;
  }

  function updateVineProgress() {
    if (!vinePath) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    vinePath.style.strokeDashoffset = `${vinePathLength - progress * vinePathLength}`;
  }

  /* ---------- Hero parallax (container-level, doesn't fight the CSS zoom) ---------- */
  const heroMedia = document.getElementById('heroMedia');
  const heroSection = document.querySelector('.hero');

  function updateHeroParallax() {
    if (!heroMedia || !heroSection || prefersReducedMotion) return;
    const rect = heroSection.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const offset = window.scrollY * 0.12;
    heroMedia.style.transform = `translateY(${offset}px)`;
  }

  const onScroll = () => {
    navbar && navbar.classList.toggle('scrolled', window.scrollY > 40);
    backToTop && backToTop.classList.toggle('visible', window.scrollY > 500);
    updateVineProgress();
    updateHeroParallax();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
  }

  /* ---------- Scrollspy: highlight active nav link ---------- */
  const navAnchorLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const spySections = navAnchorLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (navAnchorLinks.length && spySections.length && 'IntersectionObserver' in window) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const link = navAnchorLinks.find(a => a.getAttribute('href') === `#${entry.target.id}`);
        if (!link) return;
        if (entry.isIntersecting) {
          navAnchorLinks.forEach(a => a.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    spySections.forEach(section => spyObserver.observe(section));
  }

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);

          if (entry.target.classList.contains('stat')) {
            animateCount(entry.target.querySelector('[data-count]'));
          }
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
    document.querySelectorAll('[data-count]').forEach(animateCount);
  }

  /* ---------- Stat count-up ---------- */
  function animateCount(el) {
    if (!el || el.dataset.counted) return;
    el.dataset.counted = 'true';
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;

    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }

    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Lightbox gallery ---------- */
  const masonryItems = Array.from(document.querySelectorAll('.masonry-item'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let currentImageIndex = 0;
  let lastFocusedEl = null;

  function openLightbox(index) {
    currentImageIndex = index;
    const item = masonryItems[index];
    lightboxImg.src = item.getAttribute('data-full');
    lightboxImg.alt = item.querySelector('img').alt || '';
    lightboxCaption.textContent = item.getAttribute('data-caption') || '';
    lastFocusedEl = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function showImage(delta) {
    currentImageIndex = (currentImageIndex + delta + masonryItems.length) % masonryItems.length;
    const item = masonryItems[currentImageIndex];
    lightboxImg.src = item.getAttribute('data-full');
    lightboxImg.alt = item.querySelector('img').alt || '';
    lightboxCaption.textContent = item.getAttribute('data-caption') || '';
  }

  masonryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => showImage(-1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => showImage(1));

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showImage(-1);
      if (e.key === 'ArrowRight') showImage(1);
    });
  }

  /* ---------- Testimonial slider ---------- */
  const track = document.getElementById('testimonialTrack');
  const dotsWrap = document.getElementById('testimonialDots');

  if (track && dotsWrap) {
    const slides = Array.from(track.children);
    let activeIndex = 0;
    let autoplayTimer = null;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    const dots = Array.from(dotsWrap.children);

    function goTo(index) {
      activeIndex = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${activeIndex * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === activeIndex));
    }

    function startAutoplay() {
      if (prefersReducedMotion) return;
      stopAutoplay();
      autoplayTimer = setInterval(() => goTo(activeIndex + 1), 5500);
    }

    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }

    const sliderWrap = track.closest('.testimonial-slider');
    sliderWrap.addEventListener('mouseenter', stopAutoplay);
    sliderWrap.addEventListener('mouseleave', startAutoplay);
    sliderWrap.addEventListener('focusin', stopAutoplay);
    sliderWrap.addEventListener('focusout', startAutoplay);

    startAutoplay();
  }

  /* ---------- Reservation form (floating labels + validation) ---------- */
  const reservationForm = document.getElementById('reservationForm');
  const formNote = document.getElementById('formNote');

  if (reservationForm) {
    const dateInput = document.getElementById('resDate');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    const fields = Array.from(reservationForm.querySelectorAll('.form-group.floating'));

    function validateField(group) {
      const field = group.querySelector('input, select, textarea');
      if (!field.hasAttribute('required')) return true;
      const valid = field.checkValidity();
      group.classList.toggle('invalid', !valid);
      return valid;
    }

    fields.forEach(group => {
      const field = group.querySelector('input, select, textarea');
      if (!field) return;
      field.addEventListener('blur', () => validateField(group));
      field.addEventListener('input', () => {
        if (group.classList.contains('invalid')) validateField(group);
      });
    });

    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let allValid = true;
      fields.forEach(group => {
        if (!validateField(group)) allValid = false;
      });

      if (!allValid) {
        const firstInvalid = reservationForm.querySelector('.form-group.invalid input, .form-group.invalid select, .form-group.invalid textarea');
        if (firstInvalid) firstInvalid.focus();
        if (formNote) {
          formNote.style.color = '#B3261E';
          formNote.textContent = 'Please check the highlighted fields.';
        }
        return;
      }

      const name = document.getElementById('resName').value.trim();

      if (formNote) {
        formNote.style.color = '';
        formNote.textContent = `Thanks, ${name.split(' ')[0]}! Your table request has been received — we'll confirm by email shortly.`;
      }

      reservationForm.reset();
      fields.forEach(group => group.classList.remove('invalid'));

      setTimeout(() => { if (formNote) formNote.textContent = ''; }, 6000);
    });
  }

  /* ---------- Smooth scroll offset for fixed navbar ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;

      window.scrollTo({ top: targetPosition, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

});
