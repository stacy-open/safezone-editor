document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const platformChips = document.getElementById('platform-chips');
    const formatSelect = document.getElementById('format-select');
    const imageUpload = document.getElementById('image-upload');
    const userImage = document.getElementById('user-image');
    const safezoneOverlay = document.getElementById('safezone-overlay');
    const imageFrame = document.getElementById('image-frame');
    const resetButton = document.getElementById('reset-button');
    const initialPlaceholder = document.getElementById('initial-placeholder');
    const fileStatusText = document.getElementById('file-status');
    
    // Internal State
    let currentPlatform = null;
    let currentFormat = null;
    let imageLoaded = false;

    // ** 1. DEFINE OVERLAY MAPPING (UNCHANGED) **
    const OVERLAYS = {
        'meta': { 
            'post-1x1': { file: 'meta_feed_1x1.png', ratio: '1/1' },
            'post-4x5': { file: 'meta_feed_4x5.png', ratio: '4/5' },
            'reel-9x16': { file: 'meta_reels_9x16.png', ratio: '9/16' },
            'story-9x16': { file: 'meta_story_9x16.png', ratio: '9/16' },
        },
        'tiktok': { 
            'feed-9x16': { file: 'tiktok_feed_9x16.png', ratio: '9/16' },
        },
        'youtube': { 
            'feed-1x1': { file: 'yt_feed_1x1.png', ratio: '1/1' },
            'in-stream-16x9': { file: 'yt_instream_16x9.png', ratio: '16/9' },
            'shorts-9x16': { file: 'yt_shorts_9x16.png', ratio: '9/16' },
        },
    };

    // ** 2. DEFINE USER-FRIENDLY NAMES (UNCHANGED) **
    const FORMAT_NAMES = {
        'post-1x1': '1x1 Feed Post',
        'post-4x5': '4x5 Feed Post',
        'reel-9x16': '9x16 Reel',
        'story-9x16': '9x16 Story',
        'feed-9x16': '9x16 Feed',
        'feed-1x1': '1x1 Post',
        'in-stream-16x9': '16x9 In-Stream',
        'shorts-9x16': '9x16 Short',
    };

    // --- Core Functions ---

    function updateFileStatus(fileName = null) {
        if (fileName && fileName !== 'No file selected.') {
            fileStatusText.textContent = fileName;
            fileStatusText.style.color = 'var(--brand-primary)';
        } else {
            fileStatusText.textContent = 'No file selected.';
            fileStatusText.style.color = 'var(--color-text-muted)';
        }
    }

    /**
     * Clears all selections, uploaded data, and returns the UI to its initial state.
     */
    function resetEditor() {
        // 1. Reset Internal State
        currentPlatform = null;
        currentFormat = null;
        imageLoaded = false;
        
        // 2. Clear Image Data & UI
        userImage.src = '#';
        userImage.style.display = 'none';
        safezoneOverlay.style.display = 'none';
        
        // 3. Reset Controls
        document.querySelectorAll('.platform-chip').forEach(chip => chip.classList.remove('selected'));
        formatSelect.innerHTML = '<option value="none">Choose a format...</option>';
        formatSelect.disabled = true;
        imageUpload.value = ''; // Clears the file input field
        updateFileStatus(); // Resets the status text

        // 4. Reset Preview to Placeholder
        imageFrame.style.aspectRatio = '1/1';
        initialPlaceholder.style.display = 'block';
    }

    function updatePreview() {
        if (!imageLoaded) {
            userImage.style.display = 'none';
            safezoneOverlay.style.display = 'none';
            initialPlaceholder.style.display = 'block';
            return;
        }

        if (currentPlatform && currentFormat && currentFormat !== 'none') {
            const overlayData = OVERLAYS[currentPlatform][currentFormat];
            
            imageFrame.style.aspectRatio = overlayData.ratio;
            safezoneOverlay.src = `overlays/${overlayData.file}`;
            
            // Show all elements required for a preview
            safezoneOverlay.style.display = 'block';
            userImage.style.display = 'block';
            initialPlaceholder.style.display = 'none'; 

        } else {
            // Image is loaded, but platform/format is missing or reset
            safezoneOverlay.style.display = 'none';
            userImage.style.display = 'block';
            // Show placeholder to guide user to select a format
            initialPlaceholder.style.display = 'block'; 
        }
    }

    // --- Event Listeners ---

    // Platform Selection (Chip Buttons)
    platformChips.addEventListener('click', (e) => {
        const target = e.target.closest('.platform-chip');
        if (!target) return;
        
        e.preventDefault(); 
        
        const platformKey = target.dataset.platform;
        
        // Update active state on buttons
        document.querySelectorAll('.platform-chip').forEach(chip => chip.classList.remove('selected'));
        target.classList.add('selected');

        currentPlatform = platformKey;
        
        // Clear and populate the format selector
        formatSelect.innerHTML = '<option value="none">Choose a format...</option>';
        formatSelect.value = 'none'; 
        currentFormat = 'none';

        if (platformKey && OVERLAYS[platformKey]) {
            formatSelect.disabled = false;
            for (const formatKey in OVERLAYS[platformKey]) {
                const option = document.createElement('option');
                option.value = formatKey;
                option.textContent = FORMAT_NAMES[formatKey] || formatKey;
                formatSelect.appendChild(option);
            }
        } else {
            formatSelect.disabled = true;
        }
        
        updatePreview();
    });
    
    // Format Selection (Dropdown)
    formatSelect.addEventListener('change', (e) => {
        currentFormat = e.target.value;
        updatePreview();
    });

    // Image Upload
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                userImage.src = event.target.result;
                imageLoaded = true;
                updateFileStatus(file.name);
                updatePreview();
            };
            reader.readAsDataURL(file);
        } else {
            imageLoaded = false;
            userImage.src = '#';
            updateFileStatus();
            updatePreview();
        }
    });
    
    // Reset Button Event Listener
    resetButton.addEventListener('click', resetEditor);

    // Initialize state on page load
    resetEditor();
});
