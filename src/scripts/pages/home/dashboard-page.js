import DashboardPresenter from './dashboard-presenter.js';
import DashboardModel from './dashboard-model.js';

export default class DashboardPage {
  constructor() {
    this.model = new DashboardModel();
    this.presenter = new DashboardPresenter({
      view: this,
      model: this.model,
    });
    this.storyMap = null;
  }

async render() {
  return `
    <section class="dashboardpage" id="dashboardSection" aria-labelledby="dashboardGreeting">
      <section class="dashboard">
        <div class="dashboard-header">
          <div class="greeting-section">
            <h2 id="dashboardGreeting">Selamat datang !</h2>
            <p>
              Selamat menikmati fitur Story App. Temukan cerita favorit Anda di sini.
            </p>
          </div>
          
          <div class="notification-controls">
            <button id="notificationToggle" class="notification-btn" aria-label="Toggle notifikasi">
              <i id="notificationIcon" class="fa fa-bell-slash" aria-hidden="true"></i>
              <span id="notificationText">Aktifkan Notifikasi</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Konten Utama Dashboard -->
      <section class="home-content" id="homeContent" role="main" aria-label="Konten cerita utama" tabindex="-1">
        <div id="loadingStories" class="loading-spinner" style="display:none;">
          <i class="fa fa-spinner fa-pulse fa-3x" aria-hidden="true"></i>
          <p>Memuat cerita...</p>
        </div>
        
        <section class="book-showcase" aria-labelledby="showcase-heading">
          <h2 id="showcase-heading" class="main-content">Cerita Terbaru</h2>
          <div id="storyList" class="story-grid" tabindex="-1" aria-label="Daftar cerita">
            <!-- Story items will be rendered here -->
          </div>
        </section>

        <section class="stories-map-container" aria-labelledby="stories-map-heading">
          <h2 id="stories-map-heading">Lokasi Cerita</h2>
          <div id="stories-map" class="stories-map" tabindex="-1" aria-label="Peta lokasi cerita"></div>
        </section>

        <section class="story-detail-section" aria-labelledby="detail-heading">
          <h2 id="detail-heading" class="sr-only">Detail Cerita</h2>
          <div id="storyDetail" class="story-detail" aria-live="polite"></div>
        </section>
      </section>
    </section>
    <div id="storyModal" class="story-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-content">
        <button class="close-modal" aria-label="Tutup modal">&times;</button>
        <div id="modalContent" class="modal-body">
          <h2 id="modal-title" class="sr-only">Detail Cerita</h2>
        </div>
      </div>
    </div>
  `;
}

async afterRender() {
  console.log('Dashboard: afterRender dimulai');
  this._setupEventListeners();
  this._setupSkipLinkHandler(); // Tambahkan ini

  setTimeout(async () => {
    console.log('Dashboard: Menginisialisasi presenter');
    await this.presenter.init();
    console.log('Dashboard: Presenter telah diinisialisasi');
  }, 50);
}

_setupSkipLinkHandler() {
  // Setup handler untuk skip link dari window global
  window.handleSkipToContent = () => {
    this.setupSkipLinkTarget();
  };
}

  _setupEventListeners() {
    // Logout button listeners
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', e => {
        e.preventDefault();
        this.presenter.handleLogout();
      });
    }

    // Notification toggle button
  const notificationToggle = document.getElementById('notificationToggle');
  if (notificationToggle) {
    notificationToggle.addEventListener('click', (e) => {
      e.preventDefault();
      this.presenter.handleToggleNotification();
    });
  }

    document.addEventListener('click', e => {
      if (e.target && e.target.id === 'logoutBtn') {
        e.preventDefault();
        this.presenter.handleLogout();
      }
    });

    document.addEventListener('click', e => {
      const storyCard = e.target.closest('.story-card');
      if (storyCard) {
        const storyId = storyCard.dataset.id;
        if (storyId) {
          console.log('Story card clicked, ID:', storyId);
          this.presenter.handleShowStoryDetail(storyId);
        }
      }
    });

      document.addEventListener('keydown', (e) => {
    if (e.target && e.target.classList.contains('story-card')) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const storyId = e.target.dataset.id;
        if (storyId) {
          console.log('Story card activated via keyboard, ID:', storyId);
          this.presenter.handleShowStoryDetail(storyId);
        }
      }
    }
  });

  // Click handlers yang sudah ada...
  document.addEventListener('click', e => {
    const storyCard = e.target.closest('.story-card');
    if (storyCard) {
      const storyId = storyCard.dataset.id;
      if (storyId) {
        console.log('Story card clicked, ID:', storyId);
        this.presenter.handleShowStoryDetail(storyId);
      }
    }
  });

    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        this.hideStoryModal();
      });
    }

    const storyModal = document.getElementById('storyModal');
    if (storyModal) {
      storyModal.addEventListener('click', e => {
        if (e.target === storyModal) {
          this.hideStoryModal();
        }
      });
    }

    // Event listener untuk popup map story selection
    document.addEventListener('story-selected', e => {
      const storyId = e.detail;
      this.presenter.handleShowStoryDetail(storyId);
    });
  }

  // ========== UI Methods untuk Presenter ==========

  updateGreeting(name) {
    const greeting = document.getElementById('dashboardGreeting');
    if (greeting && name) {
      greeting.textContent = `Selamat datang, ${name}!`;
    }
  }

  showLoading() {
    const loadingElement = document.getElementById('loadingStories');
    if (loadingElement) {
      loadingElement.style.display = 'flex';
    }
  }

  hideLoading() {
    const loadingElement = document.getElementById('loadingStories');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  showAlert(config) {
    if (window.Swal) {
      return Swal.fire(config);
    } else {
      alert(config.text || config.title);
      return Promise.resolve({ isConfirmed: true });
    }
  }

  showModalLoading() {
    const modalContent = document.getElementById('modalContent');
    if (modalContent) {
      modalContent.innerHTML = `
        <div class="loading-spinner">
          <i class="fa fa-spinner fa-pulse fa-3x" aria-hidden="true"></i>
          <p>Memuat detail cerita...</p>
        </div>
      `;
    }
    this.showStoryModal();
  }

  hideModalLoading() {
    const loadingElement = document.querySelector(
      '#modalContent .loading-spinner'
    );
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  redirectToHomePage() {
    window.location.hash = '#/';
  }

  performLogout() {
    window.location.hash = '#/';
    window.location.reload();
  }

  // ========== Story Rendering Methods ==========

  renderStories(stories) {
    const storyListElement = document.getElementById('storyList');

    if (!storyListElement) return;

    if (stories.length === 0) {
      storyListElement.innerHTML = `
        <div class="empty-state">
          <i class="fa fa-info-circle" aria-hidden="true"></i>
          <p>Belum ada cerita yang ditambahkan</p>
        </div>
      `;
      return;
    }

    storyListElement.innerHTML = stories
      .map(story => this._createStoryCardTemplate(story))
      .join('');
    this._initializeMap(stories);
  }

 _createStoryCardTemplate(story) {
  return `
    <article class="story-card" data-id="${story.id}" tabindex="0" role="button" aria-label="Lihat detail cerita ${story.name}">
      <div class="story-cover">
        <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}" onerror="this.src=''"/>
      </div>
      <div class="story-info">
        <h3 class="story-title">${story.name}</h3>
        <p class="story-description">${this._truncateText(story.description, 100)}</p>
        <div class="story-meta">
          <span><i class="fa fa-calendar" aria-hidden="true"></i> ${this._formatDate(story.createdAt)}</span>
          ${story.lat && story.lon ? `<span><i class="fa fa-map-marker" aria-hidden="true"></i> Lokasi tersedia</span>` : ''}
        </div>
      </div>
    </article>
  `;
}

  // ========== Helper Methods ==========

  _truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }

  _formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  }

  // ========== Map Methods ==========

  _initializeMap(stories) {
    const mapContainer = document.getElementById('stories-map');

    if (!mapContainer) return;

    mapContainer.innerHTML = '';

    const storiesWithLocation = stories.filter(
      story =>
        story.lat !== null &&
        story.lon !== null &&
        !isNaN(story.lat) &&
        !isNaN(story.lon)
    );

    if (storiesWithLocation.length === 0) {
      mapContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa fa-map-o" aria-hidden="true"></i>
          <p>Belum ada cerita dengan lokasi</p>
        </div>
      `;
      return;
    }

    if (typeof L !== 'undefined') {
      try {
        const map = L.map(mapContainer).setView([-2.548926, 118.0148634], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const bounds = [];

        storiesWithLocation.forEach(story => {
          const lat = parseFloat(story.lat);
          const lon = parseFloat(story.lon);

          if (!isNaN(lat) && !isNaN(lon)) {
            const marker = L.marker([lat, lon]).addTo(map).bindPopup(`
                <div class="popup-content">
                  <h3>${story.name}</h3>
                  <p>${this._truncateText(story.description, 50)}</p>
                  <img 
                    src="${story.photoUrl}" 
                    alt="Foto dari ${story.name}" 
                    style="width: 100%; max-height: 100px; object-fit: cover;"
                    onerror="this.src=''"
                  />
                  <button 
                    onclick="document.dispatchEvent(new CustomEvent('story-selected', { detail: '${story.id}' }))"
                    style="background: #3498db; color: white; border: none; padding: 5px 10px; margin-top: 5px; border-radius: 3px; cursor: pointer;"
                  >
                    Lihat Detail
                  </button>
                </div>
              `);

            bounds.push([lat, lon]);
          }
        });

        if (bounds.length > 1) {
          map.fitBounds(bounds);
        } else if (bounds.length === 1) {
          map.setView(bounds[0], 10);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        mapContainer.innerHTML = `
          <div class="empty-state">
            <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
            <p>Gagal memuat peta. Error: ${error.message}</p>
          </div>
        `;
      }
    } else {
      console.error('Leaflet library not loaded');
      mapContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
          <p>Library peta tidak tersedia</p>
        </div>
      `;
    }
  }

  // ========== Story Detail Methods ==========

  _showStoryDetail(story) {
    const storyDetail = document.getElementById('storyDetail');

    if (storyDetail) {
      storyDetail.innerHTML = `
        <div class="story-detail-card">
          <h3>${story.name}</h3>
          <img 
            src="${story.photoUrl}" 
            alt="Foto cerita dari ${story.name}" 
            onerror="this.src=''"
          />
          <p>${story.description}</p>
          <div class="story-meta">
            <span><i class="fa fa-calendar" aria-hidden="true"></i> ${this._formatDate(story.createdAt)}</span>
            ${story.lat && story.lon ? `<span><i class="fa fa-map-marker" aria-hidden="true"></i> Lokasi: ${story.lat}, ${story.lon}</span>` : ''}
          </div>
        </div>
      `;
      storyDetail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ========== Modal Methods ==========

  showStoryModal(story) {
    if (this.storyMap) {
      this.storyMap.remove();
      this.storyMap = null;
    }

    const modal = document.getElementById('storyModal');
    const modalContent = document.getElementById('modalContent');

    if (!modal || !modalContent) {
      console.error('Modal elements not found');
      return;
    }

    if (story) {
      modalContent.innerHTML = `
        <article class="story-modal-content">
          <div class="story-image">
            <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}" onerror="this.src=''"/>
            <h2 id="modal-title">${story.name}</h2>
          </div>
          <div class="story-info">
            ${
              story.lat && story.lon
                ? `
              <div class="story-location">
                <h3><i class="fa fa-map-marker" aria-hidden="true"></i> Lokasi Cerita</h3>
                <div id="story-map" class="story-location-map"></div>
              </div>
            `
                : ''
            }
            
            <div class="story-content">
              <p class="story-description">${story.description}</p>
              <div class="story-meta">
                <span><i class="fa fa-calendar" aria-hidden="true"></i> ${this._formatDate(story.createdAt)}</span>
                ${
                  story.lat && story.lon
                    ? `
                  <span><i class="fa fa-map-marker" aria-hidden="true"></i> Koordinat: ${story.lat}, ${story.lon}</span>
                `
                    : ''
                }
              </div>
            </div>
          </div>
        </article>
      `;
    }

    modal.classList.add('active');
    void modal.offsetHeight;
    modal.focus();

    document.addEventListener('keydown', this._handleEscapeKey);
    document.body.style.overflow = 'hidden';
    if (story && story.lat && story.lon) {
      setTimeout(() => {
        this._initializeMapWithRetry(story, 1);
      }, 300);
    }
  }

  hideStoryModal() {
    const modal = document.getElementById('storyModal');
    if (modal) {
      if (this.storyMap) {
        this.storyMap.remove();
        this.storyMap = null;
      }
      modal.classList.remove('active');

      document.removeEventListener('keydown', this._handleEscapeKey);

      document.body.style.overflow = 'auto';
    }
  }

  _handleEscapeKey = event => {
    if (event.key === 'Escape') {
      this.hideStoryModal();
    }
  };

  // ========== Map Retry Logic for Modal ==========

  _initializeMapWithRetry(story, attempt, maxAttempts = 5) {
    if (attempt > maxAttempts) {
      console.error('Failed to initialize map after', maxAttempts, 'attempts');
      const mapContainer = document.getElementById('story-map');
      if (mapContainer) {
        mapContainer.innerHTML = `
          <div class="empty-state">
            <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
            <p>Gagal memuat peta setelah beberapa percobaan. Silakan tutup dan buka kembali detail cerita.</p>
          </div>
        `;
      }
      return;
    }

    const delay = Math.min(100 * Math.pow(2, attempt - 1), 2000);

    console.log(`Map initialization attempt ${attempt}, waiting ${delay}ms`);

    setTimeout(() => {
      const mapContainer = document.getElementById('story-map');

      if (!mapContainer) {
        console.error('Map container not found');
        return;
      }

      if (mapContainer.offsetWidth === 0 || mapContainer.offsetHeight === 0) {
        console.log(
          `Map container not ready (attempt ${attempt}), retrying...`
        );
        this._initializeMapWithRetry(story, attempt + 1, maxAttempts);
        return;
      }

      try {
        if (this.storyMap) {
          this.storyMap.remove();
        }

        mapContainer.style.width = '100%';
        mapContainer.style.height = '200px';

        void mapContainer.offsetHeight;

        if (typeof L !== 'undefined') {
          console.log(`Initializing map (attempt ${attempt})`);

          this.storyMap = L.map(mapContainer, {
            attributionControl: false,
          }).setView([story.lat, story.lon], 13);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(this.storyMap);

          L.marker([story.lat, story.lon])
            .addTo(this.storyMap)
            .bindPopup(`<strong>${story.name}</strong>`);

          for (let i = 1; i <= 5; i++) {
            setTimeout(() => {
              if (this.storyMap) {
                console.log(`Refreshing map size (${i}/5)`);
                this.storyMap.invalidateSize(true);
              }
            }, 100 * i);
          }
        } else {
          console.error('Leaflet library not available');
          mapContainer.innerHTML = `
            <div class="empty-state">
              <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
              <p>Library peta Leaflet tidak tersedia</p>
            </div>
          `;
        }
      } catch (error) {
        console.error(`Error initializing map (attempt ${attempt}):`, error);
        this._initializeMapWithRetry(story, attempt + 1, maxAttempts);
      }
    }, delay);
  }

  updateNotificationStatus(isSubscribed) {
  const notificationIcon = document.getElementById('notificationIcon');
  const notificationText = document.getElementById('notificationText');
  const notificationBtn = document.getElementById('notificationToggle');

  if (notificationIcon && notificationText && notificationBtn) {
    if (isSubscribed) {
      notificationIcon.className = 'fa fa-bell';
      notificationText.textContent = 'Matikan Notifikasi';
      notificationBtn.classList.add('active');
      notificationBtn.setAttribute('aria-label', 'Matikan notifikasi');
    } else {
      notificationIcon.className = 'fa fa-bell-slash';
      notificationText.textContent = 'Aktifkan Notifikasi';
      notificationBtn.classList.remove('active');
      notificationBtn.setAttribute('aria-label', 'Aktifkan notifikasi');
    }
  }
}

setupSkipLinkTarget() {
  // Scroll ke atas dulu
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
  const storyList = document.getElementById('storyList');
  const storiesMap = document.getElementById('stories-map');
  const homeContent = document.getElementById('homeContent');
  
  // Prioritas focus: Story cards > Map > Home content
  let targetElement = null;
  
  // Cek apakah ada story cards yang bisa difocus
  const storyCards = storyList?.querySelectorAll('.story-card');
  if (storyCards && storyCards.length > 0) {
    targetElement = storyCards[0]; // Focus ke story card pertama
  } 
  // Jika tidak ada story, focus ke map container
  else if (storiesMap) {
    targetElement = storiesMap;
  }
  // Fallback ke home content
  else {
    targetElement = homeContent;
  }
  
  if (targetElement) {
    // Pastikan elemen bisa difocus
    if (targetElement.tabIndex === undefined || targetElement.tabIndex < 0) {
      targetElement.tabIndex = -1;
    }
    
    // Tunggu scroll ke atas selesai, baru focus ke target
    setTimeout(() => {
      targetElement.focus();
    }, 500); // Kasih waktu lebih untuk smooth scroll selesai
  }
}
}
