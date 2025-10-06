/**
 * FreeFileConverters Frontend Application
 * Handles file upload, format selection, and conversion
 */

// Configuration - UPDATE THIS WITH YOUR BACKEND URL
const CONFIG = {
  BACKEND_URL: 'https://freefileconverters-backend.onrender.com',
  MAX_FILE_SIZE: 1024 * 1024 * 1024, // 1GB in bytes
  MAX_FILES: 4
};

// Supported file formats mapped to their categories - ORGANIZED BY TYPE
const FORMATS = {
  // Image Formats
  'image-header': { name: '🖼️ IMAGES', category: 'header' },
  png: { name: 'PNG', category: 'image' },
  jpg: { name: 'JPG', category: 'image' },
  jpeg: { name: 'JPEG', category: 'image' },
  gif: { name: 'GIF', category: 'image' },
  webp: { name: 'WEBP', category: 'image' },
  bmp: { name: 'BMP', category: 'image' },
  svg: { name: 'SVG', category: 'image' },
  ico: { name: 'ICO', category: 'image' },
  tiff: { name: 'TIFF', category: 'image' },
  
  // Document Formats
  'document-header': { name: '📄 DOCUMENTS', category: 'header' },
  pdf: { name: 'PDF', category: 'document' },
  docx: { name: 'DOCX', category: 'document' },
  doc: { name: 'DOC', category: 'document' },
  odt: { name: 'ODT', category: 'document' },
  txt: { name: 'TXT', category: 'document' },
  rtf: { name: 'RTF', category: 'document' },
  pptx: { name: 'PPTX', category: 'document' },
  ppt: { name: 'PPT', category: 'document' },
  odp: { name: 'ODP', category: 'document' },
  
  // Audio Formats
  'audio-header': { name: '🎵 AUDIO', category: 'header' },
  mp3: { name: 'MP3', category: 'audio' },
  wav: { name: 'WAV', category: 'audio' },
  ogg: { name: 'OGG', category: 'audio' },
  m4a: { name: 'M4A', category: 'audio' },
  flac: { name: 'FLAC', category: 'audio' },
  aac: { name: 'AAC', category: 'audio' },
  
  // Video Formats
  'video-header': { name: '🎬 VIDEO', category: 'header' },
  mp4: { name: 'MP4', category: 'video' },
  avi: { name: 'AVI', category: 'video' },
  mov: { name: 'MOV', category: 'video' },
  mkv: { name: 'MKV', category: 'video' },
  webm: { name: 'WEBM', category: 'video' },
  flv: { name: 'FLV', category: 'video' }
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
let selectedFiles = [];
let selectedFormat = null;

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
  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);
  uploadArea.addEventListener('dragover', handleDragOver);
  uploadArea.addEventListener('dragleave', handleDragLeave);
  uploadArea.addEventListener('drop', handleDrop);
  removeBtn.addEventListener('click', resetForm);
  convertForm.addEventListener('submit', handleConvert);
}

/**
 * Populate format buttons based on available formats
 */
function populateFormatButtons() {
  formatGrid.innerHTML = '';
  
  Object.keys(FORMATS).forEach(format => {
    const formatData = FORMATS[format];
    
    if (formatData.category === 'header') {
      const header = document.createElement('div');
      header.className = 'format-header';
      header.textContent = formatData.name;
      formatGrid.appendChild(header);
    } else {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'format-btn';
      btn.dataset.format = format;
      btn.textContent = formatData.name;
      btn.addEventListener('click', () => selectFormat(format, btn));
      formatGrid.appendChild(btn);
    }
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
  
  const files = Array.from(e.dataTransfer.files).slice(0, CONFIG.MAX_FILES);
  if (files.length > 0) {
    const dt = new DataTransfer();
    files.forEach(f => dt.items.add(f));
    fileInput.files = dt.files;
    handleFileSelect();
  }
}

/**
 * Handle file selection
 */
function handleFileSelect() {
  const files = Array.from(fileInput.files).slice(0, CONFIG.MAX_FILES);
  
  if (!files || files.length === 0) return;
  
  // Check file sizes
  for (const file of files) {
    if (file.size > CONFIG.MAX_FILE_SIZE) {
      showStatus(`File "${file.name}" exceeds 1GB limit. Please choose smaller files.`, 'error');
      return;
    }
  }
  
  selectedFiles = files;
  
  // Display file info
  if (files.length === 1) {
    fileNameDisplay.textContent = files[0].name;
    const ext = files[0].name.split('.').pop().toLowerCase();
    fromFormat.textContent = ext.toUpperCase();
  } else {
    fileNameDisplay.textContent = `${files.length} files selected`;
    fromFormat.textContent = 'MULTI';
  }
  
  uploadArea.classList.add('has-file');
  fileDisplay.classList.add('active');
  conversionSection.classList.add('active');
  
  // Reset format selection
  selectedFormat = null;
  toFormat.textContent = '-';
  document.querySelectorAll('.format-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Show all formats for multiple files
  populateFormatButtons();
  
  updateConvertButton();
  hideStatus();
}

/**
 * Get file category based on extension
 */
function getFileCategory(extension) {
  const ext = extension.toLowerCase();
  for (const [key, value] of Object.entries(FORMATS)) {
    if (value.category !== 'header' && key === ext) {
      return value.category;
    }
  }
  return null;
}

/**
 * Select target format
 */
function selectFormat(format, button) {
  document.querySelectorAll('.format-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
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
  if (selectedFiles.length > 0 && selectedFormat) {
    convertBtn.disabled = false;
    convertBtn.textContent = `Convert ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} to ${selectedFormat.toUpperCase()}`;
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
  selectedFiles = [];
  selectedFormat = null;
  
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
 * Handle file conversion
 */
async function handleConvert(e) {
  e.preventDefault();
  
  if (selectedFiles.length === 0 || !selectedFormat) {
    showStatus('Please select file(s) and target format.', 'error');
    return;
  }
  
  convertBtn.disabled = true;
  convertBtn.textContent = 'Converting...';
  
  progressContainer.classList.add('active');
  progressBar.style.width = '0%';
  progressText.textContent = 'Uploading files...';
  hideStatus();
  
  try {
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    formData.append('targetFormat', selectedFormat);
    
    // Phase 1: Upload (0-30%)
    animateProgress(0, 30, 1500);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Phase 2: Processing (30-70%)
    progressText.textContent = 'Processing conversion...';
    const processingPromise = new Promise(resolve => {
      animateProgress(30, 70, 3000);
      setTimeout(resolve, 3000);
    });
    
    const fetchPromise = fetch(`${CONFIG.BACKEND_URL}/convert`, {
      method: 'POST',
      body: formData
    });
    
    const [response] = await Promise.all([fetchPromise, processingPromise]);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Conversion failed: ${response.statusText}`);
    }
    
    // Phase 3: Finalizing (70-95%)
    progressText.textContent = 'Finalizing...';
    animateProgress(70, 95, 1000);
    
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
    if (selectedFiles.length === 1) {
      const originalName = selectedFiles[0].name;
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
      a.download = `${nameWithoutExt}.${selectedFormat}`;
    } else {
      a.download = 'converted_files.zip';
    }
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    setTimeout(() => {
      progressContainer.classList.remove('active');
      showStatus('✓ Success! Your file(s) have been converted and downloaded.', 'success');
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
