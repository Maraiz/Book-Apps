export default class DashboardPresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
    this.initialized = false;
  }

  async init() {
    console.log('DashboardPresenter: init dimulai');

    if (!this.model.isUserAuthenticated()) {
      console.log(
        'DashboardPresenter: User tidak terotentikasi, redirect ke homepage'
      );
      this.view.redirectToHomePage();
      return;
    }

    const userData = this.model.getUserData();
    this.view.updateGreeting(userData.userName);

    console.log('DashboardPresenter: init selesai, user terotentikasi');
    this.initialized = true;

    console.log('DashboardPresenter: Memuat cerita...');
    await this.loadStories();

    // Initialize push notifications after stories are loaded
    console.log('DashboardPresenter: Inisialisasi push notification...');
    await this.initializePushNotification();
  }

  async loadStories() {
    if (!this.initialized) {
      if (!this.model.isUserAuthenticated()) {
        console.log('DashboardPresenter: User tidak terotentikasi');
        this.view.redirectToHomePage();
        return;
      }
    }

    try {
      console.log('DashboardPresenter: Menampilkan loading');
      this.view.showLoading();

      console.log('DashboardPresenter: Mengambil data cerita melalui model');
      const result = await this.model.loadStories();

      this.view.hideLoading();

      if (!result.success) {
        console.log(
          'DashboardPresenter: Error saat mengambil cerita:',
          result.message
        );
        this.view.showAlert({
          icon: 'error',
          title: 'Error',
          text: result.message,
        });
        return;
      }

      console.log(
        'DashboardPresenter: Menampilkan cerita, jumlah:',
        result.data.length
      );
      this.view.renderStories(result.data);
    } catch (error) {
      this.view.hideLoading();
      console.error('Error loading stories:', error);

      this.view.showAlert({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat daftar cerita. Silakan coba lagi.',
      });
    }
  }

// Update method initializePushNotification di DashboardPresenter
async initializePushNotification() {
  try {
    // Validasi subscription yang ada
    const isActive = await this.model.isPushNotificationActive();
    
    if (isActive) {
      console.log('Push notification sudah aktif dan valid');
      this.view.updateNotificationStatus(true);
    } else {
      console.log('Push notification tidak aktif atau tidak valid');
      this.view.updateNotificationStatus(false);
      
      // Jika ada permission dan user sebelumnya subscribe, coba re-subscribe
      if (Notification.permission === 'granted' && this.model.isPushNotificationSubscribed()) {
        console.log('Mencoba re-subscribe otomatis...');
        const result = await this.model.initializePushNotification();
        if (result.success) {
          this.view.updateNotificationStatus(true);
        }
      }
    }
  } catch (error) {
    console.error('Error initializing push notification:', error);
    this.view.updateNotificationStatus(false);
  }
}

// Update handleToggleNotification
async handleToggleNotification() {
  try {
    // Cek status real-time dulu
    const isActive = await this.model.isPushNotificationActive();
    
    if (isActive) {
      // Currently subscribed, unsubscribe
      const result = await this.model.unsubscribeFromPush();
      
      if (result.success) {
        this.view.showAlert({
          icon: 'success',
          title: 'Berhasil',
          text: 'Notifikasi telah dinonaktifkan',
          timer: 2000,
          showConfirmButton: false,
        });
        this.view.updateNotificationStatus(false);
      } else {
        this.view.showAlert({
          icon: 'error',
          title: 'Error',
          text: result.message,
        });
      }
    } else {
      // Not subscribed or invalid, subscribe
      const result = await this.model.initializePushNotification();
      
      if (result.success) {
        this.view.showAlert({
          icon: 'success',
          title: 'Berhasil',
          text: 'Notifikasi telah diaktifkan',
          timer: 2000,
          showConfirmButton: false,
        });
        this.view.updateNotificationStatus(true);
      } else {
        this.view.showAlert({
          icon: 'error',
          title: 'Error',
          text: result.message,
        });
      }
    }
  } catch (error) {
    console.error('Error toggling notification:', error);
    this.view.showAlert({
      icon: 'error',
      title: 'Error',
      text: 'Terjadi kesalahan saat mengatur notifikasi',
    });
  }
}

  async handleToggleNotification() {
    try {
      if (this.model.isPushNotificationSubscribed()) {
        // Currently subscribed, unsubscribe
        const result = await this.model.unsubscribeFromPush();
        
        if (result.success) {
          this.view.showAlert({
            icon: 'success',
            title: 'Berhasil',
            text: 'Notifikasi telah dinonaktifkan',
            timer: 2000,
            showConfirmButton: false,
          });
          this.view.updateNotificationStatus(false);
        } else {
          this.view.showAlert({
            icon: 'error',
            title: 'Error',
            text: result.message,
          });
        }
      } else {
        // Not subscribed, subscribe
        const result = await this.model.initializePushNotification();
        
        if (result.success) {
          this.view.showAlert({
            icon: 'success',
            title: 'Berhasil',
            text: 'Notifikasi telah diaktifkan',
            timer: 2000,
            showConfirmButton: false,
          });
          this.view.updateNotificationStatus(true);
        } else {
          this.view.showAlert({
            icon: 'error',
            title: 'Error',
            text: result.message,
          });
        }
      }
    } catch (error) {
      console.error('Error toggling notification:', error);
      this.view.showAlert({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat mengatur notifikasi',
      });
    }
  }

  async handleShowStoryDetail(storyId) {
    try {
      const cachedStory = this.model.findStoryById(storyId);

      if (cachedStory) {
        console.log('DashboardPresenter: Menggunakan story dari cache');
        this.view.showStoryModal(cachedStory);
        return;
      }

      this.view.showModalLoading();

      console.log(
        'DashboardPresenter: Mengambil detail cerita dengan ID:',
        storyId
      );
      const result = await this.model.getStoryDetail(storyId);

      this.view.hideModalLoading();

      if (!result.success) {
        console.log(
          'DashboardPresenter: Error saat mengambil detail cerita:',
          result.message
        );
        this.view.showAlert({
          icon: 'error',
          title: 'Error',
          text: result.message,
        });
        return;
      }

      this.view.showStoryModal(result.data);
    } catch (error) {
      this.view.hideModalLoading();
      console.error('Error showing story detail:', error);

      this.view.showAlert({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat detail cerita. Silakan coba lagi.',
      });
    }
  }

  async handleLogout() {
    try {
      const confirmation = await this.view.showAlert({
        title: 'Konfirmasi Logout',
        text: 'Apakah Anda yakin ingin keluar?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Logout',
        cancelButtonText: 'Batal',
      });

      if (confirmation.isConfirmed) {
        const logoutResult = this.model.performLogout();

        if (logoutResult.success) {
          await this.view.showAlert({
            title: 'Berhasil Logout',
            text: 'Anda telah keluar dari sistem',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });

          this.view.performLogout();
        } else {
          this.view.showAlert({
            icon: 'error',
            title: 'Error',
            text: logoutResult.message,
          });
        }
      }
    } catch (error) {
      console.error('Error during logout:', error);
      this.view.showAlert({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat logout',
      });
    }
  }
}
