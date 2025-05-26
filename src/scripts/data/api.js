import CONFIG from '../config.js';

const ENDPOINTS = {
  LOGIN: `${CONFIG.BASE_URL}/login`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  NOTIFICATIONS_SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// == Login == //
export async function login({ email, password }) {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: true,
        message: data.message || 'Login gagal',
      };
    }

    return {
      error: false,
      loginResult: data.loginResult,
    };
  } catch (error) {
    return {
      error: true,
      message: 'Terjadi kesalahan jaringan',
    };
  }
}

export async function register({ name, email, password }) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: true,
        message: data.message || 'Registrasi gagal',
      };
    }

    return {
      error: false,
      message: data.message || 'User Created',
    };
  } catch (error) {
    return {
      error: true,
      message: 'Terjadi kesalahan jaringan',
    };
  }
}

// == Get Stories == //
export async function getStories(token, page = 1, size = 10, withLocation = 0) {
  try {
    const url = new URL(ENDPOINTS.STORIES);
    url.searchParams.append('page', page);
    url.searchParams.append('size', size);
    url.searchParams.append('location', withLocation);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: true,
        message: data.message || 'Gagal mengambil data cerita',
        listStory: [],
      };
    }

    return {
      error: false,
      message: data.message || 'Success',
      listStory: data.listStory || [],
    };
  } catch (error) {
    console.error('Fetch error:', error);
    return {
      error: true,
      message: error.message || 'Network error',
      listStory: [],
    };
  }
}

// == Add Story == //
export async function addStory({ token, description, photo, lat, lon }) {
  try {
    const formData = new FormData();
    formData.append('description', description);

    if (photo instanceof File) {
      formData.append('photo', photo);
    } else {
      return {
        error: true,
        message: 'Photo harus berupa file',
      };
    }

    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }

    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: true,
        message: data.message || 'Gagal menambahkan cerita',
      };
    }

    return {
      error: false,
      message: data.message || 'success',
    };
  } catch (error) {
    console.error('Add story error:', error);
    return {
      error: true,
      message: 'Terjadi kesalahan jaringan',
    };
  }
}

// == Get Story Detail == //
export async function getStoryDetail(token, id) {
  try {
    const url = `${ENDPOINTS.STORIES}/${id}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: true,
        message: data.message || 'Gagal mengambil detail cerita',
        story: null,
      };
    }

    return {
      error: false,
      message: data.message || 'Success',
      story: data.story || null,
    };
  } catch (error) {
    console.error('Fetch error:', error);
    return {
      error: true,
      message: error.message || 'Network error',
      story: null,
    };
  }
}

// == Push Notification Functions == //

// Subscribe to push notifications
export async function subscribeNotification(token, subscription) {
  try {
    // Convert keys to the correct format
    const keys = {
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
      auth: arrayBufferToBase64(subscription.getKey('auth'))
    };

    console.log('Subscription data being sent:', {
      endpoint: subscription.endpoint,
      keys: keys
    });

    const response = await fetch(ENDPOINTS.NOTIFICATIONS_SUBSCRIBE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: keys,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: true,
        message: data.message || 'Gagal subscribe notification',
      };
    }

    return {
      error: false,
      message: data.message,
      data: data.data,
    };
  } catch (error) {
    console.error('Subscribe notification error:', error);
    return {
      error: true,
      message: 'Terjadi kesalahan jaringan: ' + error.message,
    };
  }
}

// Unsubscribe from push notifications
export async function unsubscribeNotification(token, endpoint) {
  try {
    const response = await fetch(ENDPOINTS.NOTIFICATIONS_SUBSCRIBE, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: endpoint,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: true,
        message: data.message || 'Gagal unsubscribe notification',
      };
    }

    return {
      error: false,
      message: data.message,
    };
  } catch (error) {
    console.error('Unsubscribe notification error:', error);
    return {
      error: true,
      message: 'Terjadi kesalahan jaringan: ' + error.message,
    };
  }
}