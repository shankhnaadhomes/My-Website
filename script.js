/* ==========================================================================
   SHANKHNAAD — script.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Preloader ---------------- */
  window.addEventListener('load', () => {
    const pre = document.getElementById('preloader');
    setTimeout(() => { pre.classList.add('hidden'); }, 1200);
  });

  /* ---------------- Lucide Icons ---------------- */
  if (window.lucide) lucide.createIcons();

  /* ---------------- Lenis Smooth Scroll ---------------- */
  let lenis;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.gsap && window.gsap.ticker) {
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------------- GSAP ScrollTrigger ---------------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    const heroTl = gsap.timeline({ delay: 1.3 });
    heroTl
      .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0)
      .to('.hero-title .line', { opacity: 1, y: 0, duration: 1.2, stagger: 0.12, ease: 'power4.out' }, 0.15)
      .to('.hero-sub', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.7)
      .to('.hero-ctas', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.85)
      .to('.scroll-indicator', { opacity: 1, duration: 1 }, 1);

    // Hero parallax bg
    gsap.to('.hero-bg', {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero-shankh-glow', {
      rotate: 25, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    // Nav background on scroll
    ScrollTrigger.create({
      start: 60, end: 99999,
      onUpdate: (self) => {
        document.getElementById('site-nav').classList.toggle('scrolled', self.scroll() > 60);
      }
    });

    // Counter animation for stats
    document.querySelectorAll('[data-counter]').forEach((el) => {
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const decimals = el.dataset.counter.includes('.') ? 1 : 0;
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target, duration: 2, ease: 'power2.out',
            onUpdate: () => { el.textContent = obj.val.toFixed(decimals) + suffix; }
          });
        }
      });
    });
  }

  /* ---------------- Scroll reveal (data-reveal) ---------------- */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-fade');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => io.observe(el));

  /* ---------------- Mobile nav ---------------- */
  const burger = document.getElementById('nav-burger');
  const navLinks = document.getElementById('nav-links');
  if (burger) {
    burger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      burger.querySelector('[data-open]')?.classList.toggle('hidden');
      burger.querySelector('[data-close]')?.classList.toggle('hidden');
    });
    navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => navLinks.classList.remove('open')));
  }

  /* ---------------- Hero title split into lines for animation ---------------- */
  document.querySelectorAll('.hero-title .line').forEach((l) => {
    gsap && gsap.set(l, { opacity: 0, y: 40 });
  });

  /* ==========================================================================
     MASTER PLAN HOTSPOTS
     ========================================================================== */
  document.querySelectorAll('.hotspot').forEach((h) => {
    h.addEventListener('click', () => {
      const target = h.dataset.target;
      if (target) {
        const el = document.querySelector(target);
        if (el) {
          if (lenis) lenis.scrollTo(el, { offset: -80 });
          else el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  /* ==========================================================================
     GALLERY — FILTER + LIGHTBOX
     ========================================================================== */
  const filters = document.querySelectorAll('.gfilter');
  const items = document.querySelectorAll('.masonry-item');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      items.forEach((item) => {
        const show = cat === 'all' || item.dataset.cat === cat;
        item.style.display = show ? '' : 'none';
      });
    });
  });

  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const galleryImages = Array.from(items).map((i) => ({
    src: i.querySelector('img').getAttribute('src'),
    label: i.querySelector('.m-label')?.textContent || ''
  }));
  let lbIndex = 0;

  function openLightbox(index) {
    lbIndex = index;
    updateLightbox();
    lightbox.classList.add('open');
  }
  function updateLightbox() {
    lbImg.src = galleryImages[lbIndex].src;
    lbImg.alt = galleryImages[lbIndex].label;
  }
  items.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });
  document.querySelector('.lb-close')?.addEventListener('click', () => lightbox.classList.remove('open'));
  document.querySelector('.lb-next')?.addEventListener('click', () => { lbIndex = (lbIndex + 1) % galleryImages.length; updateLightbox(); });
  document.querySelector('.lb-prev')?.addEventListener('click', () => { lbIndex = (lbIndex - 1 + galleryImages.length) % galleryImages.length; updateLightbox(); });
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') lightbox.classList.remove('open');
    if (e.key === 'ArrowRight') document.querySelector('.lb-next').click();
    if (e.key === 'ArrowLeft') document.querySelector('.lb-prev').click();
  });

  /* ==========================================================================
     SWIPER — TESTIMONIALS
     ========================================================================== */
  if (window.Swiper) {
    new Swiper('.testi-swiper', {
      loop: true,
      autoplay: { delay: 5500, disableOnInteraction: false },
      speed: 800,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.testi-next', prevEl: '.testi-prev' },
    });
  }

  /* ==========================================================================
     FAQ ACCORDION
     ========================================================================== */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((other) => {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ==========================================================================
     INVESTMENT CALCULATOR
     ========================================================================== */
  const plotSize = document.getElementById('calc-plot-size');
  const plotRate = document.getElementById('calc-rate');
  const bookingPct = document.getElementById('calc-booking');
  const tenure = document.getElementById('calc-tenure');

  const plotSizeVal = document.getElementById('calc-plot-size-val');
  const rateVal = document.getElementById('calc-rate-val');
  const bookingVal = document.getElementById('calc-booking-val');
  const tenureVal = document.getElementById('calc-tenure-val');

  const outTotal = document.getElementById('out-total');
  const outBooking = document.getElementById('out-booking');
  const outBalance = document.getElementById('out-balance');
  const outEmi = document.getElementById('out-emi');

  function formatINR(num) {
    return '₹' + Math.round(num).toLocaleString('en-IN');
  }

  function calcInvestment() {
    const size = parseFloat(plotSize.value);      // sq yd
    const rate = parseFloat(plotRate.value);       // per sq yd
    const bkPct = parseFloat(bookingPct.value);     // %
    const months = parseFloat(tenure.value);        // months

    const total = size * rate;
    const booking = total * (bkPct / 100);
    const balance = total - booking;
    const emi = balance / months;

    plotSizeVal.textContent = size + ' sq.yd';
    rateVal.textContent = '₹' + rate.toLocaleString('en-IN') + '/sq.yd';
    bookingVal.textContent = bkPct + '%';
    tenureVal.textContent = months + ' mo';

    outTotal.textContent = formatINR(total);
    outBooking.textContent = formatINR(booking);
    outBalance.textContent = formatINR(balance);
    outEmi.textContent = formatINR(emi);
  }
  [plotSize, plotRate, bookingPct, tenure].forEach((el) => {
    el && el.addEventListener('input', calcInvestment);
  });
  if (plotSize) calcInvestment();

  /* ==========================================================================
     LEAD FORM VALIDATION
     ========================================================================== */
  const leadForm = document.getElementById('lead-form');
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const name = leadForm.querySelector('#f-name');
      const phone = leadForm.querySelector('#f-phone');
      const email = leadForm.querySelector('#f-email');
      const city = leadForm.querySelector('#f-city');
      const budget = leadForm.querySelector('#f-budget');

      function setState(field, ok) {
        field.closest('.field').classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      }

      setState(name, name.value.trim().length >= 2);
      setState(phone, /^[6-9]\d{9}$/.test(phone.value.trim()));
      setState(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
      setState(city, city.value.trim().length >= 2);
      setState(budget, budget.value !== '');

      const status = document.getElementById('form-status');
      if (!valid) {
        status.textContent = 'Please correct the highlighted fields.';
        status.style.color = '#e08a6b';
        return;
      }
      status.textContent = 'Thank you. Our concierge team will contact you within 24 hours.';
      status.style.color = '#C8A354';
      leadForm.reset();
    });

    leadForm.querySelectorAll('input, select, textarea').forEach((f) => {
      f.addEventListener('input', () => f.closest('.field').classList.remove('invalid'));
    });
  }

  /* ==========================================================================
     BACK TO TOP
     ========================================================================== */
  const backToTop = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 700);
  });
  backToTop.addEventListener('click', () => {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ==========================================================================
     SMOOTH ANCHOR LINKS
     ========================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          if (lenis) lenis.scrollTo(el, { offset: -70 });
          else el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  /* ---------------- Video modal (Watch Film) ---------------- */
  const filmBtn = document.getElementById('watch-film-btn');
  const filmModal = document.getElementById('film-modal');
  if (filmBtn && filmModal) {
    filmBtn.addEventListener('click', () => filmModal.classList.add('open'));
    filmModal.addEventListener('click', (e) => {
      if (e.target === filmModal || e.target.closest('.film-close')) {
        filmModal.classList.remove('open');
      }
    });
  }

});
