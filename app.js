/**
 * FreeFileConverters Frontend Application
 * Handles file upload, format selection, and conversion
 */

// Configuration - UPDATE THIS WITH YOUR BACKEND URL
const CONFIG = {
  // For local development: 'http://localhost:3000'
  // For production: 'https://your-backend.onrender.com' (NO TRAILING SLASH)
  BACKEND_URL: 'https://freefileconverters-backend.onrender.com',
  MAX_FILE_SIZE: 1024 * 1024 * 1024 // 1GB in bytes for total files
};

// Supported file formats mapped to their categories - ORGANIZED BY TYPE
const FORMATS = {
  // Image Formats
  'image-header': { name: '📷 IMAGES', category: 'header' },
  png: { name: 'PNG', category: 'image' },
  jpg: { name: 'JPG', category: 'image' },
  jpeg: { name: 'JPEG', category: 'image' },
  gif: { name: 'GIF', category: 'image' },
  webp: { name: 'WEBP', category: 'image' },
  bmp: { name: 'BMP', category: 'image' },
  svg: { name: 'SVG', category: 'image' },
  ico: { name: 'ICO', category: 'image' },
  
  // Document Formats
  'document-header': { name: '📄 DOCUMENTS', category: 'header' },
  pdf: { name: 'PDF', category: 'document' },
  docx: { name: 'DOCX', category: 'document' },
  doc: { name: 'DOC', category: 'document' },
  odt: { name: 'ODT', category: 'document' },
  txt: { name: 'TXT', category: 'document' },
  rtf: { name: 'RTF', category: 'document' },
  ppt: { name: 'PPT', category: 'document' },
  pptx: { name: 'PPTX', category: 'document' },
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
let selectedFiles = null;
let selectedFormat = null;
let sourceExtensions = null;
let sourceCategory = null;

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
 * Populate format buttons based on available formats - ORGANIZED BY CATEGORY
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
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    fileInput.files = files;
    handleFileSelect();
  }
}

/**
 * Handle file selection and filter formats based on file type
 */
function handleFileSelect() {
  const files = fileInput.files;
  
  if (files.length === 0) return;
  
  if (files.length > 4) {
    showStatus('Maximum 4 files allowed.', 'error');
    return;
  }
  
  let totalSize = 0;
  Array.from(files).forEach(file => {
    totalSize += file.size;
  });
  
  if (totalSize > CONFIG.MAX_FILE_SIZE) {
    showStatus('Total file size exceeds 1GB limit. Please choose smaller files.', 'error');
    return;
  }
  
  selectedFiles = files;
  sourceExtensions = Array.from(files).map(file => file.name.split('.').pop().toLowerCase());
  
  const categories = sourceExtensions.map(ext => getFileCategory(ext));
  sourceCategory = categories[0];
  const allSameCategory = categories.every(cat => cat === sourceCategory);
  
  if (!allSameCategory || !sourceCategory) {
    showStatus('All files must be of the same type and supported format.', 'error');
    return;
  }
  
  // Update UI
  fileNameDisplay.innerHTML = Array.from(files).map(file => `<div>${file.name}</div>`).join('');
  fromFormat.textContent = sourceExtensions[0].toUpperCase();
  uploadArea.classList.add('has-file');
  fileDisplay.classList.add('active');
  conversionSection.classList.add('active');
  
  // Reset format selection
  selectedFormat = null;
  toFormat.textContent = '-';
  document.querySelectorAll('.format-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Filter and show compatible formats
  filterFormatsByFileType(sourceCategory, sourceExtensions[0]);
  
  updateConvertButton();
  hideStatus();
}

/**
 * Filter format buttons based on uploaded file type, allowing cross image-document
 */
function filterFormatsByFileType(category, extension) {
  formatGrid.innerHTML = '';
  
  const filteredFormats = {};
  
  Object.keys(FORMATS).forEach(format => {
    const formatData = FORMATS[format];
    
    if (formatData.category === 'header') {
      filteredFormats[format] = formatData;
    } else {
      let include = false;
      if (formatData.category === category && format !== extension) {
        include = true;
      } else if (category === 'image' && (formatData.category === 'document' && format === 'pdf')) {
        include = true;
      } else if (category === 'document' && formatData.category === 'image') {
        include = true;
      } else if (category === 'audio' || category === 'video') {
        if (formatData.category === category && format !== extension) {
          include = true;
        }
      }
      if (include) {
        filteredFormats[format] = formatData;
      }
    }
  });
  
  // Populate with filtered formats, including relevant headers
  let currentHeader = null;
  Object.keys(filteredFormats).forEach(format => {
    const formatData = filteredFormats[format];
    
    if (formatData.category === 'header') {
      currentHeader = format;
      const header = document.createElement('div');
      header.className = 'format-header';
      header.textContent = formatData.name;
      formatGrid.appendChild(header);
    } else {
      // Only add if header is present or cross-category
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'format-btn';
      btn.dataset.format = format;
      btn.textContent = formatData.name;
      
      btn.addEventListener('click', () => selectFormat(format, btn));
      
      formatGrid.appendChild(btn);
    }
  });
  
  if (Object.keys(filteredFormats).filter(f => FORMATS[f].category !== 'header').length === 0) {
    const message = document.createElement('div');
    message.className = 'no-formats-message';
    message.textContent = 'No compatible conversion formats available for this file type.';
    formatGrid.appendChild(message);
  }
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
  if (selectedFiles && selectedFormat) {
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
  selectedFiles = null;
  selectedFormat = null;
  sourceExtensions = null;
  sourceCategory = null;
  
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
  
  if (!selectedFiles || selectedFiles.length === 0 || !selectedFormat) {
    showStatus('Please select files and target format.', 'error');
    return;
  }
  
  // Disable convert button during conversion
  convertBtn.disabled = true;
  convertBtn.textContent = 'Converting...';
  
  // Show progress
  progressContainer.classList.add('active');
  progressBar.style.width = '0%';
  progressText.textContent = 'Uploading files...';
  hideStatus();
  
  try {
    // Create form data
    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => formData.append('files', file));
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
    
    // Wait for either processing animation or actual response
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
    
    // Determine filename from Content-Disposition or default
    let filename = selectedFiles.length > 1 ? 'converted_files.zip' : `${selectedFiles[0].name.split('.').slice(0, -1).join('.')}.${selectedFormat}`;
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+?)"?$/);
      if (match) filename = match[1];
    }
    
    a.download = filename;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Show success message
    setTimeout(() => {
      progressContainer.classList.remove('active');
      showStatus('✓ Success! Your files have been converted and downloaded. Files are automatically deleted from our servers.', 'success');
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
