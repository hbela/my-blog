/**
 * doc-theme.js — Interactive behaviors for doc-theme.css
 *
 * Features:
 *   - Mobile sidebar toggle
 *   - Scroll-based active nav highlighting
 *   - Reading progress bar
 *   - Image lightbox
 *
 * Usage:
 *   <script src="doc-theme.js" defer></script>
 */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Mobile sidebar toggle ────────────────────
  const menuToggle = document.querySelector('.doc-menu-toggle');
  const sidebar    = document.querySelector('.doc-sidebar');
  const overlay    = document.querySelector('.doc-overlay');

  if (menuToggle && sidebar && overlay) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  // ─── Close sidebar on nav click (mobile) ──────
  const navLinks = document.querySelectorAll('.doc-sidebar-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 900 && sidebar) {
        sidebar.classList.remove('open');
        overlay?.classList.remove('open');
      }
    });
  });

  // ─── Active nav highlighting ──────────────────
  const sections = document.querySelectorAll('.doc-section');

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-20% 0px -60% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  // ─── Scroll progress bar ─────────────────────
  const progressBar = document.querySelector('.doc-progress-bar-inner');

  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const height   = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = height > 0
        ? (scrolled / height * 100) + '%'
        : '0%';
    });
  }

  // ─── Lightbox ─────────────────────────────────
  const lightbox    = document.querySelector('.doc-lightbox');
  const lightboxImg = lightbox?.querySelector('img');
  const screenshots = document.querySelectorAll('.doc-screenshot');

  screenshots.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (lightbox) {
    lightbox.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  function closeLightbox() {
    lightbox?.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ─── Make closeLightbox available globally ────
  window.docThemeCloseLightbox = closeLightbox;
});
