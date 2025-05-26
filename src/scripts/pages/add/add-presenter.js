export default class AddPresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
  }

  async checkAuthentication() {
    if (!this.model.isUserLoggedIn()) {
      this.view.redirectToHome();
      return;
    }
  }

  async handleSubmitStory(formData) {
    try {
      const validation = this.model.validateStoryInput(formData);

      if (!validation.isValid) {
        this.view.showValidationErrors(validation.errors);
        return;
      }

      this.view.showLoading();

      const result = await this.model.submitStory(formData);

      this.view.hideLoading();

      if (!result.success) {
        this.view.showAlert({
          title: 'Error',
          text: result.message,
          icon: 'error',
        });
        return;
      }

      await this.view.showAlert({
        title: 'Sukses!',
        text: 'Cerita berhasil ditambahkan',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      this.view.redirectToDashboard();
    } catch (error) {
      this.view.hideLoading();
      console.error('Error submitting story:', error);

      this.view.showAlert({
        title: 'Error',
        text: error.message || 'Gagal menyimpan cerita',
        icon: 'error',
      });
    }
  }

  async handleBackToDashboard() {
    try {
      const confirmation = await this.view.confirmBackToDashboard();

      if (confirmation.isConfirmed) {
        this.view.redirectToDashboard();
      }
    } catch (error) {
      this.view.redirectToDashboard();
    }
  }
}
