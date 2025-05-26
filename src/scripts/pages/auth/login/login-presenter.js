export default class LoginPresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
  }

  async checkUserLoginStatus() {
    if (this.model.isUserLoggedIn()) {
      this.view.navigateToDashboard();
    }
  }

  async handleLogin({ email, password }) {
    try {
      // Input validation
      if (!email || !password) {
        this.view.showAlert({
          icon: 'error',
          title: 'Validasi Error',
          text: 'Email dan password harus diisi',
        });
        return;
      }

      // Show loading indicator
      this.view.showLoading();

      // Pass credentials to model for authentication
      const result = await this.model.loginUser({ email, password });

      // Hide loading indicator
      this.view.hideLoading();

      if (!result.success) {
        this.view.showAlert({
          icon: 'error',
          title: 'Login Gagal',
          text: result.message,
        });
        return;
      }

      // Show success message
      this.view.showAlert({
        icon: 'success',
        title: 'Login Berhasil',
        text: 'Anda berhasil login!',
        timer: 1000,
        showConfirmButton: false,
      });

      // Navigate to dashboard
      this.view.navigateToDashboard();
    } catch (error) {
      this.view.hideLoading();
      console.error('Login error:', error);

      this.view.showAlert({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat login. Silakan coba lagi.',
      });
    }
  }
}
