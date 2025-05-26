// src/scripts/pages/auth/register/register-model.js
import { register } from '../../../data/api.js';

export default class RegisterModel {
  async registerUser(userData) {
    try {
      const response = await register(userData);

      if (!response.error) {
        return {
          success: true,
          data: response,
        };
      }

      return {
        success: false,
        message: response.message,
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat registrasi. Silakan coba lagi.',
      };
    }
  }
}
