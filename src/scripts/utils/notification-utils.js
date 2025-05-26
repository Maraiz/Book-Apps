import CONFIG from '../config.js';
import { subscribeNotification, unsubscribeNotification } from '../api/api.js';

class NotificationUtils {
  static async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Browser tidak mendukung notifikasi');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('Browser tidak mendukung Service Worker');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  static urlBase64ToUint8Array(base64String) {
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

  static async subscribeToPush(registration, token) {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
      });

      console.log('Push subscription:', subscription);

      // Subscribe to API
      const result = await subscribeNotification(token, subscription);
      
      if (result.error) {
        console.error('Failed to subscribe to API:', result.message);
        return false;
      }

      // Store subscription in localStorage
      localStorage.setItem('pushSubscription', JSON.stringify(subscription));
      
      console.log('Successfully subscribed to push notifications');
      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }

  static async unsubscribeFromPush(token) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return false;

      // Unsubscribe from API
      const result = await unsubscribeNotification(token, subscription.endpoint);
      
      if (result.error) {
        console.error('Failed to unsubscribe from API:', result.message);
      }

      // Unsubscribe from browser
      await subscription.unsubscribe();
      
      // Remove from localStorage
      localStorage.removeItem('pushSubscription');
      
      console.log('Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  static async initializePushNotification(token) {
    // Request permission
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.log('Notification permission denied');
      return false;
    }

    // Register service worker
    const registration = await this.registerServiceWorker();
    if (!registration) {
      console.log('Service Worker registration failed');
      return false;
    }

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Subscribe to push notifications
    const isSubscribed = await this.subscribeToPush(registration, token);
    return isSubscribed;
  }
}

export default NotificationUtils;