import { addStory } from '../../data/api.js';
import { getToken, isLoggedIn } from '../../data/auth.js';

export default class AddModel {
  constructor() {
    this._getToken = getToken;
  }

  isUserLoggedIn() {
    return isLoggedIn();
  }

  async submitStory({ description, photo, lat, lon }) {
    try {
      const token = this._getToken();

      if (!token) {
        return {
          success: false,
          message: 'Token tidak ditemukan. Silakan login ulang.',
        };
      }

      let photoFile = photo;

      if (typeof photo === 'string' && photo.startsWith('data:image')) {
        photoFile = await this._dataURLtoFile(photo, 'photo.jpg');
      } else if (!(photo instanceof File)) {
        return {
          success: false,
          message: 'Format foto tidak valid',
        };
      }

      if (photoFile.size > 1024 * 1024) {
        return {
          success: false,
          message: 'Ukuran foto maksimal 1MB',
        };
      }

      const latitude = lat ? parseFloat(lat) : null;
      const longitude = lon ? parseFloat(lon) : null;

      // Submit ke API
      const result = await addStory({
        token,
        description,
        photo: photoFile,
        lat: latitude,
        lon: longitude,
      });

      if (result.error) {
        return {
          success: false,
          message: result.message,
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error in submitStory:', error);
      return {
        success: false,
        message: error.message || 'Terjadi kesalahan saat menambahkan cerita',
      };
    }
  }

  validateStoryInput({ description, photo }) {
    const errors = [];

    if (!description || description.trim() === '') {
      errors.push('Deskripsi cerita harus diisi');
    }

    if (!photo) {
      errors.push('Foto harus diunggah');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async _dataURLtoFile(dataUrl, filename) {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('Error converting data URL to file:', error);
      throw new Error('Gagal memproses foto');
    }
  }
}
