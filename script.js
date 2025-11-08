document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  // Ensure initial ARIA state
  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle('open');
    // Only toggle class; visual styling is kept in CSS
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    // Lock scrolling when overlay is open
    document.body.classList.toggle('menu-open', isOpen);
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!navLinks.classList.contains('open')) return;
    if (!navLinks.contains(e.target) && !toggle.contains(e.target)) {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
  });

  // Ensure menu resets when resizing to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }
  });

  // --- Seznam psů (jméno + odkaz na fotografii) ---
  // Vytvoří pole šesti psů. Můžete upravit cesty k fotkám podle vašeho projektu.
  const dogs = [
    { name: 'Antonín Prosecká tlapka', title: '1. místo psi — 2024', photo: 'tonda.jpg', description: '' },
    { name: 'Bruce Black z Hrabětova panství', title: '2. místo psi — 2024', photo: 'bruce.jpg', description: '' },
    { name: 'Quedius Bonasa Sorbus', title: '3. místo psi — 2024', photo: 'quedius.jpg', description: '' },
    { name: 'Granulka z Akátového hájku', title: '1. místo feny — 2024', photo: 'granulka.jpg', description: '' },
    { name: 'Elegie Nella Belavia', title: '2. místo feny — 2024', photo: 'elegie.jpg', description: '' },
    { name: 'Briza ze Strakaté louky', title: '3. místo feny — 2024', photo: 'briza.webp', description: '' },
    { name: 'Bramína Nella Belavia', title: '1.místo veterán — 2024', photo: 'bramina.jpg', description: '' },
  ];

  // Exponuj seznam do globálního scope, aby bylo možné s ním pracovat z konzole nebo jiných skriptů
  window.dogs = dogs;

  // Funkce pro vykreslení seznamu do DOM, pokud existuje kontejner s daným selektorem
  function renderDogList(selector = '#dog-list') {
    const container = document.querySelector(selector);
    if (!container) return; // pokud kontejner není na stránce, nic neděláme

    // Vyčistit kontejner a vytvořit seznam
    container.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'dog-list';

    dogs.forEach(d => {
      const li = document.createElement('li');
      li.className = 'dog-item';

      const a = document.createElement('a');
      a.href = d.photo;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      const img = document.createElement('img');
  img.src = d.photo;
  // Prefer native lazy-loading for dynamically created images
  img.loading = 'lazy';
      img.alt = d.name;
      img.className = 'dog-thumb';
      img.width = 160;

      const span = document.createElement('span');
      span.className = 'dog-name';
      span.textContent = d.name;

      a.appendChild(img);
      a.appendChild(document.createElement('br'));
      a.appendChild(span);
      li.appendChild(a);
      ul.appendChild(li);
    });

    container.appendChild(ul);
  }

  // Pokud na stránce existuje element s id "dog-list", automaticky seznam vykreslíme
  renderDogList('#dog-list');

  // --- Winners carousel (uses the same dogs array) ---
  function initWinnersCarousel(containerSelector = '#winner-carousel') {
    const wrapper = document.querySelector(containerSelector);
    if (!wrapper) return;

    const track = wrapper.querySelector('.carousel-track');
    const btnPrev = wrapper.querySelector('.carousel-btn.prev');
    const btnNext = wrapper.querySelector('.carousel-btn.next');
    if (!track) return;

    // Populate slides from dogs
    // We'll track the smallest natural image width/height so we can limit the .img-wrap
    let loadedCount = 0;
    let minNaturalWidth = Infinity;
    let minNaturalHeight = Infinity;

    function tryApplyMinSizes() {
      if (loadedCount < dogs.length) return;
      // Apply CSS variables so .img-wrap uses the smallest image width as max
      // Use px values — CSS min() will still respect viewport percentages.
      if (isFinite(minNaturalWidth)) {
        document.documentElement.style.setProperty('--carousel-max-width', `${Math.round(minNaturalWidth)}px`);
      }
      if (isFinite(minNaturalHeight)) {
        document.documentElement.style.setProperty('--carousel-max-height', `${Math.round(minNaturalHeight)}px`);
      }
    }

    dogs.forEach(d => {
      const li = document.createElement('li');
      li.className = 'carousel-slide';

  const img = document.createElement('img');
  img.src = d.photo;
  // Use native lazy-loading where supported
  img.loading = 'lazy';
  img.alt = d.name;

      // wrap image in a container so we can apply different aspect ratios
      const imgWrap = document.createElement('div');
      imgWrap.className = 'img-wrap landscape'; // default to landscape until image loads
      // make the image a link to the winners page
      const link = document.createElement('a');
      link.href = 'vitezove.html';
      link.setAttribute('aria-label', `Otevřít vítěze: ${d.name}`);
      link.appendChild(img);
      imgWrap.appendChild(link);

      const caption = document.createElement('div');
      caption.className = 'carousel-caption';
      caption.textContent = d.name;

      // Once the image loads, detect orientation and adjust wrapper class
      img.addEventListener('load', () => {
        try {
          if (img.naturalHeight > img.naturalWidth) {
            imgWrap.classList.remove('landscape');
            imgWrap.classList.add('portrait');
          } else if (img.naturalWidth === img.naturalHeight) {
            imgWrap.classList.remove('landscape');
            imgWrap.classList.add('square');
          } else {
            imgWrap.classList.remove('portrait', 'square');
            imgWrap.classList.add('landscape');
          }
        // update smallest natural dimensions
        if (isFinite(img.naturalWidth) && img.naturalWidth > 0) {
          minNaturalWidth = Math.min(minNaturalWidth, img.naturalWidth);
        }
        if (isFinite(img.naturalHeight) && img.naturalHeight > 0) {
          minNaturalHeight = Math.min(minNaturalHeight, img.naturalHeight);
        }
        loadedCount += 1;
        tryApplyMinSizes();
        } catch (err) {
          // ignore and keep default
        }
      });

      // In case image is cached and already complete, run orientation logic immediately
      if (img.complete) {
        if (img.naturalHeight > img.naturalWidth) {
          imgWrap.classList.remove('landscape');
          imgWrap.classList.add('portrait');
        } else if (img.naturalWidth === img.naturalHeight) {
          imgWrap.classList.remove('landscape');
          imgWrap.classList.add('square');
        }
        // include its natural sizes in the min calculation
        if (isFinite(img.naturalWidth) && img.naturalWidth > 0) {
          minNaturalWidth = Math.min(minNaturalWidth, img.naturalWidth);
        }
        if (isFinite(img.naturalHeight) && img.naturalHeight > 0) {
          minNaturalHeight = Math.min(minNaturalHeight, img.naturalHeight);
        }
        loadedCount += 1;
        tryApplyMinSizes();
      }

      li.appendChild(imgWrap);
      li.appendChild(caption);
      track.appendChild(li);
    });

    const slides = Array.from(track.children);
    let current = 0;
    let slidesPerView = 1;

    function calculateLayout() {
      if (!slides.length) return;
      const container = wrapper.querySelector('.carousel-track-container');
      const containerWidth = container.getBoundingClientRect().width;
      const slideWidth = slides[0].getBoundingClientRect().width;
      // How many full slides fit into the container (usually 2 on desktop)
      slidesPerView = Math.max(1, Math.floor(containerWidth / slideWidth));
      // Ensure current index is aligned to slidesPerView step to avoid half-page views
      current = current - (current % slidesPerView);
      update();
    }

    function update() {
      if (!slides.length) return;
      const slideWidth = slides[0].getBoundingClientRect().width;
      track.style.transform = `translateX(-${current * slideWidth}px)`;
    }

    // Next / Prev handlers that advance by slidesPerView
    function next() {
      current = (current + slidesPerView) % slides.length;
      update();
    }
    function prev() {
      current = (current - slidesPerView + slides.length) % slides.length;
      update();
    }

    btnNext && btnNext.addEventListener('click', next);
    btnPrev && btnPrev.addEventListener('click', prev);

    // keyboard navigation
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    // Recalculate on resize (recompute slidesPerView and update position)
    window.addEventListener('resize', () => {
      calculateLayout();
    });

    // Optional: simple autoplay
    let autoplay = true;
    let autoplayInterval = 4500;
    let timerId = null;
    function startAuto() {
      if (!autoplay) return;
      stopAuto();
      timerId = setInterval(next, autoplayInterval);
    }
    function stopAuto() { if (timerId) { clearInterval(timerId); timerId = null; } }

    wrapper.addEventListener('mouseenter', stopAuto);
    wrapper.addEventListener('mouseleave', startAuto);

    // initialize position and start autoplay
    update();
    startAuto();
  }

  // Initialize carousel if winners container exists
  initWinnersCarousel('#winner-carousel');

  // --- Winners thumbnails gallery for the vitezove page ---
  function initWinnersGallery(containerSelector = '#winners-thumbs') {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    // Create gallery list
    const ul = document.createElement('ul');
    ul.className = 'winners-gallery';

    // Create a lightbox overlay (hidden) for showing full-size image + description
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-overlay';
    lightbox.innerHTML = `
      <div class="lightbox-content" role="dialog" aria-modal="true" tabindex="-1">
        <button class="lightbox-close" aria-label="Zavřít">×</button>
        <div class="lightbox-media">
          <img class="lightbox-img" src="" alt="" />
        </div>
        <div class="lightbox-caption">
          <h3 class="lightbox-name"></h3>
          <div class="lightbox-title"></div>
          <p class="lightbox-desc"></p>
        </div>
      </div>
    `;
    document.body.appendChild(lightbox);

    const lbImg = lightbox.querySelector('.lightbox-img');
    const lbName = lightbox.querySelector('.lightbox-name');
    const lbTitle = lightbox.querySelector('.lightbox-title');
    const lbDesc = lightbox.querySelector('.lightbox-desc');
    const lbClose = lightbox.querySelector('.lightbox-close');

    function openLightbox(d) {
      lbImg.src = d.photo;
      lbImg.alt = d.name;
      lbImg.loading = 'eager';
      lbName.textContent = d.name || '';
      lbTitle.textContent = d.title || '';
      lbDesc.textContent = d.description || '';
      lightbox.classList.add('open');
      // focus for accessibility
      lbClose.focus();
      document.body.classList.add('no-scroll');
    }
    function closeLightbox() {
      lightbox.classList.remove('open');
      lbImg.src = '';
      document.body.classList.remove('no-scroll');
    }

    // close handlers
    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });

    dogs.forEach((d, idx) => {
      const li = document.createElement('li');
      li.className = 'winner-thumb';
      li.setAttribute('tabindex', '0');
      li.setAttribute('role', 'button');

      const img = document.createElement('img');
      img.src = d.photo;
      // Lazy-load thumbnail images as well
      img.loading = 'lazy';
      img.alt = d.name;
      img.className = 'thumb-img';

      const name = document.createElement('div');
      name.className = 'thumb-name';
      name.textContent = d.name;

      const title = document.createElement('div');
      title.className = 'thumb-title';
      title.textContent = d.title || '';

      // Open lightbox on click or keyboard activation
      function activate(e) {
        openLightbox(d);
      }

      li.addEventListener('click', activate);
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });

      li.appendChild(img);
      li.appendChild(name);
      li.appendChild(title);
      ul.appendChild(li);
    });

    container.appendChild(ul);
  }

  // Initialize gallery if winners page has the container
  initWinnersGallery('#winners-thumbs');
});