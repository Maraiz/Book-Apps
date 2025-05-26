import '../styles/main.css';
import App from './pages/app';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Berhasil mendaftarkan service worker.');

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.init();

  const mainContent = document.querySelector('#main-content');
  const skipLink = document.querySelector('.skip-link');

if (skipLink && mainContent) {
  skipLink.addEventListener('click', function (event) {
    event.preventDefault();
    skipLink.blur();
    
    // Check jika sedang di dashboard
    const currentHash = window.location.hash;
    if (currentHash === '#/dashboard' || currentHash === '#/') {
      // Panggil handler khusus untuk dashboard
      if (window.handleSkipToContent) {
        window.handleSkipToContent();
      } else {
        // Fallback ke scroll biasa
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Untuk halaman lain, gunakan behavior default
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  });

    let ticking = false;

    function updateSkipLink() {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > 100) {
        skipLink.classList.add('show-on-scroll');
      } else {
        skipLink.classList.remove('show-on-scroll');
      }

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateSkipLink);
        ticking = true;
      }
    });

    skipLink.classList.remove('show-on-scroll');
  }

  // Handle hash change untuk SPA routing
  window.addEventListener('hashchange', async () => {
    await app._checkAuthAndRoute();

    window.scrollTo(0, 0);

    if (skipLink) {
      skipLink.classList.remove('show-on-scroll');
    }
  });
});
