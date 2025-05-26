import AddPresenter from './add-presenter.js';
import AddModel from './add-model.js';

export default class AddPage {
  constructor() {
    this.model = new AddModel();
    this.presenter = new AddPresenter({
      view: this,
      model: this.model,
    });

    this.hasUploadedPhoto = false;
    this.map = null;
    this.marker = null;
  }

  async render() {
    return `
      <section class="add-story-page" id="addStoryPage" aria-labelledby="add-story-heading">
        <div class="section-header">
          <div class="header-flex">
            <h2 id="add-story-heading">Tambah Cerita Baru</h2>
            <button id="backToDashboardBtn" class="btn-back" aria-label="Kembali ke dashboard">
              <i class="fa fa-arrow-left" aria-hidden="true"></i> Kembali ke Dashboard
            </button>
          </div>
          <p>Bagikan ceritamu dengan pembaca lainnya</p>
        </div>

        <form id="addStoryForm" class="story-form">
          <div class="form-group">
            <label for="storyDescription">Deskripsi Cerita</label>
            <textarea id="storyDescription" name="description" rows="4" placeholder="Ceritakan kisahmu di sini..."
              required aria-required="true"></textarea>
          </div>

          <div class="form-group">
            <label for="storyPhoto">Unggah Foto</label>
            <div class="file-upload">
              <input type="file" id="storyPhoto" name="photo" accept="image/*" aria-describedby="photo-hint" />
              <span id="photo-hint" class="sr-only">Unggah foto untuk cerita Anda. Ukuran maksimal 1MB.</span>

              <video id="cameraFeed" autoplay aria-hidden="true"></video>
              <canvas id="cameraCanvas" aria-hidden="true"></canvas>

              <div id="cameraPreview" aria-live="polite">
                <img id="capturedImage" src="#" alt="Pratinjau foto yang diambil" />

              </div>

              <div class="upload-preview" role="region" aria-live="polite">
                <img id="imagePreview" src="#" alt="Pratinjau foto yang diunggah" />
                <div class="upload-placeholder" id="uploadPlaceholder">
                  <i class="fa fa-cloud-upload" aria-hidden="true"></i>
                  <p>Pilih foto (Maks. 1MB)</p>
                </div>
              </div>

              <div class="upload-actions">
                <button type="button" id="uploadFileBtn" class="upload-btn" aria-label="Pilih file foto">
                  <i class="fa fa-folder-open" aria-hidden="true"></i> Pilih
                  File
                </button>
                <button type="button" id="takePictureBtn" class="upload-btn camera-btn"
                  aria-label="Ambil foto dengan kamera">
                  <i class="fa fa-camera" aria-hidden="true"></i> Ambil Foto
                </button>
                <button type="button" id="deletePhotoBtn" class="upload-btn danger-btn" aria-label="Hapus foto">
                  <i class="fa fa-trash" aria-hidden="true"></i> Hapus Foto
                </button>

                <div class="audio-record-wrapper">
                  <button type="button" id="recordAudioBtn" class="upload-btn audio-btn" aria-label="Rekam audio">
                    <i class="fa fa-microphone" aria-hidden="true"></i> Rekam
                    Audio
                  </button>
                  <button type="button" id="deleteAudioBtn" class="upload-btn danger-btn"
                    aria-label="Hapus rekaman audio">
                    <i class="fa fa-trash" aria-hidden="true"></i> Hapus
                    Rekaman
                  </button>
                  <div id="audioPreviewContainer" aria-live="polite">
                    <label for="audioPreview">Preview Rekaman:</label>
                    <audio id="audioPreview" controls></audio>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <fieldset>
              <legend>Lokasi</legend>
              <div class="form-row">
                <div class="form-group location-group">
                  <label for="storyLat">Latitude</label>
                  <input type="text" id="storyLat" name="lat" placeholder="Contoh: -6.2088" aria-describedby="lat-hint" />
                  <span id="lat-hint" class="sr-only">Masukkan koordinat latitude, misalnya -6.2088</span>
                </div>
                <div class="form-group location-group">
                  <label for="storyLon">Longitude</label>
                  <input type="text" id="storyLon" name="lon" placeholder="Contoh: 106.8456"
                    aria-describedby="lon-hint" />
                  <span id="lon-hint" class="sr-only">Masukkan koordinat longitude, misalnya 106.8456</span>
                </div>
                <div class="location-action">
                  <button type="button" id="getLocationBtn" aria-label="Dapatkan lokasi saat ini">
                    <i class="fa fa-map-marker" aria-hidden="true"></i> Lokasi
                    Saat Ini
                  </button>
                </div>
              </div>
              <div id="map" aria-label="Peta interaktif untuk memilih lokasi" role="application"></div>
            </fieldset>
          </div>

          <div class="form-actions">
            <div class="form-actions-left">
              <button type="button" id="backToDashboardBtnBottom" class="btn-secondary" aria-label="Kembali ke dashboard">
                <i class="fa fa-arrow-left" aria-hidden="true"></i> Kembali
              </button>
            </div>
            <div class="form-actions-right">
              <button type="submit" class="btn-primary" aria-label="Kirim cerita">
                <i class="fa fa-paper-plane" aria-hidden="true"></i> Kirim Cerita
              </button>
            </div>
          </div>
        </form>

        <div id="loadingIndicator" class="loading-spinner hidden" aria-live="assertive" role="status">
          <i class="fa fa-spinner fa-pulse fa-3x" aria-hidden="true"></i>
          <p>Sedang mengirim cerita...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this.presenter.checkAuthentication();

    this._initializeMap();
    this._setupPhotoUpload();
    this._setupCamera();
    this._setupAudioRecording();
    this._setupLocationFeatures();
    this._setupFormSubmission();
    this._setupBackButton();
  }

  showLoading() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
      loadingIndicator.classList.remove('hidden');
    }
  }

  hideLoading() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
      loadingIndicator.classList.add('hidden');
    }
  }

  showAlert(config) {
    if (window.Swal) {
      return Swal.fire(config);
    } else {
      alert(config.text || config.title);
    }
  }

  showValidationErrors(errors) {
    const errorMessage = errors.join('\n');
    this.showAlert({
      title: 'Validasi Error',
      text: errorMessage,
      icon: 'error',
    });
  }

  redirectToDashboard() {
    window.location.hash = '#/dashboard';
  }

  redirectToHome() {
    window.location.hash = '#/';
  }

  getFormData() {
    const description = document.getElementById('storyDescription').value;
    const lat = document.getElementById('storyLat').value;
    const lng = document.getElementById('storyLon').value;

    let photo = null;
    const photoInput = document.getElementById('storyPhoto');

    if (photoInput.files && photoInput.files[0]) {
      photo = photoInput.files[0];
    } else if (this.hasUploadedPhoto) {
      const imagePreview = document.getElementById('imagePreview');
      if (
        imagePreview.src &&
        imagePreview.src !== '#' &&
        !imagePreview.src.endsWith('#')
      ) {
        photo = imagePreview.src;
      }
    }

    return {
      description: description.trim(),
      photo,
      lat,
      lon: lng,
    };
  }

  _setupBackButton() {
    const backButton = document.getElementById('backToDashboardBtn');
    const backButtonBottom = document.getElementById(
      'backToDashboardBtnBottom'
    );

    const handleBack = () => {
      this.presenter.handleBackToDashboard();
    };

    if (backButton) {
      backButton.addEventListener('click', handleBack);
    }
    if (backButtonBottom) {
      backButtonBottom.addEventListener('click', handleBack);
    }
  }

  confirmBackToDashboard() {
    const description = document.getElementById('storyDescription').value;
    const hasContent = description.trim() !== '';

    if (hasContent) {
      return this.showAlert({
        title: 'Kembali ke Dashboard?',
        text: 'Data yang Anda isi belum disimpan. Yakin ingin kembali ke dashboard?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Kembali',
        cancelButtonText: 'Batal',
      });
    }

    return Promise.resolve({ isConfirmed: true });
  }

  _initializeMap() {
    const mapContainer = document.getElementById('map');

    if (mapContainer && window.L) {
      const map = L.map('map').setView([-2.548926, 118.0148634], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const marker = L.marker([-2.548926, 118.0148634], {
        draggable: true,
      }).addTo(map);
      marker.on('dragend', event => {
        const position = marker.getLatLng();
        document.getElementById('storyLat').value = position.lat.toFixed(4);
        document.getElementById('storyLon').value = position.lng.toFixed(4);
      });

      map.on('click', event => {
        const clickedPosition = event.latlng;
        marker.setLatLng(clickedPosition);

        document.getElementById('storyLat').value =
          clickedPosition.lat.toFixed(4);
        document.getElementById('storyLon').value =
          clickedPosition.lng.toFixed(4);

        const ripple = L.circleMarker(clickedPosition, {
          radius: 20,
          color: '#3388ff',
          fillColor: '#3388ff',
          fillOpacity: 0.3,
          weight: 2,
        }).addTo(map);

        let currentRadius = 20;
        const rippleAnimation = setInterval(() => {
          currentRadius += 5;
          ripple.setRadius(currentRadius);
          ripple.setStyle({
            opacity: 1 - currentRadius / 100,
            fillOpacity: 0.3 - currentRadius / 100,
          });

          if (currentRadius >= 80) {
            clearInterval(rippleAnimation);
            map.removeLayer(ripple);
          }
        }, 50);
      });

      this.map = map;
      this.marker = marker;

      const tooltipDiv = document.createElement('div');
      tooltipDiv.className = 'map-tooltip';
      tooltipDiv.innerHTML =
        '<i class="fa fa-info-circle"></i> Klik pada peta untuk memilih lokasi atau geser marker';
      tooltipDiv.style.position = 'absolute';
      tooltipDiv.style.bottom = '10px';
      tooltipDiv.style.left = '10px';
      tooltipDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      tooltipDiv.style.padding = '5px 10px';
      tooltipDiv.style.borderRadius = '4px';
      tooltipDiv.style.fontSize = '12px';
      tooltipDiv.style.zIndex = '1000';
      tooltipDiv.style.boxShadow = '0 1px 5px rgba(0,0,0,0.2)';

      mapContainer.style.position = 'relative';
      mapContainer.appendChild(tooltipDiv);
    } else {
      console.warn('Leaflet library not found or map container is missing');
    }
  }

  _setupPhotoUpload() {
    const fileInput = document.getElementById('storyPhoto');
    const uploadBtn = document.getElementById('uploadFileBtn');
    const deleteBtn = document.getElementById('deletePhotoBtn');
    const imagePreview = document.getElementById('imagePreview');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadPreviewArea = document.querySelector('.upload-preview');

    this.hasUploadedPhoto = false;
    uploadPreviewArea.style.cursor = 'pointer';
    uploadPreviewArea.style.border = '2px dashed #ccc';
    uploadPreviewArea.style.borderRadius = '4px';
    uploadPreviewArea.style.minHeight = '150px';
    uploadPreviewArea.style.transition = 'all 0.2s ease';

    uploadPreviewArea.addEventListener('mouseenter', function () {
      this.style.borderColor = '#6c64d3';
      this.style.backgroundColor = 'rgba(108, 100, 211, 0.05)';
    });

    uploadPreviewArea.addEventListener('mouseleave', function () {
      this.style.borderColor = '#ccc';
      this.style.backgroundColor = '';
    });

    uploadPlaceholder.addEventListener('click', function (e) {
      fileInput.click();
    });

    imagePreview.addEventListener('click', function (e) {
      fileInput.click();
    });
    uploadBtn.addEventListener('click', function () {
      fileInput.click();
    });

    fileInput.addEventListener('change', event => {
      const file = event.target.files[0];

      if (file) {
        if (file.size > 1024 * 1024) {
          alert('Ukuran file terlalu besar. Maksimum 1MB.');
          fileInput.value = '';
          return;
        }

        if (!file.type.match('image.*')) {
          alert('File harus berupa gambar.');
          fileInput.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = e => {
          imagePreview.src = e.target.result;
          imagePreview.style.display = 'block';
          uploadPlaceholder.style.display = 'none';
          deleteBtn.style.display = 'inline-block';
          this.hasUploadedPhoto = true;
        };
        reader.readAsDataURL(file);
      }
    });

    this.clearPhoto = () => {
      fileInput.value = '';
      imagePreview.src = '';
      imagePreview.style.display = 'none';
      uploadPlaceholder.style.display = 'block';
      deleteBtn.style.display = 'none';

      this.hasUploadedPhoto = false;
    };

    deleteBtn.addEventListener('click', () => {
      this.clearPhoto();
    });
  }

  _setupCamera() {
    const takePictureBtn = document.getElementById('takePictureBtn');
    const cameraFeed = document.getElementById('cameraFeed');
    const cameraCanvas = document.getElementById('cameraCanvas');
    const cameraPreview = document.getElementById('cameraPreview');
    const capturedImage = document.getElementById('capturedImage');
    const uploadPreview = document.querySelector('.upload-preview');
    const uploadActions = document.querySelector('.upload-actions');
    const audioRecordWrapper = document.querySelector('.audio-record-wrapper');

    let stream = null;

    cameraFeed.style.display = 'none';
    cameraPreview.style.display = 'none';

    const CAMERA_STATES = {
      INACTIVE: 'inactive',
      ACTIVE: 'active',
      PREVIEW: 'preview',
    };

    let cameraState = CAMERA_STATES.INACTIVE;

    const createButton = (text, icon, style, clickHandler) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `upload-btn camera-ui-btn ${style === 'danger' ? 'danger-btn' : style === 'success' ? 'success-btn' : ''}`;
      btn.innerHTML = `<i class="fa ${icon}"></i> ${text}`;

      if (style === 'success') {
        btn.style.backgroundColor = '#4CAF50';
        btn.style.color = 'white';
        btn.style.border = 'none';
      } else if (style === 'danger') {
        btn.style.backgroundColor = '#f44336';
        btn.style.color = 'white';
        btn.style.border = 'none';
      } else if (style === 'primary') {
        btn.style.backgroundColor = '#607D8B';
        btn.style.color = 'white';
        btn.style.border = 'none';
      }

      btn.addEventListener('click', clickHandler);
      return btn;
    };

    const stopCameraStream = () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('Camera track stopped');
        });
        stream = null;
        cameraFeed.srcObject = null;
      }
    };

    const updateCameraUI = () => {
      const customButtons = document.querySelectorAll('.camera-ui-btn');
      customButtons.forEach(btn => btn.remove());

      cameraFeed.style.display = 'none';
      cameraPreview.style.display = 'none';
      uploadPreview.style.display = 'block';

      const uploadFileBtn = document.getElementById('uploadFileBtn');
      const takePictureBtn = document.getElementById('takePictureBtn');
      const deletePhotoBtn = document.getElementById('deletePhotoBtn');

      uploadFileBtn.style.display = 'inline-block';
      takePictureBtn.style.display = 'inline-block';

      if (this.hasUploadedPhoto) {
        deletePhotoBtn.style.display = 'inline-block';
      } else {
        deletePhotoBtn.style.display = 'none';
      }

      audioRecordWrapper.style.display = 'block';
      if (cameraState === CAMERA_STATES.ACTIVE) {
        cameraFeed.style.display = 'block';
        uploadPreview.style.display = 'none';
        uploadFileBtn.style.display = 'none';
        takePictureBtn.style.display = 'none';
        deletePhotoBtn.style.display = 'none';
        audioRecordWrapper.style.display = 'none';

        const captureBtn = createButton(
          'Ambil Foto',
          'fa-camera',
          'success',
          takePhoto
        );
        const cancelBtn = createButton('Batal', 'fa-times', 'danger', () => {
          stopCameraStream();
          cameraState = CAMERA_STATES.INACTIVE;
          updateCameraUI();
        });

        uploadActions.appendChild(captureBtn);
        uploadActions.appendChild(cancelBtn);
      } else if (cameraState === CAMERA_STATES.PREVIEW) {
        cameraFeed.style.display = 'none';
        cameraFeed.srcObject = null;
        cameraPreview.style.display = 'block';
        uploadPreview.style.display = 'none';
        uploadFileBtn.style.display = 'none';
        takePictureBtn.style.display = 'none';
        deletePhotoBtn.style.display = 'none';
        audioRecordWrapper.style.display = 'none';

        const useBtn = createButton(
          'Gunakan Foto',
          'fa-check',
          'success',
          usePhoto
        );
        const retakeBtn = createButton(
          'Ulangi Foto',
          'fa-refresh',
          'primary',
          () => {
            stopCameraStream();
            cameraState = CAMERA_STATES.ACTIVE;
            updateCameraUI();
            startCamera();
          }
        );

        uploadActions.appendChild(retakeBtn);
        uploadActions.appendChild(useBtn);
      } else {
        stopCameraStream();
      }
    };

    const startCamera = async () => {
      try {
        stopCameraStream();
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        cameraFeed.srcObject = stream;
        await cameraFeed.play();
        console.log('Camera started successfully');
      } catch (err) {
        console.error('Error akses kamera:', err);
        alert('Gagal mengakses kamera: ' + err.message);
        cameraState = CAMERA_STATES.INACTIVE;
        updateCameraUI();
      }
    };

    const takePhoto = () => {
      const flash = document.createElement('div');
      flash.style.position = 'fixed';
      flash.style.top = '0';
      flash.style.left = '0';
      flash.style.width = '100%';
      flash.style.height = '100%';
      flash.style.backgroundColor = 'white';
      flash.style.opacity = '0.8';
      flash.style.zIndex = '9999';
      document.body.appendChild(flash);
      const shutterSound = new Audio(
        'data:audio/mp3;base64,SUQzAwAAAAACTFRJVDIAAABnAAAATEFNRSAzLjk4LjJVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ=='
      );
      shutterSound.play().catch(e => {});

      setTimeout(() => {
        document.body.removeChild(flash);
      }, 150);

      const context = cameraCanvas.getContext('2d');
      cameraCanvas.width = cameraFeed.videoWidth;
      cameraCanvas.height = cameraFeed.videoHeight;
      context.drawImage(
        cameraFeed,
        0,
        0,
        cameraCanvas.width,
        cameraCanvas.height
      );
      capturedImage.src = cameraCanvas.toDataURL('image/jpeg', 0.95);
      stopCameraStream();
      cameraState = CAMERA_STATES.PREVIEW;
      updateCameraUI();
    };

    const usePhoto = () => {
      const imagePreview = document.getElementById('imagePreview');
      const uploadPlaceholder = document.getElementById('uploadPlaceholder');
      const deleteBtn = document.getElementById('deletePhotoBtn');

      imagePreview.src = capturedImage.src;
      imagePreview.style.display = 'block';
      uploadPlaceholder.style.display = 'none';
      deleteBtn.style.display = 'inline-block';
      this.hasUploadedPhoto = true;
      stopCameraStream();
      cameraState = CAMERA_STATES.INACTIVE;
      updateCameraUI();
      showNotification('Foto berhasil ditambahkan');
    };

    const showNotification = (message, type = 'success') => {
      const notif = document.createElement('div');
      notif.textContent = message;
      notif.style.position = 'fixed';
      notif.style.bottom = '20px';
      notif.style.left = '50%';
      notif.style.transform = 'translateX(-50%)';
      notif.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
      notif.style.color = 'white';
      notif.style.padding = '10px 20px';
      notif.style.borderRadius = '4px';
      notif.style.zIndex = '9999';
      notif.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';

      document.body.appendChild(notif);
      setTimeout(() => document.body.removeChild(notif), 2000);
    };

    takePictureBtn.addEventListener('click', () => {
      cameraState = CAMERA_STATES.ACTIVE;
      updateCameraUI();
      startCamera();
    });

    window.addEventListener('beforeunload', () => {
      stopCameraStream();
    });

    window.addEventListener('hashchange', () => {
      stopCameraStream();
    });
    this._cleanupCamera = () => {
      stopCameraStream();
    };
  }

  _setupAudioRecording() {
    const recordAudioBtn = document.getElementById('recordAudioBtn');
    const deleteAudioBtn = document.getElementById('deleteAudioBtn');
    const audioPreview = document.getElementById('audioPreview');
    const audioPreviewContainer = document.getElementById(
      'audioPreviewContainer'
    );

    let isRecording = false;
    let hasMicrophoneAccess = false;
    let mediaRecorder = null;
    let audioChunks = [];
    let recordingTimer = null;
    let recordingDuration = 0;

    audioPreviewContainer.style.display = 'none';
    deleteAudioBtn.style.display = 'none';

    const createVisualizer = () => {
      const oldVisualizer = document.getElementById('audio-visualizer');
      if (oldVisualizer) oldVisualizer.remove();

      const visualizer = document.createElement('div');
      visualizer.id = 'audio-visualizer';
      visualizer.style.display = 'flex';
      visualizer.style.alignItems = 'center';
      visualizer.style.justifyContent = 'center';
      visualizer.style.gap = '2px';
      visualizer.style.height = '30px';
      visualizer.style.marginTop = '10px';
      visualizer.style.backgroundColor = '#f5f5f5';
      visualizer.style.borderRadius = '4px';
      visualizer.style.overflow = 'hidden';
      visualizer.style.padding = '0 10px';

      const timer = document.createElement('div');
      timer.id = 'recording-timer';
      timer.textContent = '00:00';
      timer.style.fontFamily = 'monospace';
      timer.style.fontSize = '14px';

      visualizer.appendChild(timer);
      for (let i = 0; i < 12; i++) {
        const bar = document.createElement('div');
        bar.className = 'visualizer-bar';
        bar.style.width = '3px';
        bar.style.height = '5px';
        bar.style.backgroundColor = '#ff5722';
        bar.style.borderRadius = '1px';
        bar.style.transition = 'height 0.1s ease';
        visualizer.appendChild(bar);
      }

      return visualizer;
    };

    const animateVisualizer = () => {
      const bars = document.querySelectorAll('.visualizer-bar');
      bars.forEach(bar => {
        const height = Math.floor(Math.random() * 20) + 5;
        bar.style.height = `${height}px`;
      });

      const timerEl = document.getElementById('recording-timer');
      if (timerEl) {
        recordingDuration += 0.1;
        const minutes = Math.floor(recordingDuration / 60);
        const seconds = Math.floor(recordingDuration % 60);
        timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    };

    const startRecording = async () => {
      try {
        if (!hasMicrophoneAccess) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          hasMicrophoneAccess = true;
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.ondataavailable = e => {
            audioChunks.push(e.data);
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);

            audioPreview.src = audioUrl;
            audioPreviewContainer.style.display = 'block';
            deleteAudioBtn.style.display = 'inline-block';

            recordAudioBtn.innerHTML =
              '<i class="fa fa-microphone"></i> Rekam Ulang';
            recordAudioBtn.style.backgroundColor = '';
            recordAudioBtn.style.animation = '';
            const visualizer = document.getElementById('audio-visualizer');
            if (visualizer) visualizer.remove();

            isRecording = false;
            stream.getTracks().forEach(track => track.stop());
            showNotification('Rekaman audio berhasil disimpan');
          };
        }

        audioChunks = [];
        recordingDuration = 0;
        mediaRecorder.start();
        isRecording = true;

        recordAudioBtn.innerHTML = '<i class="fa fa-stop"></i> Berhenti Rekam';
        recordAudioBtn.style.backgroundColor = '#f44336';

        const style = document.createElement('style');
        style.textContent = `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
          100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
        }
      `;
        document.head.appendChild(style);
        recordAudioBtn.style.animation = 'pulse 1.5s infinite';

        const visualizer = createVisualizer();
        recordAudioBtn.parentNode.appendChild(visualizer);

        recordingTimer = setInterval(animateVisualizer, 100);

        setTimeout(() => {
          if (isRecording) {
            stopRecording();
          }
        }, 60000);
      } catch (err) {
        console.error('Error akses mikrofon:', err);
        alert('Gagal mengakses mikrofon: ' + err.message);
        isRecording = false;
      }
    };

    const stopRecording = () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        clearInterval(recordingTimer);
      }
    };

    recordAudioBtn.addEventListener('click', () => {
      if (!isRecording) {
        startRecording();
      } else {
        stopRecording();
      }
    });

    deleteAudioBtn.addEventListener('click', () => {
      audioPreview.src = '';
      audioPreviewContainer.style.display = 'none';
      deleteAudioBtn.style.display = 'none';

      recordAudioBtn.innerHTML = '<i class="fa fa-microphone"></i> Rekam Audio';

      showNotification('Rekaman audio dihapus');
    });

    const showNotification = (message, type = 'success') => {
      const notif = document.createElement('div');
      notif.textContent = message;
      notif.style.position = 'fixed';
      notif.style.bottom = '20px';
      notif.style.left = '50%';
      notif.style.transform = 'translateX(-50%)';
      notif.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
      notif.style.color = 'white';
      notif.style.padding = '10px 20px';
      notif.style.borderRadius = '4px';
      notif.style.zIndex = '9999';
      notif.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';

      document.body.appendChild(notif);
      setTimeout(() => document.body.removeChild(notif), 2000);
    };
  }

  _setupLocationFeatures() {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const latInput = document.getElementById('storyLat');
    const lngInput = document.getElementById('storyLon');

    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        getLocationBtn.disabled = true;
        getLocationBtn.innerHTML =
          '<i class="fa fa-spinner fa-spin"></i> Mencari lokasi...';

        navigator.geolocation.getCurrentPosition(
          position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            latInput.value = lat.toFixed(4);
            lngInput.value = lng.toFixed(4);

            if (this.map && this.marker) {
              this.map.setView([lat, lng], 15);
              this.marker.setLatLng([lat, lng]);
            }

            getLocationBtn.disabled = false;
            getLocationBtn.innerHTML =
              '<i class="fa fa-map-marker"></i> Lokasi Saat Ini';

            if (window.Swal) {
              Swal.fire({
                title: 'Berhasil!',
                text: 'Lokasi Anda berhasil ditemukan',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
              });
            }
          },
          error => {
            console.error('Error getting location:', error);

            if (window.Swal) {
              Swal.fire({
                title: 'Error',
                text: 'Gagal mendapatkan lokasi: ' + error.message,
                icon: 'error',
              });
            } else {
              alert('Gagal mendapatkan lokasi: ' + error.message);
            }

            getLocationBtn.disabled = false;
            getLocationBtn.innerHTML =
              '<i class="fa fa-map-marker"></i> Lokasi Saat Ini';
          }
        );
      } else {
        if (window.Swal) {
          Swal.fire({
            title: 'Error',
            text: 'Geolocation tidak didukung oleh browser ini.',
            icon: 'error',
          });
        } else {
          alert('Geolocation tidak didukung oleh browser ini.');
        }
      }
    };

    if (getLocationBtn) {
      getLocationBtn.addEventListener('click', getCurrentLocation);
    }

    if (latInput && lngInput) {
      const updateMapFromCoords = () => {
        const lat = parseFloat(latInput.value);
        const lng = parseFloat(lngInput.value);

        if (!isNaN(lat) && !isNaN(lng) && this.map && this.marker) {
          this.map.setView([lat, lng], 15);
          this.marker.setLatLng([lat, lng]);
        }
      };

      latInput.addEventListener('change', updateMapFromCoords);
      lngInput.addEventListener('change', updateMapFromCoords);
    }
  }

  _setupFormSubmission() {
    const form = document.getElementById('addStoryForm');

    if (form) {
      form.addEventListener('submit', async event => {
        event.preventDefault();

        const formData = this.getFormData();
        await this.presenter.handleSubmitStory(formData);
      });
    }
  }
}
