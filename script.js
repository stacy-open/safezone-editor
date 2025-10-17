document.addEventListener('DOMContentLoaded', () => {
    // UPDATED: platformSelect is now platformChips
    const platformChips = document.getElementById('platform-chips');
    const formatSelect = document.getElementById('format-select');
    const imageUpload = document.getElementById('image-upload');
    const userImage = document.getElementById('user-image');
    const safezoneOverlay = document.getElementById('safezone-overlay');
    const imageFrame = document.getElementById('image-frame');
    const message = document.getElementById('message');

    // ** 1. DEFINE OVERLAY MAPPING (UNCHANGED) **
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

    let currentPlatform = null;
    let currentFormat = null;
    let imageLoaded = false;

    // Helper function to reset the editor state
    function resetEditor() {
        safezoneOverlay.style.display = 'none';
        userImage.style.display = imageLoaded ? 'block' : 'none';
        imageFrame.style.aspectRatio = '1/1';
        message.textContent = "Please select a platform and format.";
        message.style.display = 'block';
        document.querySelectorAll('.platform-chip').forEach(chip => chip.classList.remove('selected'));
    }

    // --- Event Handlers ---
    
    // 2. Handle Platform Selection (Now handled by click event on the chip container)
    platformChips.addEventListener('click', (e) => {
        const target = e.target.closest('.platform-chip');
        if (!target) return; // Not a chip button
        
        // ** THE CRITICAL FIX: STOP THE BUTTON'S DEFAULT ACTION (e.g., submitting a form) **
        e.preventDefault(); 

        const platformKey = target.dataset.platform;
        
        // 1. Update active state on buttons
        document.querySelectorAll('.platform-chip').forEach(chip => chip.classList.remove('selected'));
        target.classList.add('selected');

        // 2. Set the current platform
        currentPlatform = platformKey;
        
        // 3. Clear and populate the format selector
        formatSelect.innerHTML = '<option value="none">-- Select Format --</option>'; // Reset formats
        
        if (platformKey && OVERLAYS[platformKey]) {
            formatSelect.disabled = false; // <--- This line is now guaranteed to run
            for (const formatKey in OVERLAYS[platformKey]) {
                const option = document.createElement('option');
                option.value = formatKey;
                option.textContent = FORMAT_NAMES[formatKey] || formatKey;
                formatSelect.appendChild(option);
            }
        } else {
            formatSelect.disabled = true;
            currentFormat = null;
            resetEditor();
        }
        
        // Always reset format to none when switching platforms
        formatSelect.value = 'none'; 
        updatePreview();
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

    // 5. Main Preview Update Logic (unchanged)
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
