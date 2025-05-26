/**
 * Menerapkan transisi halaman menggunakan View Transition API
 * @param {Function} callback - Fungsi yang akan dijalankan selama transisi
 * @returns {Promise} - Promise yang selesai ketika transisi selesai
 */
export const applyViewTransition = async callback => {
  if (!document.startViewTransition) {
    callback();
    return Promise.resolve();
  }

  try {
    const transition = document.startViewTransition(callback);
    return transition.finished;
  } catch (error) {
    console.error('View Transition failed:', error);
    callback();
    return Promise.resolve();
  }
};

export const registerViewTransitionStyles = () => {
  if (document.getElementById('view-transition-styles')) {
    return;
  }

  const styleSheet = document.createElement('style');
  styleSheet.id = 'view-transition-styles';
  styleSheet.textContent = `
    /* Kontainer utama */
    main, .content-container, #content > div {
      view-transition-name: main-content;
    }
    
    /* Judul halaman */
    h1, h2.page-title, .page-header {
      view-transition-name: page-title;
    }
    
    /* Animasi untuk kontainer utama */
    ::view-transition-old(main-content) {
      animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both fade-out;
    }
    
    ::view-transition-new(main-content) {
      animation: 300ms cubic-bezier(0.4, 0, 0.2, 1) both fade-in;
    }
    
    /* Animasi untuk judul */
    ::view-transition-old(page-title) {
      animation: 250ms cubic-bezier(0.4, 0, 0.2, 1) both slide-out;
    }
    
    ::view-transition-new(page-title) {
      animation: 250ms cubic-bezier(0.4, 0, 0.2, 1) both slide-in;
    }
    
    /* Keyframes */
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fade-out {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-20px); }
    }
    
    @keyframes slide-in {
      from { transform: translateX(30px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slide-out {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(-30px); opacity: 0; }
    }
  `;

  document.head.appendChild(styleSheet);
};

/**
 * Mengecek apakah browser mendukung View Transition API
 * @returns {boolean} - true jika browser mendukung API
 */
export const isViewTransitionSupported = () => {
  return !!document.startViewTransition;
};
