import { login } from '../../../data/api.js';
import { saveAuthData, isLoggedIn, getToken } from '../../../data/auth.js';

export default class LoginModel {
  async loginUser(credentials) {
    try {
      const response = await login(credentials);

      if (!response.error) {
        saveAuthData(response.loginResult);
        return { success: true, data: response.loginResult };
      }

      return { success: false, message: response.message };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat login. Silakan coba lagi.',
      };
    }
  }

  isUserLoggedIn() {
    return isLoggedIn();
  }
}
