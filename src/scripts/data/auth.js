// src/data/auth.js

// Ambil token dari localStorage
export const getToken = () => localStorage.getItem('token');

// Ambil nama pengguna
export const getUserName = () => localStorage.getItem('userName');

// Ambil ID pengguna
export const getUserId = () => localStorage.getItem('userId');

// Cek apakah pengguna sudah login
export const isLoggedIn = () => localStorage.getItem('isLoggedIn') === 'true';

// Ambil semua data user dalam format objek
export const getUserData = () => {
  try {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Simpan data autentikasi ke localStorage
export const saveAuthData = ({ userId, name, token }) => {
  localStorage.setItem('token', token);
  localStorage.setItem('userId', userId);
  localStorage.setItem('userName', name);
  localStorage.setItem('isLoggedIn', 'true');

  const userData = { id: userId, name, token };
  localStorage.setItem('userData', JSON.stringify(userData));
};

// Hapus semua data autentikasi (logout)
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userData');
  localStorage.removeItem('isLoggedIn');
};
