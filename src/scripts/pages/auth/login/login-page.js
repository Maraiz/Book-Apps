import LoginPresenter from './login-presenter.js';
import LoginModel from './login-model.js';

export default class LoginPage {
  constructor() {
    this.model = new LoginModel();
    this.presenter = new LoginPresenter({
      view: this,
      model: this.model,
    });
  }
  async render() {
    return `
      <section class="form-box" id="loginBox" aria-labelledby="login-heading">
        <h2 id="login-heading">Login</h2>
        <div id="loginError" class="error-message" style="display:none; color: red; margin-bottom: 10px;"></div>
        <form id="loginForm">
          <div class="form-group">
            <label for="login-email" class="sr-only">Email</label>
            <input type="email" id="login-email" name="email" placeholder="Email" required aria-required="true" />
          </div>
          <div class="form-group">
            <label for="login-password" class="sr-only">Password</label>
            <input type="password" id="login-password" name="password" placeholder="Password" required
              aria-required="true" />
          </div>
          <button type="submit">Login</button>
        </form>
        <div class="login-footer">
          <p>Belum punya akun? <a href="#/register">Register</a></p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Let the presenter check if user is already logged in
    await this.presenter.checkUserLoginStatus();

    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
      loginForm.addEventListener('submit', async event => {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        await this.presenter.handleLogin({ email, password });
      });
    }
  }

  showError(message) {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 5000);
    }
  }

  showLoading() {
    return Swal.fire({
      title: 'Memproses Login',
      text: 'Mohon tunggu...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  hideLoading() {
    Swal.close();
  }

  showAlert(config) {
    return Swal.fire(config);
  }

  navigateToDashboard() {
    window.location.href =
      window.location.origin +
      window.location.pathname +
      '#/dashboard?force_reload=' +
      new Date().getTime();
  }
}
