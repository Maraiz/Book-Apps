import {
  getToken,
  getUserName,
  clearAuthData,
  isLoggedIn,
} from '../../data/auth.js';
import { getStories, getStoryDetail, subscribeNotification, unsubscribeNotification } from '../../data/api.js';

export default class DashboardModel {
  constructor() {
    this.token = null;
    this.userName = null;
    this.stories = [];
    this.pushSubscription = null; // Tambahkan ini
  }

  isUserAuthenticated() {
    this.token = getToken();
    this.userName = getUserName();
    return isLoggedIn() && !!this.token;
  }

  getUserData() {
    return {
      token: this.token || getToken(),
      userName: this.userName || getUserName(),
    };
  }

  async loadStories() {
    try {
      const token = this.token || getToken();

      if (!token) {
        return {
          success: false,
          message: 'Token tidak tersedia',
        };
      }

      const response = await getStories(token);

      if (response.error) {
        return {
          success: false,
          message: response.message,
        };
      }

      this.stories = response.listStory || [];

      return {
        success: true,
        data: this.stories,
      };
    } catch (error) {
      console.error('Model error loading stories:', error);
      return {
        success: false,
        message:
          error.message || 'Gagal memuat daftar cerita. Silakan coba lagi.',
      };
    }
  }

  async getStoryDetail(storyId) {
    try {
      const token = this.token || getToken();

      if (!token) {
        return {
          success: false,
          message: 'Token tidak tersedia',
        };
      }

      const response = await getStoryDetail(token, storyId);

      if (response.error) {
        return {
          success: false,
          message: response.message,
        };
      }

      return {
        success: true,
        data: response.story,
      };
    } catch (error) {
      console.error('Model error getting story detail:', error);
      return {
        success: false,
        message:
          error.message || 'Gagal memuat detail cerita. Silakan coba lagi.',
      };
    }
  }

  performLogout() {
    try {
      clearAuthData();
      this.token = null;
      this.userName = null;
      this.stories = [];

      return {
        success: true,
        message: 'Logout berhasil',
      };
    } catch (error) {
      console.error('Model error during logout:', error);
      return {
        success: false,
        message: 'Gagal logout',
      };
    }
  }

  getStoriesWithLocation() {
    return this.stories.filter(
      story =>
        story.lat !== null &&
        story.lon !== null &&
        !isNaN(story.lat) &&
        !isNaN(story.lon)
    );
  }

  findStoryById(storyId) {
    return this.stories.find(story => story.id === storyId);
  }

   async initializePushNotification() {
    try {
      const token = this.token || getToken();
      if (!token) {
        return {
          success: false,
          message: 'Token tidak tersedia untuk push notification',
        };
      }

      // Check if browser supports notifications
      if (!('Notification' in window)) {
        return {
          success: false,
          message: 'Browser tidak mendukung notifikasi',
        };
      }

      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        return {
          success: false,
          message: 'Browser tidak mendukung Service Worker',
        };
      }

      // Request permission
      const permission = await this._requestNotificationPermission();
      if (!permission) {
        return {
          success: false,
          message: 'Izin notifikasi ditolak',
        };
      }

      // Register service worker
      const registration = await this._registerServiceWorker();
      if (!registration) {
        return {
          success: false,
          message: 'Gagal mendaftarkan Service Worker',
        };
      }

      // Subscribe to push notifications
      const subscriptionResult = await this._subscribeToPush(registration, token);
      if (!subscriptionResult.success) {
        return subscriptionResult;
      }

      return {
        success: true,
        message: 'Push notification berhasil diaktifkan',
      };
    } catch (error) {
      console.error('Error initializing push notification:', error);
      return {
        success: false,
        message: 'Gagal menginisialisasi push notification',
      };
    }
  }

  async _requestNotificationPermission() {
    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  async _registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.bundle.js');
      console.log('Service Worker registered:', registration);
      await navigator.serviceWorker.ready;
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async _subscribeToPush(registration, token) {
    try {
      const vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this._urlBase64ToUint8Array(vapidPublicKey),
      });

      console.log('Push subscription:', subscription);

      // Subscribe to API
      const result = await subscribeNotification(token, subscription);
      
      if (result.error) {
        console.error('Failed to subscribe to API:', result.message);
        return {
          success: false,
          message: result.message,
        };
      }

      // Store subscription
      this.pushSubscription = subscription;
      localStorage.setItem('pushSubscription', JSON.stringify(subscription));
      
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return {
        success: false,
        message: 'Gagal subscribe ke push notification',
      };
    }
  }

  async unsubscribeFromPush() {
    try {
      const token = this.token || getToken();
      if (!token) {
        return {
          success: false,
          message: 'Token tidak tersedia',
        };
      }

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        return {
          success: false,
          message: 'Service Worker tidak ditemukan',
        };
      }

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        return {
          success: false,
          message: 'Tidak ada subscription aktif',
        };
      }

      // Unsubscribe from API
      const result = await unsubscribeNotification(token, subscription.endpoint);
      
      if (result.error) {
        console.error('Failed to unsubscribe from API:', result.message);
      }

      // Unsubscribe from browser
      await subscription.unsubscribe();
      
      // Remove from storage
      this.pushSubscription = null;
      localStorage.removeItem('pushSubscription');
      
      return {
        success: true,
        message: 'Berhasil unsubscribe dari push notification',
      };
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return {
        success: false,
        message: 'Gagal unsubscribe dari push notification',
      };
    }
  }

  isPushNotificationSubscribed() {
    const subscription = localStorage.getItem('pushSubscription');
    return !!subscription;
  }

  // Update performLogout to include push notification cleanup
  performLogout() {
    try {
      // Unsubscribe from push notifications before logout
      if (this.isPushNotificationSubscribed()) {
        this.unsubscribeFromPush().catch(error => {
          console.error('Error unsubscribing during logout:', error);
        });
      }

      clearAuthData();
      this.token = null;
      this.userName = null;
      this.stories = [];
      this.pushSubscription = null;

      return {
        success: true,
        message: 'Logout berhasil',
      };
    } catch (error) {
      console.error('Model error during logout:', error);
      return {
        success: false,
        message: 'Gagal logout',
      };
    }
  }

  // Tambahkan method ini di DashboardModel
async validatePushSubscription() {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      // Service worker tidak ada, clear storage
      localStorage.removeItem('pushSubscription');
      this.pushSubscription = null;
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      // Tidak ada subscription aktif, clear storage
      localStorage.removeItem('pushSubscription');
      this.pushSubscription = null;
      return false;
    }

    // Cek permission browser
    if (Notification.permission !== 'granted') {
      // Permission ditolak, clear storage dan unsubscribe
      localStorage.removeItem('pushSubscription');
      this.pushSubscription = null;
      try {
        await subscription.unsubscribe();
      } catch (error) {
        console.log('Error unsubscribing:', error);
      }
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating subscription:', error);
    // Jika ada error, clear storage untuk safety
    localStorage.removeItem('pushSubscription');
    this.pushSubscription = null;
    return false;
  }
}

// Update method isPushNotificationSubscribed
isPushNotificationSubscribed() {
  const subscription = localStorage.getItem('pushSubscription');
  return !!subscription;
}

// Tambahkan method baru untuk cek status real-time
async isPushNotificationActive() {
  if (!this.isPushNotificationSubscribed()) {
    return false;
  }
  
  return await this.validatePushSubscription();
}
}

