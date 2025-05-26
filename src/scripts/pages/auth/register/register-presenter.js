export default class RegisterPresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
  }

  async handleRegister({ name, email, password }) {
    try {
      if (!name || !email || !password) {
        this.view.showAlert({
          icon: 'error',
          title: 'Validasi Error',
          text: 'Semua field harus diisi',
        });
        return;
      }

      if (password.length < 8) {
        this.view.showAlert({
          icon: 'error',
          title: 'Validasi Error',
          text: 'Password harus minimal 8 karakter',
        });
        return;
      }

      this.view.showLoading();

      const result = await this.model.registerUser({ name, email, password });

      this.view.hideLoading();

      if (!result.success) {
        this.view.showAlert({
          icon: 'error',
          title: 'Registrasi Gagal',
          text: result.message,
        });
        return;
      }

      this.view.showAlert({
        icon: 'success',
        title: 'Registrasi Berhasil',
        text: 'Akun Anda telah dibuat!',
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        this.view.redirectToLogin();
      }, 2000);
    } catch (error) {
      this.view.hideLoading();

      console.error('Register error:', error);
      this.view.showAlert({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat registrasi. Silakan coba lagi.',
      });
    }
  }
}
