import RegisterPresenter from './register-presenter.js';
import RegisterModel from './register-model.js';

export default class RegisterPage {
  constructor() {
    this.model = new RegisterModel();
    this.presenter = new RegisterPresenter({
      view: this,
      model: this.model,
    });
  }

  async render() {
    return `
      <section class="form-box" id="registerBox" aria-labelledby="register-heading">
        <h2 id="register-heading">Register</h2>
        <div id="registerMessage" class="message" style="display:none;"></div>
        <form id="registerForm">
          <div class="form-group">
            <label for="register-name" class="sr-only">Nama</label>
            <input type="text" id="register-name" name="name" placeholder="Nama" required aria-required="true" />
          </div>
          <div class="form-group">
            <label for="register-email" class="sr-only">Email</label>
            <input type="email" id="register-email" name="email" placeholder="Email" required aria-required="true" />
          </div>
          <div class="form-group">
            <label for="register-password" class="sr-only">Password</label>
            <input type="password" id="register-password" name="password" placeholder="Password" required
              aria-required="true" minlength="8" />
          </div>
          <button type="submit">Daftar</button>
        </form>
        <div class="register-footer">
          <p>Sudah punya akun? <a href="#/login">Login</a></p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
      registerForm.addEventListener('submit', async event => {
        event.preventDefault();

        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        await this.presenter.handleRegister({ name, email, password });
      });
    }
  }

  showError(message) {
    const messageElement = document.getElementById('registerMessage');
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.style.display = 'block';
      messageElement.style.color = 'red';
      setTimeout(() => {
        messageElement.style.display = 'none';
      }, 5000);
    }
  }

  showSuccess(message) {
    const messageElement = document.getElementById('registerMessage');
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.style.display = 'block';
      messageElement.style.color = 'green';
      setTimeout(() => {
        messageElement.style.display = 'none';
      }, 5000);
    }
  }

  showLoading() {
    return Swal.fire({
      title: 'Memproses Registrasi',
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

  redirectToLogin() {
    window.location.hash = '#/login';
  }
}
