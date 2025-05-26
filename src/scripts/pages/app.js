import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #navList = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#navList = document.getElementById('nav-list');

    this._setupDrawer();
    this._updateNavigation();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', event => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach(link => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  _updateNavigation() {
    const isLoggedIn = localStorage.getItem('token') !== null;

    if (this.#navList) {
      if (isLoggedIn) {
        this.#navList.innerHTML = `
       <li><a href="#/addstory" class="nav-link"><i class="fa fa-plus-circle" aria-hidden="true"></i> Tambah Cerita</a></li>
        <li><a href="#/" id="logoutBtn">Logout</a></li>
      `;

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', e => {
            e.preventDefault();

            Swal.fire({
              title: 'Konfirmasi Logout',
              text: 'Apakah Anda yakin ingin keluar?',
              icon: 'question',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Ya, Logout',
              cancelButtonText: 'Batal',
            }).then(result => {
              if (result.isConfirmed) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                localStorage.removeItem('userData');
                localStorage.removeItem('isLoggedIn');

                Swal.fire({
                  title: 'Berhasil Logout',
                  text: 'Anda telah keluar dari sistem',
                  icon: 'success',
                  timer: 1500,
                  showConfirmButton: false,
                }).then(() => {
                  window.location.hash = '#/';
                  window.location.reload();
                });
              }
            });
          });
        }
      } else {
        this.#navList.innerHTML = `
        <li><a href="#/login">Login</a></li>
        <li><a href="#/register">Register</a></li>
      `;
      }
    }
  }

  _checkAuthAndRoute() {
    const isLoggedIn = localStorage.getItem('token') !== null;
    const currentUrl = getActiveRoute();

    console.log(
      'Checking auth status, logged in:',
      isLoggedIn,
      'current URL:',
      currentUrl
    );

    if (
      isLoggedIn &&
      (currentUrl === '/login' ||
        currentUrl === '/register' ||
        currentUrl === '/')
    ) {
      console.log('Pengguna sudah login, diarahkan ke dashboard');
      window.location.hash = '#/dashboard';
      return;
    }

    if (
      !isLoggedIn &&
      (currentUrl === '/dashboard' || currentUrl === '/addstory')
    ) {
      console.log('Pengguna belum login, diarahkan ke login');
      window.location.hash = '#/login';
      return;
    }

    return this.renderPage();
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    if (!page) {
      window.location.hash = '#/';
      return;
    }

    console.log('App: Rendering halaman untuk URL:', url);

    try {
      this.#content.innerHTML = await page.render();

      console.log('App: Menjalankan afterRender untuk halaman', url);
      await page.afterRender();

      this._updateNavigation();
    } catch (error) {
      console.error('Error saat rendering halaman:', error);
    }
  }

  async init() {
    return this._checkAuthAndRoute();
  }
}

export default App;
