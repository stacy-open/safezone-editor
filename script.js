document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const platformChips = document.getElementById('platform-chips');
    const formatSelect = document.getElementById('format-select');
    const imageUpload = document.getElementById('image-upload');
    const imageFrame = document.getElementById('image-frame');
    const mediaContainer = document.getElementById('media-container');
    const safezoneOverlay = document.getElementById('safezone-overlay');
    const resetButton = document.getElementById('reset-button');
    const initialPlaceholder = document.getElementById('initial-placeholder');
    const fileStatusText = document.getElementById('file-status');
    
    // Internal State
    let currentPlatform = null;
    let currentFormat = null;
    let mediaLoaded = false;
    let userMediaElement = null; // Reference to the current <img> or <video>

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
     * Creates and inserts the correct media element (img or video).
     */
    function insertMediaElement(mediaUrl, isVideo) {
        // 1. Remove any existing media element
        mediaContainer.innerHTML = '';
        
        // 2. Create the new element
        const tagName = isVideo ? 'video' : 'img';
        const newElement = document.createElement(tagName);
        newElement.src = mediaUrl;
        newElement.className = 'user-media'; // Apply common styling class
        newElement.style.display = 'none';
        
        // 3. Set video-specific attributes
        if (isVideo) {
            // These attributes ensure videos play automatically and loop on mobile devices
            newElement.setAttribute('autoplay', 'true');
            newElement.setAttribute('loop', 'true');
            newElement.setAttribute('muted', 'true');
            newElement.setAttribute('playsinline', 'true'); 
        }

        // 4. Insert into the container
        mediaContainer.appendChild(newElement);
        userMediaElement = newElement;
    }

    /**
     * Clears all selections, uploaded data, and returns the UI to its initial state.
     */
    function resetEditor() {
        // 1. Reset Internal State
        currentPlatform = null;
        currentFormat = null;
        mediaLoaded = false;
        
        // 2. Clear Media Element from DOM
        if (userMediaElement) {
            userMediaElement.remove();
            userMediaElement = null;
        }
        safezoneOverlay.style.display = 'none';
        
        // 3. Reset Controls
        document.querySelectorAll('.platform-chip').forEach(chip => chip.classList.remove('selected'));
        formatSelect.innerHTML = '<option value="none">Choose a format...</option>';
        formatSelect.disabled = true;
        
        imageUpload.value = ''; 
        updateFileStatus(); 

        // 4. Reset Preview to Placeholder
        imageFrame.style.aspectRatio = '1/1';
        initialPlaceholder.style.display = 'block';
    }

    /**
     * Updates the preview based on current state (media, platform, format).
     */
    function updatePreview() {
        // Ensure media element exists before trying to access it
        if (!mediaLoaded || !userMediaElement) {
            safezoneOverlay.style.display = 'none';
            initialPlaceholder.style.display = 'block';
            return;
        }
        
        // Ensure media is paused/played correctly
        if (userMediaElement.tagName === 'VIDEO') {
             // Attempt to play the video (required for some browsers)
             userMediaElement.play().catch(e => console.log("Video playback blocked:", e)); 
        }

        if (currentPlatform && currentFormat && currentFormat !== 'none') {
            // Fully ready: Show media with overlay
            const overlayData = OVERLAYS[currentPlatform][currentFormat];
            
            imageFrame.style.aspectRatio = overlayData.ratio;
            safezoneOverlay.src = `overlays/${overlayData.file}`;
            
            safezoneOverlay.style.display = 'block';
            userMediaElement.style.display = 'block';
            initialPlaceholder.style.display = 'none'; 

        } else {
            // Media is loaded, but platform/format is missing
            safezoneOverlay.style.display = 'none';
            userMediaElement.style.display = 'block'; 
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

    // Media Upload (Handles Image OR Video)
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            const isVideo = file.type.startsWith('video/');
            
            reader.onload = (event) => {
                // Insert the correct media element into the DOM
                insertMediaElement(event.target.result, isVideo);
                mediaLoaded = true;
                updateFileStatus(file.name);
                updatePreview();
            };
            reader.readAsDataURL(file);
        } else {
            resetEditor(); // Use resetEditor for a clean state if file is removed
        }
    });
    
    // Reset Button Event Listener
    resetButton.addEventListener('click', resetEditor);

    // Initialize state on page load
    resetEditor();
});
