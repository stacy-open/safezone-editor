document.addEventListener('DOMContentLoaded', () => {
    const platformSelect = document.getElementById('platform-select');
    const formatSelect = document.getElementById('format-select');
    const imageUpload = document.getElementById('image-upload');
    const userImage = document.getElementById('user-image');
    const safezoneOverlay = document.getElementById('safezone-overlay');
    const imageFrame = document.getElementById('image-frame');
    const message = document.getElementById('message');

    // ** 1. DEFINE OVERLAY MAPPING (CRITICAL: CUSTOMIZE FILE NAMES HERE!) **
    const OVERLAYS = {
        'meta': { // Internal Platform Key
            'post-1x1': { file: 'meta_feed_1x1.png', ratio: '1/1' },
            'post-4x5': { file: 'meta_feed_4x5.png', ratio: '4/5' },
            'reel-9x16': { file: 'meta_reels_9x16.png', ratio: '9/16' },
            'story-9x16': { file: 'meta_story_9x16.png', ratio: '9/16' },
        },
        'tiktok': { // Internal Platform Key
            'feed-9x16': { file: 'tiktok_feed_9x16.png', ratio: '9/16' },
        },
        'youtube': { // Internal Platform Key
            'feed-1x1': { file: 'yt_feed_1x1.png', ratio: '1/1' },
            'in-stream-16x9': { file: 'yt_instream_16x9.png', ratio: '16/9' },
            'shorts-9x16': { file: 'yt_shorts_9x16.png', ratio: '9/16' },
        },
    };

    // ** 2. DEFINE USER-FRIENDLY NAMES (For Display in the Dropdown) **
    const FORMAT_NAMES = {
        'post-1x1': '1x1 Meta Post',
        'post-4x5': '4x5 Meta Post',
        'reel-9x16': 'Meta Reel',
        'story-9x16': 'Meta Story',
        'feed-9x16': 'TikTok Post',
        'feed-1x1': 'YouTube Post',
        'in-stream-16x9': 'YouTube In-Stream',
        'shorts-9x16': 'YouTube Short',
    };

    let currentPlatform = null;
    let currentFormat = null;
    let imageLoaded = false;

    // Helper function to reset the editor state (unchanged from original)
    function resetEditor() {
        safezoneOverlay.style.display = 'none';
        userImage.style.display = imageLoaded ? 'block' : 'none';
        imageFrame.style.aspectRatio = '1/1';
        message.textContent = "Please select a platform and format.";
        message.style.display = 'block';
    }

    // --- Event Handlers ---

    // 2. Handle Platform Selection
    platformSelect.addEventListener('change', (e) => {
        currentPlatform = e.target.value;
        formatSelect.innerHTML = '<option value="none">-- Select Format --</option>'; // Reset formats
        
        if (currentPlatform && currentPlatform !== 'none' && OVERLAYS[currentPlatform]) {
            formatSelect.disabled = false;
            // Populate the format dropdown using the user-friendly FORMAT_NAMES
            for (const formatKey in OVERLAYS[currentPlatform]) {
                const option = document.createElement('option');
                option.value = formatKey;
                option.textContent = FORMAT_NAMES[formatKey] || formatKey; // Use user-friendly name, fallback to key
                formatSelect.appendChild(option);
            }
        } else {
            formatSelect.disabled = true;
            currentFormat = null;
            resetEditor();
        }
    });

    // 3. Handle Format Selection (unchanged)
    formatSelect.addEventListener('change', (e) => {
        currentFormat = e.target.value;
        updatePreview();
    });

    // 4. Handle Image Upload (unchanged)
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                userImage.src = event.target.result;
                imageLoaded = true;
                updatePreview();
            };
            reader.readAsDataURL(file);
        } else {
            imageLoaded = false;
            userImage.src = '#';
            resetEditor();
        }
    });

    // 5. Main Preview Update Logic (unchanged logic, but uses new keys)
    function updatePreview() {
        if (!imageLoaded) {
            userImage.style.display = 'none';
            message.textContent = "Upload an image to start editing.";
            return;
        }

        if (currentPlatform && currentFormat && currentFormat !== 'none') {
            const overlayData = OVERLAYS[currentPlatform][currentFormat];
            
            imageFrame.style.aspectRatio = overlayData.ratio;
            safezoneOverlay.src = `overlays/${overlayData.file}`;
            safezoneOverlay.style.display = 'block';
            userImage.style.display = 'block';
            message.style.display = 'none';

        } else {
            resetEditor();
        }
    }
});