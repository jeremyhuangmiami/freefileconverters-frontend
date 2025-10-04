/**
 * FreeFileConverters Frontend Application
 * Handles file upload, format selection, and conversion
 */

// Configuration - UPDATE THIS WITH YOUR BACKEND URL
const CONFIG = {
  // For local development: 'http://localhost:3000'
  // For production: 'https://your-backend.onrender.com'
  BACKEND_URL: 'https://freefileconverters-backend.onrender.com/',
  MAX_FILE_SIZE: 1024 * 1024 * 1024 // 1GB in bytes
};

// Supported file formats mapped to their categories
const FORMATS = {
  // Documents
  pdf: { name: 'PDF', category: 'document' },
  docx: { name: 'DOCX', category: 'document' },
  doc: { name: 'DOC', category: 'document' },
  odt: { name: 'ODT', category: 'document' },
  txt: { name: 'TXT', category: 'document' },
  rtf: { name: 'RTF', category: 'document' },
  
  // Images
  png: { name: 'PNG', category: 'image' },
  jpg: { name: 'JPG', category: 'image' },
  jpeg: { name: 'JPEG', category: 'image' },
  gif: { name: 'GIF', category: 'image' },
  webp: { name: 'WEBP', category: 'image' },
  bmp: { name: 'BMP', category: 'image' },
  svg: { name: 'SVG', category: 'image' },
  ico: { name: 'ICO', category: 'image' },
  
  // Audio
  mp3: { name: 'MP3', category: 'audio' },
  wav: { name: 'WAV', category: 'audio' },
  ogg: { name: 'OGG', category: 'audio' },
  m4a: { name: 'M4A', category: 'audio' },
  flac: { name: 'FLAC', category: 'audio' },
  
  // Video
  mp4: { name: 'MP4', category: 'video' },
  avi: { name: 'AVI', category: 'video' },
  mov: { name: 'MOV', category: 'video' },
  mkv: { name: 'MKV', category: 'video' },
  webm: { name: 'WEBM', category: 'video' }
};

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const fileDisplay = document.getElementById('fileDisplay');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const removeBtn = document.getElementById('removeBtn');
const conversionSection = document.getElementById('conversionSection');
const fromFormat = document.getElementById('fromFormat');
const toFormat = document.getElementById('toFormat');
const formatGrid = document.getElementById('formatGrid');
const targetFormat = document.getElementById('targetFormat');
const convertBtn = document.getElementById('convertBtn');
const convertForm = document.getElementById('convertForm');
const status = document.getElementById('status');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

// State
let selectedFile = null;
let selectedFormat = null;
let sourceExtension = null;

/**
 * Initialize the application
 */
function init() {
  setupEventListeners();
  populateFormatButtons();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Upload button click
  uploadBtn.addEventListener('click', () => fileInput.click());
  
  // File input change
  fileInput.addEventListener('change', handleFileSelect);
  
  // Drag and drop
  uploadArea.addEventListener('dragover', handleDragOver);
  uploadArea.addEventListener('dragleave', handleDragLeave);
  uploadArea.addEventListener('drop', handleDrop);
  
  // Remove file button
  removeBtn.addEventListener('click', resetForm);
  
  // Form submission
  convertForm.addEventListener('submit', handleConvert);
}

/**
 * Populate format buttons based on available formats
 */
function populateFormatButtons() {
  formatGrid.innerHTML = '';
  
  Object.keys(FORMATS).forEach(format => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'format-btn';
    btn.dataset.format = format;
    btn.textContent = FORMATS[format].name;
    
    btn.addEventListener('click', () => selectFormat(format, btn));
    
    formatGrid.appendChild(btn);
  });
}

/**
 * Handle drag over event
 */
function handleDragOver(e) {
  e.preventDefault();
  uploadArea.classList.add('dragover');
}

/**
 * Handle drag leave event
 */
function handleDragLeave() {
  uploadArea.classList.remove('dragover');
}

/**
 * Handle file drop
 */
function handleDrop(e) {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    fileInput.files = files;
    handleFileSelect();
  }
}

/**
 * Handle file selection
 */
function handleFileSelect() {
  const file = fileInput.files[0];
  
  if (!file) return;
  
  // Check file size
  if (file.size > CONFIG.MAX_FILE_SIZE) {
    showStatus('File size exceeds 1GB limit. Please choose a smaller file.', 'error');
    return;
  }
  
  selectedFile = file;
  sourceExtension = file.name.split('.').pop().toLowerCase();
  
  // Update UI
  fileNameDisplay.textContent = file.name;
  fromFormat.textContent = sourceExtension.toUpperCase();
  uploadArea.classList.add('has-file');
  fileDisplay.classList.add('active');
  conversionSection.classList.add('active');
  
  // Reset format selection
  selectedFormat = null;
  toFormat.textContent = '-';
  document.querySelectorAll('.format-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  updateConvertButton();
  hideStatus();
}

/**
 * Select target format
 */
function selectFormat(format, button) {
  // Deselect all buttons
  document.querySelectorAll('.format-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Select current button
  button.classList.add('selected');
  selectedFormat = format;
  targetFormat.value = format;
  toFormat.textContent = format.toUpperCase();
  
  updateConvertButton();
  hideStatus();
}

/**
 * Update convert button state
 */
function updateConvertButton() {
  if (selectedFile && selectedFormat) {
    convertBtn.disabled = false;
    convertBtn.textContent = `Convert to ${selectedFormat.toUpperCase()}`;
  } else {
    convertBtn.disabled = true;
    convertBtn.textContent = 'Select Format to Convert';
  }
}

/**
 * Reset form to initial state
 */
function resetForm() {
  fileInput.value = '';
  selectedFile = null;
  selectedFormat = null;
  sourceExtension = null;
  
  uploadArea.classList.remove('has-file');
  fileDisplay.classList.remove('active');
  conversionSection.classList.remove('active');
  progressContainer.classList.remove('active');
  
  document.querySelectorAll('.format-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  fromFormat.textContent = '-';
  toFormat.textContent = '-';
  targetFormat.value = '';
  
  hideStatus();
  updateConvertButton();
}

/**
 * Handle file conversion with realistic progress tracking
 */
async function handleConvert(e) {
  e.preventDefault();
  
  if (!selectedFile || !selectedFormat) {
    showStatus('Please select a file and target format.', 'error');
    return;
  }
  
  // Disable convert button during conversion
  convertBtn.disabled = true;
  convertBtn.textContent = 'Converting...';
  
  // Show progress
  progressContainer.classList.add('active');
  progressBar.style.width = '0%';
  progressText.textContent = 'Uploading file...';
  hideStatus();
  
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('targetFormat', selectedFormat);
    
    // Phase 1: Upload (0-30%)
    const uploadPromise = new Promise(resolve => {
      animateProgress(0, 30, 1500);
      setTimeout(resolve, 1500);
    });
    
    // Start the actual fetch request
    const fetchPromise = fetch(`${CONFIG.BACKEND_URL}/convert`, {
      method: 'POST',
      body: formData
    });
    
    // Wait for upload animation to complete
    await uploadPromise;
    
    // Phase 2: Processing (30-70%)
    progressText.textContent = 'Processing conversion...';
    const processingPromise = new Promise(resolve => {
      animateProgress(30, 70, 2000);
      setTimeout(resolve, 2000);
    });
    
    // Wait for either processing animation or actual response (whichever is longer)
    const [response] = await Promise.all([fetchPromise, processingPromise]);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Conversion failed: ${response.statusText}`);
    }
    
    // Phase 3: Finalizing (70-95%)
    progressText.textContent = 'Finalizing...';
    animateProgress(70, 95, 1000);
    
    // Get the converted file
    const blob = await response.blob();
    
    // Phase 4: Complete (95-100%)
    progressText.textContent = 'Download ready!';
    animateProgress(95, 100, 300);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Download the file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Generate filename
    const originalName = selectedFile.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    a.download = `${nameWithoutExt}.${selectedFormat}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Show success message
    setTimeout(() => {
      progressContainer.classList.remove('active');
      showStatus('✓ Success! Your file has been converted and downloaded. Files are automatically deleted from our servers.', 'success');
      convertBtn.textContent = `Convert to ${selectedFormat.toUpperCase()}`;
      convertBtn.disabled = false;
    }, 500);
    
  } catch (error) {
    console.error('Conversion error:', error);
    progressContainer.classList.remove('active');
    showStatus(`✗ Conversion failed: ${error.message}`, 'error');
    convertBtn.disabled = false;
    updateConvertButton();
  }
}

/**
 * Animate progress bar
 */
function animateProgress(start, end, duration) {
  const startTime = Date.now();
  
  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = start + (end - start) * progress;
    
    progressBar.style.width = `${current}%`;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  update();
}

/**
 * Show status message
 */
function showStatus(message, type) {
  status.textContent = message;
  status.className = `status active ${type}`;
}

/**
 * Hide status message
 */
function hideStatus() {
  status.className = 'status';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
