// ========================================
// ASO Screenshot Generator - Canvas Engine
// Professional App Store Screenshots
// ========================================

// Storage Manager for IndexedDB (Handles large images & history)
class StorageManager {
    constructor() {
        this.dbName = 'MagicMockupDB';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('projects')) {
                    db.createObjectStore('projects', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('history')) {
                    db.createObjectStore('history', { keyPath: 'id' });
                }
            };
        });
    }

    async saveProject(project) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['projects'], 'readwrite');
            const store = transaction.objectStore('projects');
            const request = store.put({ id: 'active', ...project });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getProject() {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['projects'], 'readonly');
            const store = transaction.objectStore('projects');
            const request = store.get('active');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveHistory(historyItem) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['history'], 'readwrite');
            const store = transaction.objectStore('history');
            const request = store.put(historyItem);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getHistory() {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['history'], 'readonly');
            const store = transaction.objectStore('history');
            const request = store.getAll();
            request.onsuccess = () => {
                const results = request.result;
                // Sort by ID (timestamp) descending
                results.sort((a, b) => b.id - a.id);
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteHistory(id) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['history'], 'readwrite');
            const store = transaction.objectStore('history');
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// ========================================
// Smart Designer (Non-AI) Knowledge Base
// ========================================
const ASO_PRESETS = {
    productivity: {
        name: 'HabitPro',
        tagline: 'Build Habits That Stick',
        taglineSub: 'The smarter, effortless way to organize your daily routine.',
        feature1: 'Visual Streak Tracking',
        feature1Sub: 'Stay motivated with daily streaks and progress charts.',
        feature2: 'Smart Reminders & Widgets',
        feature2Sub: 'Never miss a beat with timely home screen widgets.',
        socialProof: 'Trusted by 100k+ High Achievers',
        socialProofSub: 'Voted #1 productivity companion for focus and clarity.',
        cta: 'Supercharge Your Focus',
        ctaSub: 'Download free today on the App Store.'
    },
    fitness: {
        name: 'ZenFit',
        tagline: 'Transform Your Fitness',
        taglineSub: 'Workouts, nutrition, and daily recovery in one place.',
        feature1: 'Log Every Workout Instantly',
        feature1Sub: 'Effortless logging for gym, running, and home sessions.',
        feature2: 'In-Depth Body Analytics',
        feature2Sub: 'Track heart rate zones, calories burned, and muscle strain.',
        socialProof: 'Over 2 Million Workouts Logged',
        socialProofSub: 'Join thousands crushing their fitness milestones every day.',
        cta: 'Start Your Fitness Journey',
        ctaSub: 'Download free and get fit today.'
    },
    finance: {
        name: 'PocketLedger',
        tagline: 'Master Your Money',
        taglineSub: 'Automated expense tracking, smart budgets, and investments.',
        feature1: 'Real-Time Expense Tracking',
        feature1Sub: 'Categorize every transaction effortlessly with smart sync.',
        feature2: 'Visual Budget Insights',
        feature2Sub: 'Know exactly where your money goes every single month.',
        socialProof: 'Bank-Grade 256-Bit Security',
        socialProofSub: 'Over $50M managed safely by smart savers worldwide.',
        cta: 'Take Control of Your Wealth',
        ctaSub: 'Start free on the App Store.'
    },
    social: {
        name: 'VibeCast',
        tagline: 'Connect With What Matters',
        taglineSub: 'Discover inspiring people and unforgettable moments around you.',
        feature1: 'Instant Live Moments',
        feature1Sub: 'Share real, unfiltered updates with your closest friends.',
        feature2: 'Explore Vibrant Communities',
        feature2Sub: 'Find events, creators, and conversations that inspire you.',
        socialProof: 'Over 500,000 Active Members',
        socialProofSub: 'Where genuine connections and real conversations happen daily.',
        cta: 'Join the Community',
        ctaSub: 'Download free and connect today.'
    },
    ecommerce: {
        name: 'Shoply',
        tagline: 'Shop What You Love',
        taglineSub: 'Curated trending collections delivered right to your doorstep.',
        feature1: '1-Tap Express Checkout',
        feature1Sub: 'Lightning-fast orders with Apple Pay and real-time package tracking.',
        feature2: 'Exclusive Member Drops',
        feature2Sub: 'Unlock secret discounts, early access, and reward points.',
        socialProof: '4.9 ★ Rating on 25k+ Reviews',
        socialProofSub: 'Fast delivery and 100% satisfaction guaranteed.',
        cta: 'Get 20% Off Your First Order',
        ctaSub: 'Download the app and start exploring.'
    },
    education: {
        name: 'BrainQuest',
        tagline: 'Learn Anything, Faster',
        taglineSub: 'Bite-sized interactive lessons engineered for long-term retention.',
        feature1: 'Gamified Daily Challenges',
        feature1Sub: 'Level up your skills with streaks, quizzes, and rewards.',
        feature2: 'Personalized Study Paths',
        feature2Sub: 'Adaptive learning that continuously adjusts to your speed.',
        socialProof: '94% of Learners Report Higher Scores',
        socialProofSub: 'Used and trusted by top students and universities worldwide.',
        cta: 'Unlock Your Full Potential',
        ctaSub: 'Start learning for free today.'
    },
    entertainment: {
        name: 'CineStream',
        tagline: 'Endless Entertainment',
        taglineSub: 'Stream your favorite shows, music, and podcasts in crystal clarity.',
        feature1: 'Ultra HD Offline Downloads',
        feature1Sub: 'Take your favorite movies and shows anywhere, with zero buffering.',
        feature2: 'Tailored Just For You',
        feature2Sub: 'Discover new favorites with smart personalized recommendations.',
        socialProof: 'Over 10 Million Hours Streamed',
        socialProofSub: 'The top-rated streaming companion for film enthusiasts.',
        cta: 'Start Streaming Now',
        ctaSub: 'Download free and watch instantly.'
    },
    utilities: {
        name: 'ToolBox Pro',
        tagline: 'Powerful Tools, Simplified',
        taglineSub: 'The ultimate all-in-one utility companion for everyday tasks.',
        feature1: 'Lightning-Fast Performance',
        feature1Sub: 'Engineered for speed, efficiency, and minimal battery usage.',
        feature2: 'Custom 1-Tap Automation',
        feature2Sub: 'Automate repetitive workflows with simple home screen shortcuts.',
        socialProof: 'Featured as App of the Day',
        socialProofSub: 'Trusted by over 300,000 developers, creators, and pros.',
        cta: 'Streamline Your Daily Workflow',
        ctaSub: 'Available now on the App Store.'
    }
};

const STORY_FLOWS = {
    classic: ['tilted-shadow', 'hero-left', 'minimal-top', 'multi-dynamic', 'centered-bottom'],
    panorama: ['panorama-left', 'panorama-right', 'hero-right', 'spread', 'minimal-top'],
    minimal: ['minimal-top', 'centered-bottom', 'hero-left', 'hero-right', 'big-screen'],
    power: ['multi-dynamic', 'hero-left', 'spread', 'tilted-shadow', 'minimal-top']
};

class ScreenshotGenerator {
    constructor() {
        this.storage = new StorageManager();
        this.canvas = document.getElementById('previewCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Canvas dimensions (iPhone 15 Pro Max)
        this.width = 1290;
        this.height = 2796;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.currentScreen = 1;
        this.screens = this.createDefaultScreens();

        this.settings = {
            layout: 'centered',
            template: 'minimal-top',
            theme: 'light-blue',
            textAlign: 'center',
            bgType: 'solid',
            bgColor1: '#c8e0f4',
            bgColor2: '#a8d0ea',
            textColor: '#1a1a1a',
            fontSize: 48,
            fontWeight: '700',
            deviceFrame: 'iphone15pro',
            deviceScale: 70,
            devicePosition: 0,
            deviceRotation: 0,
            textPosition: 0,
            deviceShadow: 'medium',
            showRating: false,
            rating: '4.8',
            ratingX: 0,
            ratingY: 0,
            showCategory: false,
            categoryLabel: 'Plan',
            categoryX: 0,
            categoryX: 0,
            categoryY: 0,
            appIcon: null
        };

        // Load saved settings
        this.geminiApiKey = localStorage.getItem('gemini_api_key') || '';
        this.geminiModel = localStorage.getItem('gemini_model') || 'gemini-flash-latest';

        // Auto-fix: Migrate legacy models to latest
        if (this.geminiModel === 'gemini-2.0-custom' || this.geminiModel === 'gemini-2.5-flash') {
            this.geminiModel = 'gemini-flash-latest';
            localStorage.setItem('gemini_model', 'gemini-flash-latest');
        }

        this.screenshotImage = null;
        this.handImage = null;
        this.loadHandImage();

        // Load saved API Key
        this.geminiApiKey = localStorage.getItem('gemini_api_key') || '';
        this.aiUploadedImages = [];

        // Global Background State
        this.globalBackground = null;
        this.backgroundMode = 'per-screen'; // 'per-screen' or 'panorama'
        this.globalSettings = {
            blur: 0,
            overlayOpacity: 0
        };

        this.zoomLevel = 100;
        this.init();
    }

    createDefaultScreens() {
        // Each screen has its own settings
        return [
            this.createNewScreen('Feel closer, daily', 'Guided questions that spark real conversations')
        ];
    }

    createNewScreen(headline = 'New headline', subheadline = 'Add your subheadline') {
        return {
            headline: headline,
            subheadline: subheadline,
            appName: '',
            screenshot: null,
            screenshot2: null,
            // Per-screen layout settings
            layout: 'text-top',
            template: 'minimal-top',
            textAlign: 'center',
            bgType: 'solid',
            bgColor1: '#c8e0f4',
            bgColor2: '#a8d0ea',
            textColor: '#1a1a1a',
            fontSize: 48,
            deviceScale: 70,
            textPosition: 0,
            devicePosition: 0,
            deviceRotation: 0
        };
    }

    loadHandImage() {
        // Create hand SVG
        this.handImage = new Image();
        const handSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
      <defs>
        <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f5d0c5"/>
          <stop offset="100%" style="stop-color:#e8b9ab"/>
        </linearGradient>
      </defs>
      <path d="M80 350 Q40 400 50 500 Q60 580 100 600 L300 600 Q340 580 350 500 Q360 400 320 350 L320 200 Q320 180 300 180 L100 180 Q80 180 80 200 Z" fill="url(#skin)"/>
      <path d="M60 380 Q30 400 40 450 Q45 480 60 490" fill="none" stroke="url(#skin)" stroke-width="40" stroke-linecap="round"/>
    </svg>`;
        this.handImage.src = 'data:image/svg+xml,' + encodeURIComponent(handSvg);
    }

    async init() {
        this.bindEvents();
        
        try {
            const saved = await this.storage.getProject();
            if (saved) {
                this.settings = saved.settings || this.settings;
                this.currentScreen = saved.currentScreen || 1;
                
                // Map screens back with images
                this.screens = saved.screens.map(s => {
                    const screen = { ...this.createNewScreen(), ...s };
                    if (s.screenshotSrc) {
                        const img = new Image();
                        img.src = s.screenshotSrc;
                        screen.screenshot = img;
                        img.onload = () => this.render();
                    }
                    if (s.screenshot2Src) {
                        const img = new Image();
                        img.src = s.screenshot2Src;
                        screen.screenshot2 = img;
                        img.onload = () => this.render();
                    }
                    if (s.screenshot3Src) {
                        const img = new Image();
                        img.src = s.screenshot3Src;
                        screen.screenshot3 = img;
                        img.onload = () => this.render();
                    }
                    return screen;
                });

                if (saved.appName) {
                    const appNameInput = document.getElementById('appName');
                    if (appNameInput) appNameInput.value = saved.appName;
                }
            }
        } catch (e) {
            console.warn('Failed to load project from storage:', e);
        }

        this.updateScreenNavButtons();
        this.loadScreenData();
        this.applyZoom(this.zoomLevel);
        this.render();
    }

    bindEvents() {
        // Screenshot upload
        const uploadZone = document.getElementById('uploadZone');
        const screenshotInput = document.getElementById('screenshotInput');

        uploadZone.addEventListener('click', () => screenshotInput.click());
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) this.handleImageUpload(file);
        });
        screenshotInput.addEventListener('change', (e) => {
            if (e.target.files[0]) this.handleImageUpload(e.target.files[0]);
        });

        // Second Screenshot upload
        const uploadZone2 = document.getElementById('uploadZone2');
        const screenshotInput2 = document.getElementById('screenshotInput2');

        uploadZone2.addEventListener('click', () => screenshotInput2.click());
        uploadZone2.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone2.classList.add('dragover');
        });
        uploadZone2.addEventListener('dragleave', () => uploadZone2.classList.remove('dragover'));
        uploadZone2.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone2.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) this.handleSecondImageUpload(file);
        });
        screenshotInput2.addEventListener('change', (e) => {
            if (e.target.files[0]) this.handleSecondImageUpload(e.target.files[0]);
        });

        // Third Screenshot upload (Spread)
        const uploadZone3 = document.getElementById('uploadZone3');
        const screenshotInput3 = document.getElementById('screenshotInput3');

        uploadZone3.addEventListener('click', () => screenshotInput3.click());
        uploadZone3.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone3.classList.add('dragover');
        });
        uploadZone3.addEventListener('dragleave', () => uploadZone3.classList.remove('dragover'));
        uploadZone3.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone3.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) this.handleThirdImageUpload(file);
        });
        screenshotInput3.addEventListener('change', (e) => {
            if (e.target.files[0]) this.handleThirdImageUpload(e.target.files[0]);
        });

        // App Icon Modal Upload (AI Modal)
        const appIconModalZone = document.getElementById('appIconUploadModalZone');
        const appIconModalInput = document.getElementById('appIconInputModal');

        if (appIconModalZone && appIconModalInput) {
            appIconModalZone.addEventListener('click', () => appIconModalInput.click());
            appIconModalZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                appIconModalZone.style.borderColor = '#667eea';
                appIconModalZone.style.background = '#f8faff';
            });
            appIconModalZone.addEventListener('dragleave', () => {
                appIconModalZone.style.borderColor = '#e2e8f0';
                appIconModalZone.style.background = '#f8faff';
            });
            appIconModalZone.addEventListener('drop', (e) => {
                e.preventDefault();
                appIconModalZone.style.borderColor = '#e2e8f0';
                appIconModalZone.style.background = '#f8faff';
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) this.handleAppIconUpload(file);
            });
            appIconModalInput.addEventListener('change', (e) => {
                if (e.target.files[0]) this.handleAppIconUpload(e.target.files[0]);
            });
        }

        // App Icon Modal Upload (Smart Designer Modal)
        const smartIconZone = document.getElementById('smartAppIconUploadZone');
        const smartIconInput = document.getElementById('smartAppIconInput');

        if (smartIconZone && smartIconInput) {
            smartIconZone.addEventListener('click', () => smartIconInput.click());
            smartIconZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                smartIconZone.style.borderColor = '#10b981';
                smartIconZone.style.background = 'rgba(16, 185, 129, 0.08)';
            });
            smartIconZone.addEventListener('dragleave', () => {
                smartIconZone.style.borderColor = '#52525b';
                smartIconZone.style.background = '#27272a';
            });
            smartIconZone.addEventListener('drop', (e) => {
                e.preventDefault();
                smartIconZone.style.borderColor = '#52525b';
                smartIconZone.style.background = '#27272a';
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) this.handleAppIconUpload(file);
            });
            smartIconInput.addEventListener('change', (e) => {
                if (e.target.files[0]) this.handleAppIconUpload(e.target.files[0]);
            });
        }

        // Bulk Screenshots Upload (AI Modal)
        const bulkZone = document.getElementById('bulkScreenshotsZone');
        const bulkInput = document.getElementById('bulkScreenshotsInput');

        if (bulkZone && bulkInput) {
            bulkZone.addEventListener('click', () => bulkInput.click());
            bulkInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) this.handleBulkScreenshots(e.target.files);
            });
            bulkZone.addEventListener('dragover', (e) => { e.preventDefault(); bulkZone.style.background = '#f8faff'; });
            bulkZone.addEventListener('dragleave', () => { bulkZone.style.background = '#27272a'; });
            bulkZone.addEventListener('drop', (e) => {
                e.preventDefault();
                bulkZone.style.background = '#27272a';
                if (e.dataTransfer.files.length > 0) this.handleBulkScreenshots(e.dataTransfer.files);
            });
        }

        // Bulk Screenshots Upload (Smart Designer Modal)
        const smartBulkZone = document.getElementById('smartBulkScreenshotsZone');
        const smartBulkInput = document.getElementById('smartBulkScreenshotsInput');

        if (smartBulkZone && smartBulkInput) {
            smartBulkZone.addEventListener('click', () => smartBulkInput.click());
            smartBulkInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) this.handleBulkScreenshots(e.target.files);
            });
            smartBulkZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                smartBulkZone.style.borderColor = '#10b981';
                smartBulkZone.style.background = 'rgba(16, 185, 129, 0.08)';
            });
            smartBulkZone.addEventListener('dragleave', () => {
                smartBulkZone.style.borderColor = '#52525b';
                smartBulkZone.style.background = '#27272a';
            });
            smartBulkZone.addEventListener('drop', (e) => {
                e.preventDefault();
                smartBulkZone.style.borderColor = '#52525b';
                smartBulkZone.style.background = '#27272a';
                if (e.dataTransfer.files.length > 0) this.handleBulkScreenshots(e.dataTransfer.files);
            });
        }

        // Text inputs
        document.getElementById('headline').addEventListener('input', (e) => {
            this.screens[this.currentScreen - 1].headline = e.target.value;
            this.render();
            this.saveProject();
        });

        document.getElementById('subheadline').addEventListener('input', (e) => {
            this.screens[this.currentScreen - 1].subheadline = e.target.value;
            this.render();
            this.saveProject();
        });

        document.getElementById('appName').addEventListener('input', (e) => {
            this.screens[this.currentScreen - 1].appName = e.target.value;
            this.render();
        });

        // Text alignment
        document.querySelectorAll('.align-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update BOTH global and current screen settings
                this.settings.textAlign = btn.dataset.align;
                this.screens[this.currentScreen - 1].textAlign = btn.dataset.align;

                this.render();
                this.saveProject();
            });
        });


        // Initialize Global Background Events
        this.bindGlobalBackgroundEvents();

        // Template Selection
        document.querySelectorAll('.template-card-layout').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.template-card-layout').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                const screen = this.screens[this.currentScreen - 1];
                screen.template = card.dataset.template;
                this.applyTemplateToScreen(card.dataset.template, screen);
                this.loadScreenData(); // Update UI (show/hide screen 2 upload)
                this.render();
                this.renderAllScreens(); // Sync Preview!
                this.saveProject();
            });
        });

        // Color themes - saves to current screen
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.applyThemeToScreen(btn.dataset.theme);
                this.render();
            });
        });

        // Background type - saves to current screen
        document.querySelectorAll('.bg-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.bg-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const screen = this.screens[this.currentScreen - 1];
                screen.bgType = btn.dataset.bgtype;
                this.render();
                this.saveProject();
            });
        });

        // Color pickers - save to current screen
        document.getElementById('bgColor1').addEventListener('input', (e) => {
            const screen = this.screens[this.currentScreen - 1];
            screen.bgColor1 = e.target.value;
            this.render();
            this.saveProject();
        });
        document.getElementById('bgColor2').addEventListener('input', (e) => {
            const screen = this.screens[this.currentScreen - 1];
            screen.bgColor2 = e.target.value;
            this.render();
            this.saveProject();
        });
        document.getElementById('textColor').addEventListener('input', (e) => {
            const screen = this.screens[this.currentScreen - 1];
            screen.textColor = e.target.value;
            this.render();
            this.saveProject();
        });

        // Preset colors - save to current screen
        document.querySelectorAll('.preset-color:not(.magic-theme-btn)').forEach(btn => {
            btn.addEventListener('click', () => {
                const colors = btn.dataset.colors.split(',');
                const screen = this.screens[this.currentScreen - 1];
                screen.bgColor1 = colors[0];
                screen.bgColor2 = colors[1];
                document.getElementById('bgColor1').value = colors[0];
                document.getElementById('bgColor2').value = colors[1];
                this.render();
            });
        });

        // Magic Theme
        document.getElementById('magicThemeBtn').addEventListener('click', () => {
            this.applyMagicTheme();
        });

        // Font size - save to current screen
        document.getElementById('fontSize').addEventListener('input', (e) => {
            const screen = this.screens[this.currentScreen - 1];
            screen.fontSize = parseInt(e.target.value);
            document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
            this.render();
            this.saveProject();
        });

        // Font weight - stays global for simplicity
        document.getElementById('fontWeight').addEventListener('change', (e) => {
            this.settings.fontWeight = e.target.value;
            this.render();
        });

        // Device settings - save to current screen
        document.getElementById('deviceFrame').addEventListener('change', (e) => {
            this.settings.deviceFrame = e.target.value;
            this.render();
        });
        document.getElementById('deviceScale').addEventListener('input', (e) => {
            const screen = this.screens[this.currentScreen - 1];
            screen.deviceScale = parseInt(e.target.value);
            this.render();
            this.saveProject();
        });
        document.getElementById('devicePosition').addEventListener('input', (e) => {
            const screen = this.screens[this.currentScreen - 1];
            screen.devicePosition = parseInt(e.target.value);
            this.render();
            this.saveProject();
        });

        document.getElementById('deviceRotation').addEventListener('input', (e) => {
            const screen = this.screens[this.currentScreen - 1];
            screen.deviceRotation = parseInt(e.target.value);
            this.render();
            this.saveProject();
        });
        document.getElementById('textPosition').addEventListener('input', (e) => {
            const screen = this.screens[this.currentScreen - 1];
            screen.textPosition = parseInt(e.target.value);
            this.render();
            this.saveProject();
        });
        document.getElementById('deviceShadow').addEventListener('change', (e) => {
            this.settings.deviceShadow = e.target.value;
            this.render();
        });

        // Extras
        document.getElementById('showAppRating').addEventListener('change', (e) => {
            this.settings.showRating = e.target.checked;
            document.getElementById('ratingGroup').style.display = e.target.checked ? 'block' : 'none';
            this.render();
        });
        document.getElementById('appRating').addEventListener('input', (e) => {
            this.settings.rating = e.target.value;
            this.render();
        });
        document.getElementById('ratingX').addEventListener('input', (e) => {
            this.settings.ratingX = parseInt(e.target.value);
            this.render();
        });
        document.getElementById('ratingY').addEventListener('input', (e) => {
            this.settings.ratingY = parseInt(e.target.value);
            this.render();
        });
        document.getElementById('showCategoryPill').addEventListener('change', (e) => {
            this.settings.showCategory = e.target.checked;
            document.getElementById('categoryGroup').style.display = e.target.checked ? 'block' : 'none';
            this.render();
        });
        document.getElementById('categoryLabel').addEventListener('input', (e) => {
            this.settings.categoryLabel = e.target.value;
            this.render();
        });
        document.getElementById('categoryX').addEventListener('input', (e) => {
            this.settings.categoryX = parseInt(e.target.value);
            this.render();
        });
        document.getElementById('categoryY').addEventListener('input', (e) => {
            this.settings.categoryY = parseInt(e.target.value);
            this.render();
        });

        // Screen navigation - update button states
        this.updateScreenNavButtons();

        document.querySelectorAll('.screen-nav__btn:not(.screen-nav__btn--add)').forEach(btn => {
            btn.addEventListener('click', () => {
                const screenNum = parseInt(btn.dataset.screen);
                if (screenNum > this.screens.length) return; // Don't switch to non-existent screen

                document.querySelectorAll('.screen-nav__btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentScreen = screenNum;
                this.loadScreenData();
                this.render();
            });
        });

        // Add Screen button
        document.querySelector('.screen-nav__btn--add').addEventListener('click', () => {
            if (this.screens.length >= 10) {
                alert('Maximum 10 screens allowed');
                return;
            }

            // Create new screen with default settings
            this.screens.push(this.createNewScreen());

            // Switch to new screen
            this.currentScreen = this.screens.length;
            this.updateScreenNavButtons();
            this.loadScreenData();
            this.render();
        });

        // Zoom
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.zoomLevel = Math.min(200, this.zoomLevel + 10);
            this.applyZoom(this.zoomLevel);
        });
        document.getElementById('zoomOut').addEventListener('click', () => {
            this.zoomLevel = Math.max(20, this.zoomLevel - 10);
            this.applyZoom(this.zoomLevel);
        });

        // Export
        // Generic Modal Close Logic (Backdrop click)
        // Hardened: Explicitly attach to known modals to prevent ghost clicks
        const aiBackdrop = document.getElementById('aiModal').querySelector('.modal__backdrop');
        /* DIAGNOSTIC: Commented out to test if this is causing the flash
        aiBackdrop.addEventListener('click', (e) => {
            if (e.target === aiBackdrop) {
                e.stopPropagation();
                document.getElementById('aiModal').classList.remove('active');
            }
        });
        */

        const exportBackdrop = document.getElementById('exportModal').querySelector('.modal__backdrop');
        exportBackdrop.addEventListener('click', (e) => {
            if (e.target === exportBackdrop) {
                e.stopPropagation();
                document.getElementById('exportModal').classList.remove('active');
            }
        });

        // Export Buttons
        document.getElementById('exportBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Delay opening to prevent ghost clicks on backdrop
            setTimeout(() => {
                document.getElementById('exportModal').classList.add('active');
            }, 100);
        });
        document.getElementById('cancelExport').addEventListener('click', () => {
            document.getElementById('exportModal').classList.remove('active');
        });
        document.getElementById('downloadExport').addEventListener('click', () => {
            this.exportScreenshot();
        });

        // New project
        // New project
        // Hardened: Uses Custom Modal instead of native confirm() to prevent flashing
        document.getElementById('newProjectBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setTimeout(() => {
                document.getElementById('newProjectModal').classList.add('active');
            }, 100);
        });

        document.getElementById('cancelNewProject').addEventListener('click', () => {
            document.getElementById('newProjectModal').classList.remove('active');
        });

        document.getElementById('confirmNewProject').addEventListener('click', () => {
            localStorage.removeItem('asoProject');
            location.reload();
        });

        // Hardened Backdrop for New Project Modal
        const newProjectBackdrop = document.getElementById('newProjectModal').querySelector('.modal__backdrop');
        newProjectBackdrop.addEventListener('click', (e) => {
            if (e.target === newProjectBackdrop) {
                e.stopPropagation();
                document.getElementById('newProjectModal').classList.remove('active');
            }
        });

        // View toggle (Edit vs App Store Preview)
        document.getElementById('editViewBtn').addEventListener('click', () => {
            document.getElementById('editViewBtn').classList.add('active');
            document.getElementById('previewViewBtn').classList.remove('active');
            document.getElementById('editView').style.display = 'flex';
            document.getElementById('appstorePreview').style.display = 'none';
        });

        document.getElementById('previewViewBtn').addEventListener('click', () => {
            document.getElementById('previewViewBtn').classList.add('active');
            document.getElementById('editViewBtn').classList.remove('active');
            document.getElementById('editView').style.display = 'none';
            document.getElementById('editView').style.display = 'none';
            document.getElementById('appstorePreview').style.display = 'flex';
            this.renderAllScreens();
        });

        // Horizontal Scroll for Preview
        const scrollContainer = document.querySelector('.appstore-preview__scroll');
        if (scrollContainer) {
            scrollContainer.addEventListener('wheel', (e) => {
                if (e.deltaY !== 0) {
                    e.preventDefault();
                    scrollContainer.scrollLeft += e.deltaY;
                }
            });
        }

        const scrollLeftBtn = document.getElementById('scrollPreviewLeft');
        const scrollRightBtn = document.getElementById('scrollPreviewRight');

        if (scrollLeftBtn && scrollRightBtn && scrollContainer) {
            scrollLeftBtn.addEventListener('click', () => {
                scrollContainer.scrollBy({ left: -400, behavior: 'smooth' });
            });
            scrollRightBtn.addEventListener('click', () => {
                scrollContainer.scrollBy({ left: 400, behavior: 'smooth' });
            });
        }

        // Profile Settings Modal
        const profileBtn = document.querySelector('.profile-settings-btn');
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('geminiApiKey').value = localStorage.getItem('gemini_api_key') || '';
                document.getElementById('geminiModelId').value = localStorage.getItem('gemini_model') || 'gemini-flash-latest';
                document.getElementById('profileSettingsModal').classList.add('active');
            });
        }

        document.getElementById('closeProfileSettings').addEventListener('click', () => {
            document.getElementById('profileSettingsModal').classList.remove('active');
        });

        document.getElementById('saveProfileSettings').addEventListener('click', (e) => {
            const btn = e.target;
            const newKey = document.getElementById('geminiApiKey').value.trim();
            const newModel = document.getElementById('geminiModelId').value.trim() || 'gemini-flash-latest';

            if (newKey) {
                this.geminiApiKey = newKey;
                this.geminiModel = newModel;

                localStorage.setItem('gemini_api_key', newKey);
                localStorage.setItem('gemini_model', newModel);

                // Show toast
                this.showToast('Settings saved successfully!');

                // Close modal after a moment
                setTimeout(() => {
                    document.getElementById('profileSettingsModal').classList.remove('active');
                }, 1000);
            } else {
                this.showToast('Please enter a valid API Key.', 'error');
            }
        });

        // AI Designer
        document.getElementById('aiDesignerBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Delay opening to prevent ghost clicks on backdrop
            setTimeout(() => {
                // API Key is now in Profile Settings, so we don't set it here anymore
                document.getElementById('aiModal').classList.add('active');
            }, 100);
        });
        document.getElementById('closeAiModal').addEventListener('click', () => {
            document.getElementById('aiModal').classList.remove('active');
        });
        document.getElementById('generateMagicConfigBtn').addEventListener('click', () => {
            if (!this.geminiApiKey) {
                this.showToast('Please configure your Gemini API Key first.', 'error');

                // Auto open settings for convenience
                document.getElementById('aiModal').classList.remove('active');
                setTimeout(() => {
                    document.getElementById('profileSettingsModal').classList.add('active');
                    document.getElementById('geminiApiKey').value = localStorage.getItem('gemini_api_key') || '';
                    document.getElementById('geminiModelId').value = localStorage.getItem('gemini_model') || 'gemini-flash-latest';
                    document.getElementById('geminiApiKey').focus();
                }, 300);
                return;
            }
            this.generateMagicConfig();
        });

        // Smart Designer (Non-AI)
        const smartDesignerBtn = document.getElementById('smartDesignerBtn');
        if (smartDesignerBtn) {
            smartDesignerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // If app icon is already set, ensure thumbnail shows in Smart Modal
                if (this.settings.appIcon) {
                    const smartZone = document.getElementById('smartAppIconUploadZone');
                    if (smartZone && !smartZone.querySelector('img')) {
                        smartZone.innerHTML = `<img src="${this.settings.appIcon.src}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;
                    }
                }

                // If bulk screenshots are already loaded, populate preview container
                const smartPreviewContainer = document.getElementById('smartBulkPreviewContainer');
                if (smartPreviewContainer && smartPreviewContainer.children.length === 0 && this.aiUploadedImages.length > 0) {
                    this.aiUploadedImages.forEach(img => {
                        const thumb = document.createElement('div');
                        thumb.style.minWidth = '40px';
                        thumb.style.height = '60px';
                        thumb.style.borderRadius = '4px';
                        thumb.style.backgroundImage = `url(${img.src})`;
                        thumb.style.backgroundSize = 'cover';
                        thumb.style.border = '1px solid #10b981';
                        smartPreviewContainer.appendChild(thumb);
                    });
                }

                // Update category placeholders
                const categorySelect = document.getElementById('smartAppCategory');
                if (categorySelect) {
                    this.updateSmartPlaceholders(categorySelect.value);
                }

                setTimeout(() => {
                    document.getElementById('smartModal')?.classList.add('active');
                }, 100);
            });
        }

        document.getElementById('closeSmartModal')?.addEventListener('click', () => {
            document.getElementById('smartModal')?.classList.remove('active');
        });

        document.getElementById('generateSmartConfigBtn')?.addEventListener('click', () => {
            this.generateSmartConfig();
        });

        document.getElementById('smartAppCategory')?.addEventListener('change', (e) => {
            this.updateSmartPlaceholders(e.target.value);
        });

        const smartBackdrop = document.getElementById('smartModal')?.querySelector('.modal__backdrop');
        if (smartBackdrop) {
            smartBackdrop.addEventListener('click', (e) => {
                if (e.target === smartBackdrop) {
                    e.stopPropagation();
                    document.getElementById('smartModal')?.classList.remove('active');
                }
            });
        }

        // URL Auto-Import Handlers
        document.getElementById('aiFetchUrlBtn')?.addEventListener('click', () => {
            this.handleUrlImport('ai');
        });
        document.getElementById('aiAppUrl')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleUrlImport('ai');
            }
        });

        document.getElementById('smartFetchUrlBtn')?.addEventListener('click', () => {
            this.handleUrlImport('smart');
        });
        document.getElementById('smartAppUrl')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleUrlImport('smart');
            }
        });



        // App Store preview item click - switch to that screen
        // App Store preview interactions (click to edit, move left/right)
        document.querySelectorAll('.appstore-preview__item').forEach(item => {
            item.addEventListener('click', (e) => {
                const screenNum = parseInt(item.dataset.screen);
                const index = screenNum - 1;

                // Handle Move Buttons
                const moveLeftBtn = e.target.closest('.move-left');
                const moveRightBtn = e.target.closest('.move-right');

                if (moveLeftBtn) {
                    e.stopPropagation();
                    this.moveScreen(index, -1);
                    return;
                }
                if (moveRightBtn) {
                    e.stopPropagation();
                    this.moveScreen(index, 1);
                    return;
                }

                this.currentScreen = screenNum;

                // Update nav buttons
                document.querySelectorAll('.screen-nav__btn').forEach(b => b.classList.remove('active'));
                document.querySelector(`.screen-nav__btn[data-screen="${screenNum}"]`)?.classList.add('active');

                // Update preview items
                document.querySelectorAll('.appstore-preview__item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Switch to edit view
                document.getElementById('editViewBtn').click();
                this.loadScreenData();
                this.render();
            });
        });

        // History Modal Events
        const viewHistoryBtn = document.getElementById('viewHistoryBtn');
        if (viewHistoryBtn) {
            viewHistoryBtn.addEventListener('click', () => {
                this.renderHistory();
                document.getElementById('historyModal').classList.add('active');
            });
        }
        const closeHistoryBtn = document.getElementById('closeHistoryModal');
        if (closeHistoryBtn) {
            closeHistoryBtn.addEventListener('click', () => {
                document.getElementById('historyModal').classList.remove('active');
            });
        }
        const historyModal = document.getElementById('historyModal');
        if (historyModal) {
            const historyBackdrop = historyModal.querySelector('.modal__backdrop');
            if (historyBackdrop) {
                historyBackdrop.addEventListener('click', () => {
                    historyModal.classList.remove('active');
                });
            }

            // Events handled directly during renderHistory()
        }
    }

    bindGlobalBackgroundEvents() {
        // Toggle Buttons
        const perScreenBtn = document.getElementById('bgModePerScreen');
        const globalBtn = document.getElementById('bgModeGlobal');
        const perScreenControls = document.getElementById('perScreenBgControls');
        const globalControls = document.getElementById('globalBgControls');

        const updateMode = (mode) => {
            this.backgroundMode = mode;
            if (mode === 'panorama') {
                perScreenBtn.classList.remove('active');
                globalBtn.classList.add('active');
                perScreenControls.style.display = 'none';
                globalControls.style.display = 'block';
            } else {
                perScreenBtn.classList.add('active');
                globalBtn.classList.remove('active');
                perScreenControls.style.display = 'block';
                globalControls.style.display = 'none';
            }
            this.render();
            this.renderAllScreens();
        };

        perScreenBtn.addEventListener('click', () => updateMode('per-screen'));
        globalBtn.addEventListener('click', () => updateMode('panorama'));

        // globalBgUploadZone
        const uploadZone = document.getElementById('globalBgUploadZone');
        const fileInput = document.getElementById('globalBgInput');

        uploadZone.addEventListener('click', () => fileInput.click());
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#fff';
        });
        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#52525b';
        });
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#52525b';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleGlobalBgUpload(file);
            }
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleGlobalBgUpload(file);
            }
        });

        // Sliders
        const blurSlider = document.getElementById('globalBgBlur');
        blurSlider.addEventListener('input', (e) => {
            this.globalSettings.blur = parseInt(e.target.value);
            this.render();
            this.renderAllScreens();
        });

        const overlaySlider = document.getElementById('globalBgOverlay');
        overlaySlider.addEventListener('input', (e) => {
            this.globalSettings.overlayOpacity = parseInt(e.target.value);
            this.render();
            this.renderAllScreens();
        });
    }

    handleGlobalBgUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.globalBackground = img;

                // Update Upload Zone
                const uploadZone = document.getElementById('globalBgUploadZone');
                uploadZone.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">`;
                uploadZone.style.borderStyle = 'solid';

                this.render();
                this.renderAllScreens();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.screens[this.currentScreen - 1].screenshot = img;
                this.screenshotImage = img;

                const uploadZone = document.getElementById('uploadZone');
                uploadZone.innerHTML = `<img src="${e.target.result}" alt="Screenshot">`;
                uploadZone.classList.add('has-image');

                // Reset file input so same file can be uploaded again
                document.getElementById('screenshotInput').value = '';

                this.render();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    handleSecondImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.screens[this.currentScreen - 1].screenshot2 = img;

                const uploadZone2 = document.getElementById('uploadZone2');
                uploadZone2.innerHTML = `<img src="${e.target.result}" alt="Screenshot 2">`;
                uploadZone2.classList.add('has-image');

                // Reset file input
                document.getElementById('screenshotInput2').value = '';

                this.render();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    handleThirdImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.screens[this.currentScreen - 1].screenshot3 = img;

                const uploadZone3 = document.getElementById('uploadZone3');
                uploadZone3.innerHTML = `<img src="${e.target.result}" alt="Screenshot 3">`;
                uploadZone3.classList.add('has-image');

                document.getElementById('screenshotInput3').value = '';
                this.render();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    handleAppIconUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.settings.appIcon = img;

                // Update UI (AI Modal)
                const modalZone = document.getElementById('appIconUploadModalZone');
                if (modalZone) modalZone.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;

                // Update UI (Smart Designer Modal)
                const smartZone = document.getElementById('smartAppIconUploadZone');
                if (smartZone) smartZone.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;

                // Clear inputs
                if (document.getElementById('appIconInputModal')) document.getElementById('appIconInputModal').value = '';
                if (document.getElementById('smartAppIconInput')) document.getElementById('smartAppIconInput').value = '';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    handleBulkScreenshots(files) {
        const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
        this.aiUploadedImages = new Array(fileArray.length); // Pre-allocate to maintain order
        const previewContainer = document.getElementById('bulkPreviewContainer');
        const smartPreviewContainer = document.getElementById('smartBulkPreviewContainer');

        if (previewContainer) previewContainer.innerHTML = '';
        if (smartPreviewContainer) smartPreviewContainer.innerHTML = '';

        // Show a loading indicator in the preview area
        const loader = document.createElement('div');
        loader.id = 'bulkLoader';
        loader.textContent = `Loading ${fileArray.length} images...`;
        loader.style.fontSize = '12px';
        loader.style.color = '#3b82f6';
        previewContainer.appendChild(loader);

        let loadedCount = 0;
        fileArray.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.aiUploadedImages[index] = img; // Insert at specific index
                    loadedCount++;
                    
                    if (loadedCount === fileArray.length) {
                        const loader = document.getElementById('bulkLoader');
                        if (loader) loader.textContent = 'Ready to generate!';
                    }
                };
                img.src = e.target.result;

                // Create thumbnail for AI Modal
                if (previewContainer) {
                    const thumb = document.createElement('div');
                    thumb.style.minWidth = '40px';
                    thumb.style.height = '60px';
                    thumb.style.borderRadius = '4px';
                    thumb.style.backgroundImage = `url(${e.target.result})`;
                    thumb.style.backgroundSize = 'cover';
                    thumb.style.border = '1px solid #52525b';
                    previewContainer.appendChild(thumb);
                }

                // Create thumbnail for Smart Designer Modal
                if (smartPreviewContainer) {
                    const thumb2 = document.createElement('div');
                    thumb2.style.minWidth = '40px';
                    thumb2.style.height = '60px';
                    thumb2.style.borderRadius = '4px';
                    thumb2.style.backgroundImage = `url(${e.target.result})`;
                    thumb2.style.backgroundSize = 'cover';
                    thumb2.style.border = '1px solid #10b981';
                    smartPreviewContainer.appendChild(thumb2);
                }
            };
            reader.readAsDataURL(file);
        });
    }

    moveScreen(index, direction) {
        // bounds check
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= this.screens.length) return;

        // Swap screens
        const temp = this.screens[index];
        this.screens[index] = this.screens[newIndex];
        this.screens[newIndex] = temp;

        // Update current screen pointer if needed
        // Since we are moving screens, if the currently selected screen moved, we should follow it.
        // Currently selected is this.currentScreen (1-based)
        const currentIdx = this.currentScreen - 1;

        if (currentIdx === index) {
            this.currentScreen = newIndex + 1;
        } else if (currentIdx === newIndex) {
            this.currentScreen = index + 1;
        }

        // Re-render everything
        this.renderAllScreens();

        // Also update the nav buttons to reflect active state
        this.updateScreenNavButtons();

        // If we are currently editing the screen that moved or the one swapped, update the edit view if active
        // Simplest is to just re-load data for current screen
        this.loadScreenData();
        this.render();
    }

    // Update screen nav button states based on number of screens
    updateScreenNavButtons() {
        const buttons = document.querySelectorAll('.screen-nav__btn:not(.screen-nav__btn--add)');
        buttons.forEach((btn, index) => {
            const screenNum = index + 1;
            if (screenNum <= this.screens.length) {
                btn.style.display = 'flex';
                btn.classList.toggle('active', screenNum === this.currentScreen);
            } else {
                btn.style.display = 'none';
                btn.classList.remove('active');
            }
        });

        // Update preview items as well
        const previewItems = document.querySelectorAll('.appstore-preview__item');
        previewItems.forEach((item, index) => {
            const screenNum = index + 1;
            if (screenNum <= this.screens.length) {
                item.style.display = 'flex';
                item.classList.toggle('active', screenNum === this.currentScreen);
            } else {
                item.style.display = 'none';
            }
        });

        // Hide add button if at max screens
        const addBtn = document.querySelector('.screen-nav__btn--add');
        addBtn.style.display = this.screens.length >= 10 ? 'none' : 'flex';
    }

    loadScreenData() {
        const screen = this.screens[this.currentScreen - 1];
        if (!screen) return;

        // Text content
        document.getElementById('headline').value = screen.headline;
        document.getElementById('subheadline').value = screen.subheadline;
        document.getElementById('appName').value = screen.appName || '';

        // Load per-screen settings to UI
        if (screen.bgColor1) {
            document.getElementById('bgColor1').value = screen.bgColor1;
        }
        if (screen.bgColor2) {
            document.getElementById('bgColor2').value = screen.bgColor2;
        }
        if (screen.textColor) {
            document.getElementById('textColor').value = screen.textColor;
        }

        // Always update fontSize - use default 48 if not set
        const fontSize = screen.fontSize || 48;
        document.getElementById('fontSize').value = fontSize;
        document.getElementById('fontSizeValue').textContent = fontSize + 'px';

        // Always update deviceScale - use default 70 if not set
        const deviceScale = screen.deviceScale || 70;
        document.getElementById('deviceScale').value = deviceScale;

        if (screen.devicePosition !== undefined) {
            document.getElementById('devicePosition').value = screen.devicePosition;
        } else {
            // Reset to global default if distinct value not set
            document.getElementById('devicePosition').value = this.settings.devicePosition || 0;
        }

        if (screen.textPosition !== undefined) {
            document.getElementById('textPosition').value = screen.textPosition;
        } else {
            // Reset to global default
            document.getElementById('textPosition').value = this.settings.textPosition || 0;
        }

        // Update template selection
        if (screen.template) {
            document.querySelectorAll('.template-card-layout').forEach(c => c.classList.remove('active'));
            document.querySelector(`.template-card-layout[data-template="${screen.template}"]`)?.classList.add('active');
        }

        // Update alignment buttons
        if (screen.textAlign) {
            document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
            document.querySelector(`.align-btn[data-align="${screen.textAlign}"]`)?.classList.add('active');
        }

        // Update bg type buttons
        if (screen.bgType) {
            document.querySelectorAll('.bg-type-btn').forEach(b => b.classList.remove('active'));
            document.querySelector(`.bg-type-btn[data-bgtype="${screen.bgType}"]`)?.classList.add('active');
        }

        // Primary Screenshot
        const uploadZone = document.getElementById('uploadZone');
        if (screen.screenshot) {
            this.screenshotImage = screen.screenshot;
            uploadZone.innerHTML = `<img src="${screen.screenshot.src}" alt="Screenshot">`;
            uploadZone.classList.add('has-image');
        } else {
            this.screenshotImage = null;
            uploadZone.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17,8 12,3 7,8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p>Drop screenshot here</p>
        <span>or click to upload</span>
      `;
            uploadZone.classList.remove('has-image');
        }

        // Second Screenshot (Multi-Screen or Spread)
        const uploadZone2 = document.getElementById('uploadZone2');
        if (screen.template === 'multi-screen' || screen.template === 'multi-dynamic' || screen.template === 'spread') {
            uploadZone2.style.display = 'flex';
            if (screen.screenshot2) {
                uploadZone2.innerHTML = `<img src="${screen.screenshot2.src}" alt="Screenshot 2">`;
                uploadZone2.classList.add('has-image');
            } else {
                uploadZone2.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17,8 12,3 7,8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p>Second Screenshot</p>
            <span>(Right Device)</span>
          `;
                uploadZone2.classList.add('has-image');
            }
        } else {
            uploadZone2.style.display = 'none';
        }

        // Third Screenshot (Spread only)
        const uploadZone3 = document.getElementById('uploadZone3');
        if (screen.template === 'spread') {
            uploadZone3.style.display = 'flex';
            if (screen.screenshot3) {
                uploadZone3.innerHTML = `<img src="${screen.screenshot3.src}" alt="Screenshot 3">`;
                uploadZone3.classList.add('has-image');
            } else {
                uploadZone3.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17,8 12,3 7,8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p>Third Screenshot</p>
            <span>(Left Device)</span>
          `;
                uploadZone3.classList.add('has-image');
            }
        } else {
            uploadZone3.style.display = 'none';
        }

        // Update nav button states
        this.updateScreenNavButtons();
    }

    applyTheme(theme) {
        const themes = {
            'light-blue': { bg1: '#c8e0f4', bg2: '#a8d0ea', text: '#1a1a1a' },
            'orange': { bg1: '#f5a623', bg2: '#f5a623', text: '#1a1a1a' },
            'white': { bg1: '#ffffff', bg2: '#f5f5f5', text: '#1a1a1a' },
            'dark': { bg1: '#1a1a1a', bg2: '#0f0f0f', text: '#ffffff' },
            'purple': { bg1: '#667eea', bg2: '#764ba2', text: '#ffffff' },
            'pink': { bg1: '#f093fb', bg2: '#f5576c', text: '#ffffff' },
            'blue': { bg1: '#4facfe', bg2: '#00f2fe', text: '#ffffff' },
            'green': { bg1: '#43e97b', bg2: '#38f9d7', text: '#1a1a1a' }
        };

        if (themes[theme]) {
            this.settings.bgColor1 = themes[theme].bg1;
            this.settings.bgColor2 = themes[theme].bg2;
            this.settings.textColor = themes[theme].text;
            this.settings.bgType = (theme === 'light-blue' || theme === 'orange' || theme === 'white' || theme === 'dark') ? 'solid' : 'gradient';

            document.getElementById('bgColor1').value = themes[theme].bg1;
            document.getElementById('bgColor2').value = themes[theme].bg2;
            document.getElementById('textColor').value = themes[theme].text;
        }
    }

    // Apply theme to current screen
    applyThemeToScreen(theme) {
        const themes = {
            'light-blue': { bg1: '#c8e0f4', bg2: '#a8d0ea', text: '#1a1a1a', bgType: 'solid' },
            'orange': { bg1: '#f5a623', bg2: '#f5a623', text: '#1a1a1a', bgType: 'solid' },
            'white': { bg1: '#ffffff', bg2: '#f5f5f5', text: '#1a1a1a', bgType: 'solid' },
            'dark': { bg1: '#1a1a1a', bg2: '#0f0f0f', text: '#ffffff', bgType: 'solid' },
            'purple': { bg1: '#667eea', bg2: '#764ba2', text: '#ffffff', bgType: 'gradient' },
            'pink': { bg1: '#f093fb', bg2: '#f5576c', text: '#ffffff', bgType: 'gradient' },
            'blue': { bg1: '#4facfe', bg2: '#00f2fe', text: '#ffffff', bgType: 'gradient' },
            'green': { bg1: '#43e97b', bg2: '#38f9d7', text: '#1a1a1a', bgType: 'gradient' }
        };

        if (themes[theme]) {
            const screen = this.screens[this.currentScreen - 1];
            screen.bgColor1 = themes[theme].bg1;
            screen.bgColor2 = themes[theme].bg2;
            screen.textColor = themes[theme].text;
            screen.bgType = themes[theme].bgType;

            document.getElementById('bgColor1').value = themes[theme].bg1;
            document.getElementById('bgColor2').value = themes[theme].bg2;
            document.getElementById('textColor').value = themes[theme].text;
        }
    }

    applyMagicTheme() {
        const screen = this.screens[this.currentScreen - 1];
        // Prioritize App Icon -> Main Screenshot -> Other Screenshots
        const img = this.settings.appIcon || screen.screenshotImage || screen.screenshot2 || screen.screenshot3;

        if (!img) {
            alert('Please upload an App Icon or Screenshot first!');
            return;
        }

        const colors = this.extractColorsFromImage(img);

        screen.bgColor1 = colors.primary;
        screen.bgColor2 = colors.secondary;
        screen.textColor = colors.text;
        screen.bgType = 'gradient'; // Magic looks best with gradient

        // Update UI
        document.getElementById('bgColor1').value = colors.primary;
        document.getElementById('bgColor2').value = colors.secondary;
        document.getElementById('textColor').value = colors.text;

        this.render();
    }

    extractColorsFromImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);

        const data = ctx.getImageData(0, 0, 50, 50).data;
        const colorCounts = {};

        const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        const getLum = (r, g, b) => (0.299 * r + 0.587 * g + 0.114 * b);

        // 1. Bucket colors
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 128) continue; // Skip transparency

            // Round to nearest 10
            const qr = Math.round(r / 10) * 10;
            const qg = Math.round(g / 10) * 10;
            const qb = Math.round(b / 10) * 10;

            const key = `${qr},${qg},${qb}`;
            colorCounts[key] = (colorCounts[key] || 0) + 1;
        }

        // Convert to array and sort
        const sortedColors = Object.entries(colorCounts)
            .sort((a, b) => b[1] - a[1])
            .map(entry => {
                const [r, g, b] = entry[0].split(',').map(Number);
                return { hex: rgbToHex(r, g, b), r, g, b, count: entry[1] };
            });

        let palette = [];
        let primaryObj = sortedColors[0] || { r: 0, g: 0, b: 0 }; // Default if empty

        // 2. Default if empty
        if (sortedColors.length === 0) {
            palette = ['#000000', '#333333', '#666666', '#999999'];
        } else {
            // 3. Pick distinct colors
            palette.push(sortedColors[0].hex); // Primary

            for (let i = 1; i < sortedColors.length; i++) {
                if (palette.length >= 4) break;

                const col = sortedColors[i];
                const isDistinct = palette.every(p => {
                    const pr = parseInt(p.slice(1, 3), 16);
                    const pg = parseInt(p.slice(3, 5), 16);
                    const pb = parseInt(p.slice(5, 7), 16);
                    const diff = Math.abs(col.r - pr) + Math.abs(col.g - pg) + Math.abs(col.b - pb);
                    return diff > 40; // Threshold
                });

                if (isDistinct) {
                    palette.push(col.hex);
                }
            }
        }

        // 4. Fill usage if < 4 (Generate variants)
        while (palette.length < 4) {
            // Generate variant
            const lastHex = palette[palette.length - 1];
            const lr = parseInt(lastHex.slice(1, 3), 16);
            const lg = parseInt(lastHex.slice(3, 5), 16);
            const lb = parseInt(lastHex.slice(5, 7), 16);

            // Shift luminance
            const shift = (getLum(lr, lg, lb) > 128) ? -40 : 40;
            const clamp = v => Math.min(255, Math.max(0, v));

            palette.push(rgbToHex(clamp(lr + shift), clamp(lg + shift), clamp(lb + shift)));
        }

        // 5. Determine Text Color (based on primary background)
        const lum = getLum(primaryObj.r, primaryObj.g, primaryObj.b);
        const textColor = (lum >= 128) ? '#1a1a1a' : '#ffffff';

        // Return object compatible with old code but adding palette
        return {
            primary: palette[0],
            secondary: palette[1],
            palette: palette,
            text: textColor
        };
    }

    /* ========== URL Auto-Import Engine ========== */

    async fetchAppInfoFromUrl(rawUrl) {
        if (!rawUrl) throw new Error('Please enter a URL');

        let targetUrl = rawUrl.trim();
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }

        // 1. Try Vercel Serverless Function First (Server-side, no CORS limits)
        if (typeof window !== 'undefined' && window.location?.origin && /^https?:/i.test(window.location.origin)) {
            try {
                const apiRes = await fetch(`/api/fetch-url?url=${encodeURIComponent(targetUrl)}`);
                if (apiRes.ok) {
                    const data = await apiRes.json();
                    if (data && data.appName && data.features?.length > 0) {
                        this.lastExtractedProduct = data;
                        return data;
                    }
                }
            } catch (err) {
                console.warn('Local /api/fetch-url call failed, trying client fallback:', err);
            }
        }

        // 2. Client Fallback: Parse GitHub or Website directly via CORS-enabled public proxies
        const ghMatch = targetUrl.match(/(?:github\.com\/)([^\/]+)\/([^\/\?#]+)/i);
        let result = null;
        if (ghMatch) {
            const owner = ghMatch[1];
            const repo = ghMatch[2].replace(/\.git$/i, '');
            result = await this.clientFetchGitHub(owner, repo, targetUrl);
        } else {
            result = await this.clientFetchWebsite(targetUrl);
        }

        this.lastExtractedProduct = result;
        return result;
    }

    async clientFetchGitHub(owner, repo, originalUrl) {
        let repoData = {};
        try {
            const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
            if (res.ok) repoData = await res.json();
        } catch (e) {
            console.warn('GitHub API failed:', e);
        }

        let cleanName = (repoData.name || repo)
            .replace(/[-_.]+/g, ' ')
            .replace(/\b(app|ios|android|mobile|client|web)\b/gi, '')
            .trim()
            .split(' ')
            .filter(Boolean)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ') || repo;

        let result = {
            appName: cleanName,
            title: cleanName,
            tagline: repoData.description || `Build better with ${cleanName}`,
            hookHeadline: repoData.description ? repoData.description.split('.')[0] : cleanName,
            description: repoData.description || '',
            features: [],
            iconUrl: repoData.owner?.avatar_url || null,
            category: 'productivity',
            url: originalUrl
        };

        // If repo has homepage, scrape the live landing page for real marketing copy!
        if (repoData.homepage && /^https?:\/\//i.test(repoData.homepage)) {
            try {
                const jinaRes = await fetch(`https://r.jina.ai/${repoData.homepage}`);
                if (jinaRes.ok) {
                    const text = await jinaRes.text();
                    const parsed = this.parseClientMarkdown(text, repoData.homepage);
                    if (parsed.appName && parsed.appName !== 'Magic Mockup') result.appName = parsed.appName;
                    if (parsed.hookHeadline) result.hookHeadline = parsed.hookHeadline;
                    if (parsed.description) result.description = parsed.description;
                    if (parsed.features.length > 0) result.features = parsed.features;
                    if (parsed.iconUrl) result.iconUrl = parsed.iconUrl;
                }
            } catch (e) {}
        }

        // If features still needed, fetch raw README or index.html from repo
        if (result.features.length < 3) {
            const branches = ['HEAD', 'main', 'master'];
            for (const branch of branches) {
                try {
                    const readmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`);
                    if (readmeRes.ok) {
                        const md = await readmeRes.text();
                        const parsed = this.parseClientMarkdown(md, originalUrl);
                        if (parsed.description && !result.description) result.description = parsed.description;
                        parsed.features.forEach(f => {
                            if (!result.features.some(rf => rf.title.toLowerCase() === f.title.toLowerCase())) {
                                result.features.push(f);
                            }
                        });
                    }
                    if (result.features.length >= 3) break;
                } catch (e) {}
            }
        }

        result.category = this.detectCategoryFromText(`${result.appName} ${result.hookHeadline} ${result.description} ${result.features.map(f => f.title).join(' ')}`);
        return result;
    }

    async clientFetchWebsite(targetUrl) {
        let text = '';
        try {
            const jinaRes = await fetch(`https://r.jina.ai/${targetUrl}`);
            if (jinaRes.ok) {
                text = await jinaRes.text();
            }
        } catch (e) {}

        const parsed = this.parseClientMarkdown(text, targetUrl);
        return parsed;
    }

    parseClientMarkdown(text, pageUrl) {
        let domain = '';
        try {
            domain = new URL(pageUrl).hostname;
        } catch (e) {}

        const blacklist = /^(menu|nav|navigation|footer|header|sign in|sign up|log in|pricing|contact|cookies|privacy|terms|copyright|rights reserved|explore all|start free|get started|now in|frequently asked|latest commit|folders and files|history)/i;

        const titleMatch = text.match(/Title:\s*(.+)/);
        let title = titleMatch ? titleMatch[1].trim() : '';
        let appName = title ? title.split(/[|\-–:•]/)[0].trim() : domain.replace(/^www\./, '').split('.')[0];
        appName = appName.charAt(0).toUpperCase() + appName.slice(1);

        const mdIndex = text.indexOf('Markdown Content:');
        const content = mdIndex !== -1 ? text.slice(mdIndex + 17) : text;

        // Extract paragraphs for description
        const paragraphs = content
            .split(/\n\s*\n/)
            .map(p => p.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_`]/g, '').trim())
            .filter(p => p.length > 25 && !p.startsWith('#') && !p.startsWith('!') && !p.startsWith('['));

        let description = paragraphs.length > 0 ? paragraphs[0].replace(/\n+/g, ' ') : '';

        // Extract features (headings followed by text or bold bullet items)
        const features = [];
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Check headings
            if (/^#{2,4}\s+/.test(line)) {
                const heading = line.replace(/^#+\s*/, '').replace(/[*_`]/g, '').trim();
                if (heading.length > 2 && heading.length < 60 && !blacklist.test(heading)) {
                    // Check next line for description
                    let nextDesc = '';
                    for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
                        const nextLine = lines[j].trim();
                        if (nextLine && !nextLine.startsWith('#') && !nextLine.startsWith('!') && nextLine.length > 10) {
                            nextDesc = nextLine.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_`]/g, '').trim();
                            break;
                        }
                    }
                    if (nextDesc && !features.some(f => f.title.toLowerCase() === heading.toLowerCase())) {
                        features.push({ title: heading, description: nextDesc });
                    }
                }
            }
            // Check bold bullets: - **Feature**: Description
            const bMatch = line.match(/^[*-]\s+\*\*([^*]+)\*\*[:\s-]+(.+)/);
            if (bMatch) {
                const bTitle = bMatch[1].trim();
                const bDesc = bMatch[2].replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/[*_`]/g, '').trim();
                if (bTitle.length > 2 && bTitle.length < 60 && bDesc.length > 8 && !blacklist.test(bTitle)) {
                    if (!features.some(f => f.title.toLowerCase() === bTitle.toLowerCase())) {
                        features.push({ title: bTitle, description: bDesc });
                    }
                }
            }
        }

        let hook = features[0]?.title || appName;
        return {
            appName,
            title,
            tagline: description || `Experience ${appName}`,
            hookHeadline: hook,
            description,
            features: features.slice(0, 8),
            iconUrl: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null,
            category: this.detectCategoryFromText(`${appName} ${title} ${description} ${features.map(f => f.title).join(' ')}`),
            url: pageUrl
        };
    }

    detectCategoryFromText(text) {
        if (/workout|fitness|gym|health|calorie|training|runner|exercise|sport|diet|meditation|sleep|step|yoga/i.test(text)) return 'fitness';
        if (/budget|finance|money|expense|crypto|invest|bank|wallet|stock|trading|accounting|cash|invoice/i.test(text)) return 'finance';
        if (/habit|task|todo|routine|organize|note|calendar|focus|productivity|schedule|reminder|workflow|screenshot|mockup|design|developer/i.test(text)) return 'productivity';
        if (/social|chat|friend|community|message|dating|connect|network|stream|creator|feed|post/i.test(text)) return 'social';
        if (/shop|store|product|discount|order|cart|checkout|ecommerce|retail|delivery|food|clothing/i.test(text)) return 'ecommerce';
        if (/learn|study|quiz|course|student|education|lesson|language|school|academic|flashcard|book/i.test(text)) return 'education';
        if (/music|video|movie|film|stream|podcast|game|entertainment|play|show|radio|tv|audio/i.test(text)) return 'entertainment';
        return 'utilities';
    }

    renderExtractedPreview(info, containerId, isAi = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const accentColor = isAi ? '#818cf8' : '#34d399';
        const badgeBg = isAi ? 'rgba(99, 102, 241, 0.18)' : 'rgba(16, 185, 129, 0.18)';

        let featureChips = '';
        if (info.features && info.features.length > 0) {
            featureChips = info.features.slice(0, 5).map((f, i) => `
                <div style="background: #18181b; border: 1px solid #27272a; border-radius: 6px; padding: 6px 10px; margin-top: 4px; font-size: 0.75rem; display: flex; flex-direction: column; gap: 2px;">
                    <div style="font-weight: 700; color: ${accentColor}; font-size: 0.78rem;">
                        Slide ${i + 1}: ${f.title}
                    </div>
                    <div style="color: #a1a1aa; line-height: 1.35;">
                        ${f.description}
                    </div>
                </div>
            `).join('');
        }

        const actionBtnId = isAi ? 'aiQuickGenerateBtn' : 'smartQuickGenerateBtn';
        const actionBtnText = isAi ? '✨ Generate Magic Screenshots with AI' : '⚡️ Generate 5 Screenshots with Extracted Features';
        const actionBtnGradient = isAi
            ? 'background: linear-gradient(135deg, #667eea, #764ba2);'
            : 'background: linear-gradient(135deg, #10b981, #059669);';

        container.style.display = 'block';
        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 0.8rem; font-weight: 700; color: #f4f4f5;">
                    ✓ Extracted: <span style="color: ${accentColor};">${info.appName}</span>
                </span>
                <span style="background: ${badgeBg}; color: ${accentColor}; font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 999px;">
                    ${info.features?.length || 0} features found
                </span>
            </div>
            ${info.description ? `<div style="font-size: 0.75rem; color: #d4d4d8; margin-bottom: 6px; line-height: 1.4;"><strong>Hook:</strong> ${info.hookHeadline || info.description}</div>` : ''}
            ${featureChips}
            <button type="button" class="btn btn--primary" id="${actionBtnId}" style="margin-top: 10px; width: 100%; ${actionBtnGradient} border: none; font-size: 0.85rem; font-weight: 700; padding: 0.65rem 1rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; gap: 0.4rem; cursor: pointer;">
                <span>${actionBtnText}</span>
            </button>
        `;

        // Wire up quick generate button
        const quickBtn = document.getElementById(actionBtnId);
        if (quickBtn) {
            quickBtn.onclick = (e) => {
                e.preventDefault();
                if (isAi) {
                    this.generateMagicConfig();
                } else {
                    this.generateSmartConfig();
                }
            };
        }
    }

    async handleUrlImport(type, showToastOnSuccess = true) {
        const isAi = type === 'ai';
        const urlInput = document.getElementById(isAi ? 'aiAppUrl' : 'smartAppUrl');
        const btn = document.getElementById(isAi ? 'aiFetchUrlBtn' : 'smartFetchUrlBtn');
        const statusEl = document.getElementById(isAi ? 'aiUrlStatus' : 'smartUrlStatus');

        const rawUrl = urlInput?.value.trim();
        if (!rawUrl) {
            this.showToast('Please enter a website or GitHub URL first', 'error');
            return null;
        }

        const originalBtnHtml = btn ? btn.innerHTML : '';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<span class="loading-spinner-sm" style="display:inline-block; width:12px; height:12px; border:2px solid #ccc; border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:4px;"></span> Fetching...`;
        }
        if (statusEl) {
            statusEl.textContent = 'Extracting product features and value props...';
            statusEl.style.color = '#38bdf8';
        }

        try {
            const info = await this.fetchAppInfoFromUrl(rawUrl);

            // 1. Populate AI Modal fields
            if (isAi) {
                const descEl = document.getElementById('aiAppDescription');
                if (descEl) {
                    descEl.value = `App Name: ${info.appName}\nCategory: ${info.category}\nCore Value Prop: ${info.hookHeadline || info.tagline}\nAbout: ${info.description || info.tagline}\n\nKEY PRODUCT FEATURES (SHOWCASE ON INDIVIDUAL SLIDES):\n${info.features.map((f, i) => `${i + 1}. Feature: ${f.title}\n   Benefit: ${f.description}`).join('\n')}`;
                }
                this.renderExtractedPreview(info, 'aiExtractedPreview', true);
            } else {
                // 2. Populate Smart Modal fields with real product features and descriptions!
                const nameEl = document.getElementById('smartAppName');
                const catEl = document.getElementById('smartAppCategory');
                const taglineEl = document.getElementById('smartTagline');
                const hookSubEl = document.getElementById('smartHookSub');
                const f1El = document.getElementById('smartFeature1');
                const f1SubEl = document.getElementById('smartFeature1Sub');
                const f2El = document.getElementById('smartFeature2');
                const f2SubEl = document.getElementById('smartFeature2Sub');
                const f3El = document.getElementById('smartFeature3');
                const f3SubEl = document.getElementById('smartFeature3Sub');
                const proofEl = document.getElementById('smartSocialProof');
                const ctaSubEl = document.getElementById('smartCtaSub');

                if (nameEl) nameEl.value = info.appName;
                if (catEl && info.category) catEl.value = info.category;
                if (taglineEl) taglineEl.value = info.hookHeadline || info.tagline;
                if (hookSubEl) hookSubEl.value = info.description || info.tagline;

                const feats = info.features || [];
                if (f1El && feats[0]) f1El.value = feats[0].title;
                if (f1SubEl && feats[0]) f1SubEl.value = feats[0].description;

                if (f2El && feats[1]) f2El.value = feats[1].title;
                if (f2SubEl && feats[1]) f2SubEl.value = feats[1].description;

                if (f3El && feats[2]) f3El.value = feats[2].title;
                if (f3SubEl && feats[2]) f3SubEl.value = feats[2].description;

                if (proofEl) proofEl.value = feats[3] ? feats[3].title : `Ready to Ship Your App?`;
                if (ctaSubEl) ctaSubEl.value = feats[3] ? feats[3].description : `Start designing with ${info.appName} today. Free to try.`;

                this.renderExtractedPreview(info, 'smartExtractedPreview', false);
            }

            // 3. Load App Icon if available and not yet uploaded
            if (info.iconUrl) {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = () => {
                    this.settings.appIcon = img;
                    const aiIconZone = document.getElementById('appIconUploadModalZone');
                    const smartIconZone = document.getElementById('smartAppIconUploadZone');
                    if (aiIconZone) aiIconZone.innerHTML = `<img src="${info.iconUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;
                    if (smartIconZone) smartIconZone.innerHTML = `<img src="${info.iconUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;
                };
                img.src = info.iconUrl;
            }

            if (statusEl) {
                statusEl.textContent = `✓ Extracted ${info.appName} (${info.category}) with ${info.features?.length || 0} product features!`;
                statusEl.style.color = '#34d399';
            }

            if (showToastOnSuccess) {
                this.showToast(`Extracted ${info.features?.length || 0} features for ${info.appName}!`, 'success');
            }

            return info;
        } catch (err) {
            console.error('URL Import error:', err);
            if (statusEl) {
                statusEl.textContent = `Failed to fetch: ${err.message}`;
                statusEl.style.color = '#f87171';
            }
            this.showToast(`URL Import Failed: ${err.message}`, 'error');
            return null;
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalBtnHtml;
            }
        }
    }

    async generateMagicConfig() {
        // Use the key loaded in constructor or updated via settings
        const apiKey = this.geminiApiKey;
        const urlVal = document.getElementById('aiAppUrl')?.value.trim();
        let description = document.getElementById('aiAppDescription')?.value.trim();

        // If URL provided but description empty, auto-fetch from URL first
        if (urlVal && !description) {
            await this.handleUrlImport('ai', false);
            description = document.getElementById('aiAppDescription')?.value.trim();
        }

        if (!apiKey) {
            this.showToast('Please configure your Gemini API Key in Profile Settings', 'error');
            return;
        }
        if (!description) {
            alert('Please enter an app description or import from URL');
            return;
        }

        this.geminiApiKey = apiKey;
        localStorage.setItem('gemini_api_key', apiKey);

        // Show Modern Loading Overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.classList.add('active');

        // Hide modal immediately
        document.getElementById('aiModal').classList.remove('active');

        try {
            // Wait for ALL images to be loaded before proceeding
            const loadedImages = this.aiUploadedImages.filter(img => img);
            if (loadedImages.length === 0) {
                alert('Please upload some screenshots first.');
                loadingOverlay.classList.remove('active');
                return;
            }
            if (loadedImages.length < this.aiUploadedImages.length) {
                alert('Please wait for all screenshots to finish loading.');
                loadingOverlay.classList.remove('active');
                return;
            }

            const totalUploaded = loadedImages.length;

            // Prepare Multimodal Parts
            const parts = [];

            // 1. Text Prompt
            const textPrompt = `
                Act as a Senior App Store Optimization (ASO) Expert and Lead Designer.
                Your task is to design a high-converting, 5-star App Store screenshot story for this app.
                
                APP PRODUCT DETAILS & EXTRACTED FEATURES:
                ${description}

                I have attached ${totalUploaded} screenshots of the app.
                
                CRITICAL INSTRUCTION - USE THE ACTUAL PRODUCT FEATURES:
                You MUST use the exact product features, capabilities, and benefits described in the APP PRODUCT DETAILS above.
                DO NOT invent generic or vague filler copy (like "Stay productive" or "Easy to use").
                
                SCREEN-BY-SCREEN REQUIREMENTS:
                - Screen 1 (The Hook): A punchy headline capturing the core value proposition (2-4 words), with a compelling subheadline explaining the primary transformation for the user (6-12 words).
                - Screen 2: Must focus specifically on Feature 1 from the product details. Use a punchy headline (2-4 words) and subheadline explaining that feature's specific benefit (6-12 words).
                - Screen 3: Must focus specifically on Feature 2 from the product details. Headline (2-4 words) and subheadline explaining that feature's benefit.
                - Screen 4: Must focus specifically on Feature 3 from the product details. Headline (2-4 words) and subheadline explaining that feature's benefit.
                - Screen 5 (or Final Screen): Feature 4 or The Close / Call To Action, highlighting why the user should download today.
                - If more than 5 screens: Map remaining features sequentially to screens.

                AVAILABLE TEMPLATES: 'minimal-top', 'centered-bottom', 'hero-left', 'hero-right', 'tilted-shadow', 'spread', 'multi-dynamic', 'panorama-left' (must pair with 'panorama-right').

                STRICT RULES:
                1. You MUST return exactly ${Math.min(totalUploaded, 10)} screen objects in the array.
                2. Use each uploaded image exactly once.
                3. Assign 'screenshotIndex' (0 to ${totalUploaded - 1}) to match the screenshot that best illustrates that feature.
                
                Return ONLY a valid JSON array of objects:
                [
                    { 
                        "headline": "...", 
                        "subheadline": "...", 
                        "template": "...",
                        "textAlign": "center", 
                        "deviceShadow": "large",
                        "screenshotIndex": 0 
                    },
                    ...
                ]
            `;
            parts.push({ text: textPrompt });

            // 2. Attach Images
            loadedImages.forEach(img => {
                const base64Data = img.src.split(',')[1];
                const mimeType = img.src.substring(img.src.indexOf(':') + 1, img.src.indexOf(';'));
                if (base64Data) {
                    parts.push({
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    });
                }
            });

            // Force read latest key/model
            const currentApiKey = localStorage.getItem('gemini_api_key') || this.geminiApiKey;
            this.geminiModel = localStorage.getItem('gemini_model') || 'gemini-flash-latest';

            const responseText = await this.callGemini(parts, currentApiKey);

            // Clean markdown and extract array
            let cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const start = cleanJson.indexOf('[');
            const end = cleanJson.lastIndexOf(']');
            if (start !== -1 && end !== -1) {
                cleanJson = cleanJson.substring(start, end + 1);
            }

            const screensData = JSON.parse(cleanJson);
            
            // Sync number of screens with AI response
            while (this.screens.length < screensData.length && this.screens.length < 10) {
                this.screens.push(this.createNewScreen());
            }

            screensData.forEach((data, index) => {
                if (this.screens[index]) {
                    this.screens[index].headline = data.headline;
                    this.screens[index].subheadline = data.subheadline;
                    if (data.textAlign) this.screens[index].textAlign = data.textAlign;
                    
                    let template = data.template || 'minimal-top';
                    this.applyTemplateToScreen(template, this.screens[index]);
                    this.screens[index].template = template;

                    if (data.screenshotIndex !== undefined && this.aiUploadedImages[data.screenshotIndex]) {
                        this.screens[index].screenshot = this.aiUploadedImages[data.screenshotIndex];
                    }
                }
            });

            // Auto-apply branding to ALL screens if icon exists
            if (this.settings.appIcon) {
                const colors = this.extractColorsFromImage(this.settings.appIcon);
                this.screens.forEach((screen, idx) => {
                    screen.textColor = colors.text;
                    screen.bgType = 'gradient';
                    if (idx % 2 === 0) {
                        screen.bgColor1 = colors.palette[0];
                        screen.bgColor2 = colors.palette[1];
                    } else {
                        if (colors.palette[2]) {
                            screen.bgColor1 = colors.palette[2];
                            screen.bgColor2 = colors.palette[0];
                        } else {
                            screen.bgColor1 = colors.palette[1];
                            screen.bgColor2 = colors.palette[0];
                        }
                    }
                });
            }

            // UI Cleanup
            document.getElementById('aiModal').classList.remove('active');
            
            // Switch to App Store Preview automatically
            document.getElementById('editViewBtn').classList.remove('active');
            document.getElementById('previewViewBtn').classList.add('active');
            document.getElementById('editView').style.display = 'none';
            document.getElementById('appstorePreview').style.display = 'flex';

            this.currentScreen = 1;
            this.updateScreenNavButtons();
            this.loadScreenData();
            this.renderAllScreens();
            this.render();

            // Set app name in header if not already set
            const topAppNameEl = document.getElementById('appName');
            const magicName = this.lastExtractedProduct?.appName || 'Magic Project';
            if (topAppNameEl && (!topAppNameEl.value || topAppNameEl.value === 'Unnamed Project')) {
                topAppNameEl.value = magicName;
            }

            // Auto-save project & save to history
            await this.saveProject();
            await this.saveToHistory(topAppNameEl?.value || magicName, 'AI Designer');

        } catch (error) {
            console.error(error);
            this.showToast('AI Generation Failed: ' + error.message, 'error');
        } finally {
            // Hide Loading Overlay
            setTimeout(() => {
                loadingOverlay.classList.remove('active');
            }, 500); // Small delay for smoothness
        }
    }

    async generateSmartConfig() {
        const urlVal = document.getElementById('smartAppUrl')?.value.trim();
        let appNameInput = document.getElementById('smartAppName')?.value.trim();

        // If URL is provided but app name/tagline empty, auto-import from URL first
        if (urlVal && !appNameInput) {
            await this.handleUrlImport('smart', false);
            appNameInput = document.getElementById('smartAppName')?.value.trim();
        }

        const categoryKey = document.getElementById('smartAppCategory')?.value || 'productivity';
        const storyFlowKey = document.getElementById('smartStoryFlow')?.value || 'classic';
        const colorStyle = document.getElementById('smartColorStyle')?.value || 'auto';

        const customTagline = document.getElementById('smartTagline')?.value.trim();
        const customHookSub = document.getElementById('smartHookSub')?.value.trim();
        const customFeature1 = document.getElementById('smartFeature1')?.value.trim();
        const customFeature1Sub = document.getElementById('smartFeature1Sub')?.value.trim();
        const customFeature2 = document.getElementById('smartFeature2')?.value.trim();
        const customFeature2Sub = document.getElementById('smartFeature2Sub')?.value.trim();
        const customFeature3 = document.getElementById('smartFeature3')?.value.trim();
        const customFeature3Sub = document.getElementById('smartFeature3Sub')?.value.trim();
        const customSocialProof = document.getElementById('smartSocialProof')?.value.trim();
        const customCtaSub = document.getElementById('smartCtaSub')?.value.trim();

        const product = this.lastExtractedProduct || {};
        const pFeatures = product.features || [];

        const preset = ASO_PRESETS[categoryKey] || ASO_PRESETS.productivity;
        const appName = appNameInput || product.appName || preset.name;

        // Construct 5 narrative copy sets using extracted product data as priority
        const copySets = [
            {
                headline: customTagline || product.hookHeadline || preset.tagline,
                subheadline: customHookSub || product.description || preset.taglineSub.replace(/HabitPro|ZenFit|PocketLedger|VibeCast|Shoply|BrainQuest|CineStream|ToolBox Pro/g, appName)
            },
            {
                headline: customFeature1 || pFeatures[0]?.title || preset.feature1,
                subheadline: customFeature1Sub || pFeatures[0]?.description || preset.feature1Sub
            },
            {
                headline: customFeature2 || pFeatures[1]?.title || preset.feature2,
                subheadline: customFeature2Sub || pFeatures[1]?.description || preset.feature2Sub
            },
            {
                headline: customFeature3 || pFeatures[2]?.title || preset.socialProof,
                subheadline: customFeature3Sub || pFeatures[2]?.description || preset.socialProofSub.replace(/HabitPro|ZenFit|PocketLedger|VibeCast|Shoply|BrainQuest|CineStream|ToolBox Pro/g, appName)
            },
            {
                headline: customSocialProof || (pFeatures[3] ? pFeatures[3].title : `Ready to Ship Your App?`),
                subheadline: customCtaSub || (pFeatures[3] ? pFeatures[3].description : preset.ctaSub)
            }
        ];

        // For any extra screens beyond 5, assign remaining extracted features
        for (let i = 5; i < this.screens.length; i++) {
            const extraFeature = pFeatures[i - 1];
            if (extraFeature) {
                copySets.push({
                    headline: extraFeature.title,
                    subheadline: extraFeature.description
                });
            } else {
                copySets.push({
                    headline: `Experience ${appName}`,
                    subheadline: `Join thousands enjoying a seamless experience every day.`
                });
            }
        }

        // Ensure 5 screens exist
        if (this.screens.length < 5) {
            while (this.screens.length < 5) {
                this.screens.push({ ...this.screens[0] });
            }
        }

        const flow = STORY_FLOWS[storyFlowKey] || STORY_FLOWS.classic;
        const images = (this.aiUploadedImages && this.aiUploadedImages.length > 0) ? this.aiUploadedImages : [];

        // Apply templates, copy, alignment, and screenshots
        copySets.forEach((copy, idx) => {
            const screen = this.screens[idx];
            if (!screen) return;

            screen.headline = copy.headline;
            screen.subheadline = copy.subheadline;
            screen.appName = appName;

            const template = flow[idx] || 'minimal-top';
            this.applyTemplateToScreen(template, screen);
            screen.template = template;

            // Intelligent Screenshot Assignment
            if (images.length > 0) {
                // If this is the right half of a panorama pair, share the same screenshot as previous screen
                if (idx > 0 && template.startsWith('panorama-') && template.includes('right') && flow[idx - 1]?.startsWith('panorama-')) {
                    screen.screenshot = this.screens[idx - 1].screenshot;
                } else {
                    screen.screenshot = images[idx % images.length];
                }

                // Multi-device template assignment (screenshot2 and screenshot3)
                if (template === 'multi-screen' || template === 'multi-dynamic' || template === 'spread') {
                    screen.screenshot2 = images[(idx + 1) % images.length];
                    if (template === 'spread') {
                        screen.screenshot3 = images[(idx + 2) % images.length];
                    }
                }
            }
        });

        // Theme and Branding
        if (colorStyle === 'auto') {
            const sampleImg = this.settings.appIcon || (images.length > 0 ? images[0] : null);
            if (sampleImg) {
                const colors = this.extractColorsFromImage(sampleImg);
                this.screens.forEach((screen, idx) => {
                    screen.textColor = colors.text;
                    screen.bgType = 'gradient';
                    if (idx % 2 === 0) {
                        screen.bgColor1 = colors.palette[0];
                        screen.bgColor2 = colors.palette[1];
                    } else {
                        if (colors.palette[2]) {
                            screen.bgColor1 = colors.palette[2];
                            screen.bgColor2 = colors.palette[0];
                        } else {
                            screen.bgColor1 = colors.palette[1];
                            screen.bgColor2 = colors.palette[0];
                        }
                    }
                });
            } else {
                // Fallback default modern purple gradient
                this.screens.forEach((screen, idx) => {
                    screen.textColor = '#ffffff';
                    screen.bgType = 'gradient';
                    screen.bgColor1 = idx % 2 === 0 ? '#667eea' : '#764ba2';
                    screen.bgColor2 = idx % 2 === 0 ? '#764ba2' : '#667eea';
                });
            }
        } else {
            const THEMES = {
                purple: { bg1: '#667eea', bg2: '#764ba2', text: '#ffffff' },
                blue: { bg1: '#4facfe', bg2: '#00f2fe', text: '#ffffff' },
                dark: { bg1: '#1a1a1a', bg2: '#0f0f0f', text: '#ffffff' },
                green: { bg1: '#43e97b', bg2: '#38f9d7', text: '#1a1a1a' },
                pink: { bg1: '#f093fb', bg2: '#f5576c', text: '#ffffff' },
                orange: { bg1: '#f5a623', bg2: '#f76b1c', text: '#1a1a1a' }
            };
            const theme = THEMES[colorStyle] || THEMES.purple;
            this.screens.forEach((screen, idx) => {
                screen.textColor = theme.text;
                screen.bgType = 'gradient';
                if (idx % 2 === 0) {
                    screen.bgColor1 = theme.bg1;
                    screen.bgColor2 = theme.bg2;
                } else {
                    screen.bgColor1 = theme.bg2;
                    screen.bgColor2 = theme.bg1;
                }
            });
        }

        // Update App Name in top navigation bar
        const topAppNameEl = document.getElementById('appName');
        if (topAppNameEl && appName) {
            topAppNameEl.value = appName;
        }

        // Close modal
        document.getElementById('smartModal')?.classList.remove('active');

        // Render & switch to App Store preview
        this.render();

        document.getElementById('editViewBtn')?.classList.remove('active');
        document.getElementById('previewViewBtn')?.classList.add('active');
        const editView = document.getElementById('editView');
        const previewView = document.getElementById('appstorePreview');
        if (editView) editView.style.display = 'none';
        if (previewView) previewView.style.display = 'flex';
        this.renderAllScreens();

        // Auto-save project & save to history
        await this.saveProject();
        await this.saveToHistory(appName, 'Auto Designer');

        this.showToast('⚡️ 5 Screenshots generated & saved to history!', 'success');
    }

    updateSmartPlaceholders(categoryKey) {
        const preset = ASO_PRESETS[categoryKey];
        if (!preset) return;
        const appNameEl = document.getElementById('smartAppName');
        const taglineEl = document.getElementById('smartTagline');
        const hookSubEl = document.getElementById('smartHookSub');
        const f1El = document.getElementById('smartFeature1');
        const f1SubEl = document.getElementById('smartFeature1Sub');
        const f2El = document.getElementById('smartFeature2');
        const f2SubEl = document.getElementById('smartFeature2Sub');
        const f3El = document.getElementById('smartFeature3');
        const f3SubEl = document.getElementById('smartFeature3Sub');
        const proofEl = document.getElementById('smartSocialProof');
        const ctaSubEl = document.getElementById('smartCtaSub');

        if (appNameEl) appNameEl.placeholder = `e.g. ${preset.name}`;
        if (taglineEl) taglineEl.placeholder = `e.g. ${preset.tagline}`;
        if (hookSubEl) hookSubEl.placeholder = `e.g. ${preset.taglineSub}`;
        if (f1El) f1El.placeholder = `e.g. ${preset.feature1}`;
        if (f1SubEl) f1SubEl.placeholder = `e.g. ${preset.feature1Sub}`;
        if (f2El) f2El.placeholder = `e.g. ${preset.feature2}`;
        if (f2SubEl) f2SubEl.placeholder = `e.g. ${preset.feature2Sub}`;
        if (f3El) f3El.placeholder = `e.g. ${preset.socialProof}`;
        if (f3SubEl) f3SubEl.placeholder = `e.g. ${preset.socialProofSub}`;
        if (proofEl) proofEl.placeholder = `e.g. Ready to Experience ${preset.name}?`;
        if (ctaSubEl) ctaSubEl.placeholder = `e.g. ${preset.ctaSub}`;
    }

    async callGemini(userInput, apiKey) {
        // Use user-defined model or default
        const modelId = this.geminiModel || 'gemini-flash-latest';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

        // Handle both simple text prompt and complex parts array
        let parts = [];
        if (Array.isArray(userInput)) {
            parts = userInput;
        } else {
            parts = [{ text: userInput }];
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: parts }]
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        return data.candidates[0].content.parts[0].text;
    }

    /* ========== UI Helpers ========== */

    showToast(message, type = 'success') {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // Icons
        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `<svg class="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
        } else {
            iconSvg = `<svg class="toast-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        }

        toast.innerHTML = `${iconSvg}<span>${message}</span>`;
        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('active');
        });

        // Remove after 3s
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    applyTemplate(template) {
        // Templates define layout behavior
        const templateSettings = {
            'minimal-top': { layout: 'text-top', textAlign: 'center', deviceRotation: 0 },
            'hero-left': { layout: 'text-left', textAlign: 'left', deviceRotation: 0 },
            'centered-bottom': { layout: 'centered', textAlign: 'center', deviceRotation: 0 },
            'hand-crop': { layout: 'hand-holding', textAlign: 'left', deviceRotation: 0 },
            'tilted-shadow': { layout: 'tilted', textAlign: 'center', deviceRotation: -10 },
            'multi-screen': { layout: 'multi-device', textAlign: 'center', deviceRotation: 0 }
        };

        if (templateSettings[template]) {
            this.settings.layout = templateSettings[template].layout;
            this.settings.textAlign = templateSettings[template].textAlign;
            this.settings.deviceRotation = templateSettings[template].deviceRotation || 0;

            // Update alignment buttons
            document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
            document.querySelector(`.align-btn[data-align="${templateSettings[template].textAlign}"]`)?.classList.add('active');
        }
    }

    // Apply template to a specific screen
    applyTemplateToScreen(template, screen) {
        const templateSettings = {
            'minimal-top': { layout: 'text-top', textAlign: 'center', deviceRotation: 0 },
            'hero-left': { layout: 'text-left', textAlign: 'left', deviceRotation: 0 },
            'hero-right': { layout: 'text-right', textAlign: 'left', deviceRotation: 0 },
            'centered-bottom': { layout: 'centered', textAlign: 'center', deviceRotation: 0 },
            'hand-crop': { layout: 'hand-holding', textAlign: 'left', deviceRotation: 0 },
            'tilted-shadow': { layout: 'tilted', textAlign: 'center', deviceRotation: -10 },
            'multi-screen': { layout: 'multi-device', textAlign: 'center', deviceRotation: 0 },
            'multi-dynamic': { layout: 'multi-dynamic', textAlign: 'center', deviceRotation: 0 },
            'panorama-left': { layout: 'panorama-left', textAlign: 'center', deviceRotation: 0 },
            'panorama-right': { layout: 'panorama-right', textAlign: 'center', deviceRotation: 0 },
            'panorama-tilted-left': { layout: 'panorama-tilted-left', textAlign: 'center', deviceRotation: -15 },
            'panorama-tilted-right': { layout: 'panorama-tilted-right', textAlign: 'center', deviceRotation: -15 },
            'spread': { layout: 'spread', textAlign: 'center', deviceRotation: 0 },
            'big-screen': { layout: 'big-screen', textAlign: 'center', deviceRotation: 0 }
        };

        if (templateSettings[template]) {
            screen.layout = templateSettings[template].layout;
            screen.textAlign = templateSettings[template].textAlign;
            if (templateSettings[template].deviceRotation !== undefined) {
                screen.deviceRotation = templateSettings[template].deviceRotation;
            }

            // Update alignment buttons
            document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
            document.querySelector(`.align-btn[data-align="${templateSettings[template].textAlign}"]`)?.classList.add('active');
            
            this.loadScreenData();
        }
    }

    // Draw Global Background Slice
    drawGlobalBackground(ctx, w, h, screenIndex, totalScreens) {
        if (!this.globalBackground) return;

        const img = this.globalBackground;

        // Calculate the slice for this screen
        // Concept: The global image covers (W * N) width
        // We want to draw slice [i * w, (i+1) * w]

        // But we must respect aspect ratio.
        // Aspect Ratio of Image vs Aspect Ratio of Total Canvas Strip
        const totalW = w * totalScreens;
        const totalH = h;

        const imgRatio = img.width / img.height;
        const canvasRatio = totalW / totalH;

        let drawW, drawH, startX, startY;

        // "Cover" logic for the whole strip
        if (imgRatio > canvasRatio) {
            // Image is wider than the strip (crop sides)
            drawH = totalH;
            drawW = drawH * imgRatio;
            startX = (totalW - drawW) / 2; // Center horizontally
            startY = 0;
        } else {
            // Image is taller (crop top/bottom)
            drawW = totalW;
            drawH = drawW / imgRatio;
            startX = 0;
            startY = (totalH - drawH) / 2; // Center vertically
        }

        // Now find the slice for THIS screen (offset by screenIndex * w)
        // The global image is drawn at startX, startY relatively to the TOTAL strip.
        // For screen i, we are essentially looking at the window [i*w, (i+1)*w]
        // The context is already translated to the screen's coordinate system (0,0 is top-left of this screen)
        // So we need to translate the image drawing command negatively by i*w

        // Actually, cleaner math:
        // We want to draw the WHOLE image, but shifted left by `screenIndex * w` + `startX`

        const xOffset = startX - (screenIndex * w);

        ctx.save();

        // Draw the image
        ctx.drawImage(img, xOffset, startY, drawW, drawH);

        // Optional Blur
        // Note: Canvas filter is expensive, but okay for previews. 
        // Better trigger: Pre-process blur? For now dynamic.
        if (this.globalSettings.blur > 0) {
            // Use filter? Context filter is experimental in some envs but widely supported now
            // But re-drawing same image with filter might be slow.
            // Let's rely on CSS for preview? No, export needs it.
            // Skip for now or implement if needed. Filter syntax:
            // ctx.filter = `blur(${this.globalSettings.blur}px)`;
            // For now, let's verify if user wants blur logic, I added slider.
        }

        // Overlay (Darken)
        if (this.globalSettings.overlayOpacity > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.globalSettings.overlayOpacity / 100})`;
            ctx.fillRect(0, 0, w, h);
        }

        ctx.restore();
    }

    applyZoom(level) {
        const zoomLabel = document.getElementById('zoomLevel');
        if (zoomLabel) zoomLabel.textContent = level + '%';
        
        const mainCanvas = document.getElementById('previewCanvas');
        if (mainCanvas) {
            // Calculate height in pixels for consistency
            // At 100% zoom, the canvas should be about 75% of the viewport height
            const baseHeight = window.innerHeight * 0.75;
            const targetHeight = baseHeight * (level / 100);
            
            mainCanvas.style.height = `${targetHeight}px`;
            mainCanvas.style.width = 'auto';
        }
    }

    // Render all screens for App Store preview
    renderAllScreens() {
        const canvases = document.querySelectorAll('.appstore-canvas');
        const savedScreen = this.currentScreen;
        const savedImage = this.screenshotImage;
        const savedSettings = this._currentSettings;

        canvases.forEach((canvas, index) => {
            const screenIndex = index;
            const screen = this.screens[screenIndex];

            // Hide canvas if no screen exists
            const previewItem = canvas.closest('.appstore-preview__item');
            if (!screen) {
                if (previewItem) previewItem.style.display = 'none';
                return;
            }
            if (previewItem) previewItem.style.display = 'flex';

            const ctx = canvas.getContext('2d');
            const w = this.width;
            const h = this.height;

            // Use per-screen settings
            const s = {
                ...this.settings,
                layout: screen.layout || this.settings.layout,
                template: screen.template || this.settings.template,
                textAlign: screen.textAlign || this.settings.textAlign,
                bgType: screen.bgType || this.settings.bgType,
                bgColor1: screen.bgColor1 || this.settings.bgColor1,
                bgColor2: screen.bgColor2 || this.settings.bgColor2,
                textColor: screen.textColor || this.settings.textColor,
                fontSize: screen.fontSize || this.settings.fontSize,
                fontSize: screen.fontSize || this.settings.fontSize,
                deviceScale: screen.deviceScale || this.settings.deviceScale,
                textPosition: screen.textPosition !== undefined ? screen.textPosition : this.settings.textPosition,
                devicePosition: screen.devicePosition !== undefined ? screen.devicePosition : this.settings.devicePosition
            };

            // Set canvas size
            canvas.width = w;
            canvas.height = h;

            // Clear canvas
            ctx.clearRect(0, 0, w, h);

            // Draw background
            const bgMode = this.backgroundMode;

            if (bgMode === 'panorama' && this.globalBackground) {
                this.drawGlobalBackground(ctx, w, h, screenIndex, canvases.length);
            } else {
                // Per-screen background (Classic)
                if (s.bgType === 'gradient') {
                    const gradient = ctx.createLinearGradient(0, 0, w, h);
                    gradient.addColorStop(0, s.bgColor1);
                    gradient.addColorStop(1, s.bgColor2);
                    ctx.fillStyle = gradient;
                } else {
                    ctx.fillStyle = s.bgColor1;
                }
                ctx.fillRect(0, 0, w, h);
            }

            // Temporarily switch context and image for this screen
            const originalCanvas = this.canvas;
            const originalCtx = this.ctx;
            this.canvas = canvas;
            this.ctx = ctx;
            this.screenshotImage = screen.screenshot;
            this._currentSettings = s;

            // Draw based on per-screen layout
            switch (s.layout) {
                case 'text-top':
                    this.drawTextTopLayout(screen);
                    break;
                case 'text-left':
                    this.drawTextLeftLayout(screen);
                    break;
                case 'text-right':
                    this.drawTextRightLayout(screen);
                    break;
                case 'panorama-left':
                    this.drawPanoramaLeftLayout(screen);
                    break;
                case 'panorama-right':
                    this.drawPanoramaRightLayout(screen);
                    break;
                case 'panorama-tilted-left':
                    this.drawPanoramaTiltedLeftLayout(screen);
                    break;
                case 'panorama-tilted-right':
                    this.drawPanoramaTiltedRightLayout(screen);
                    break;
                case 'hand-holding':
                    this.drawHandLayout(screen);
                    break;
                case 'tilted':
                    this.drawTiltedLayout(screen);
                    break;
                case 'multi-device':
                    this.drawMultiDeviceLayout(screen);
                    break;
                case 'multi-dynamic':
                    this.drawMultiDynamicLayout(screen);
                    break;
                default:
                    this.drawCenteredLayout(screen);
            }

            // Restore original context
            this.canvas = originalCanvas;
            this.ctx = originalCtx;
        });

        // Restore saved state
        this.currentScreen = savedScreen;
        this.screenshotImage = savedImage;
        this._currentSettings = savedSettings;
    }

    render(specificScreen) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const screen = specificScreen || this.screens[this.currentScreen - 1];

        // Merge screen settings with global settings (screen settings take priority)
        const s = {
            ...this.settings,
            layout: screen.layout || this.settings.layout,
            template: screen.template || this.settings.template,
            textAlign: screen.textAlign || this.settings.textAlign,
            bgType: screen.bgType || this.settings.bgType,
            bgColor1: screen.bgColor1 || this.settings.bgColor1,
            bgColor2: screen.bgColor2 || this.settings.bgColor2,
            textColor: screen.textColor || this.settings.textColor,
            fontSize: screen.fontSize || this.settings.fontSize,
            fontSize: screen.fontSize || this.settings.fontSize,
            deviceScale: screen.deviceScale || this.settings.deviceScale,
            devicePosition: screen.devicePosition !== undefined ? screen.devicePosition : this.settings.devicePosition,
            deviceRotation: screen.deviceRotation !== undefined ? screen.deviceRotation : this.settings.deviceRotation,
            textPosition: screen.textPosition !== undefined ? screen.textPosition : this.settings.textPosition,
        };

        // Store merged settings for layout functions to use
        this._currentSettings = s;

        // Clear canvas
        ctx.clearRect(0, 0, w, h);

        // Draw background
        const bgMode = this.backgroundMode;

        // For Edit View (Single Screen)
        // We need to simulate the slice for the CURRENT screen
        // currentScreen is 1-based, so index is currentScreen - 1
        const totalScreens = this.screens.length; // Or should we assume 5? Let's use actual count.

        if (bgMode === 'panorama' && this.globalBackground) {
            this.drawGlobalBackground(ctx, w, h, this.currentScreen - 1, totalScreens);
        } else {
            if (s.bgType === 'gradient') {
                const gradient = ctx.createLinearGradient(0, 0, w, h);
                gradient.addColorStop(0, s.bgColor1);
                gradient.addColorStop(1, s.bgColor2);
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = s.bgColor1;
            }
            ctx.fillRect(0, 0, w, h);
        }

        // Draw based on layout
        switch (s.layout) {
            case 'text-top':
                this.drawTextTopLayout(screen);
                break;
            case 'text-left':
                this.drawTextLeftLayout(screen);
                break;
            case 'text-right':
                this.drawTextRightLayout(screen);
                break;
            case 'panorama-left':
                this.drawPanoramaLeftLayout(screen);
                break;
            case 'panorama-right':
                this.drawPanoramaRightLayout(screen);
                break;
            case 'panorama-tilted-left':
                this.drawPanoramaTiltedLeftLayout(screen);
                break;
            case 'panorama-tilted-right':
                this.drawPanoramaTiltedRightLayout(screen);
                break;

            case 'tilted':
                this.drawTiltedLayout(screen);
                break;
            case 'multi-device':
                this.drawMultiDeviceLayout(screen);
                break;
            case 'multi-dynamic':
                this.drawMultiDynamicLayout(screen);
                break;
            case 'spread':
                this.drawSpreadLayout(screen);
                break;
            case 'big-screen':
                this.drawBigScreenLayout(screen);
                break;
            default:
                this.drawCenteredLayout(screen);
        }
    }

    // Get current settings (merged screen + global)
    getSettings() {
        return this._currentSettings || this.settings;
    }

    drawCenteredLayout(screen) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const s = this.getSettings();
        const posOffset = (s.devicePosition / 100) * h;

        // Device
        const deviceHeight = h * (s.deviceScale / 100) * 0.7;
        const deviceWidth = deviceHeight * 0.48;
        const deviceX = (w - deviceWidth) / 2;
        const deviceY = (h - deviceHeight) / 2 + posOffset;
        const rotation = s.deviceRotation || 0;

        this.drawDevice(deviceX, deviceY, deviceWidth, deviceHeight, rotation, screen.screenshot);

        // Text at bottom
        let textY = deviceY + deviceHeight + 80; // Was 120 - reduced gap

        // Category Pill (above text)
        if (s.showCategory) {
            this.drawCategoryPill(s.categoryLabel, w / 2, textY - 80);
        }

        const textBottomY = this.drawText(screen.headline, screen.subheadline, w / 2, textY, s.textAlign);

        // Rating (below text)
        if (s.showRating) {
            this.drawRating(s.rating, w / 2, textBottomY + 40);
        }
    }

    drawTextTopLayout(screen) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const s = this.getSettings();
        const posOffset = (s.devicePosition / 100) * h;

        // Category pill
        let textStartY = 260; // Lowered from 180
        if (s.showCategory) {
            this.drawCategoryPill(s.categoryLabel, w / 2, textStartY);
            textStartY += 80;
        }

        // Text at top
        this.drawText(screen.headline, screen.subheadline, w / 2, textStartY, s.textAlign);

        // App rating
        if (s.showRating) {
            this.drawRating(s.rating, w / 2, textStartY + 250);
        }

        // Device below - pushed down more to avoid text
        // Device below - pushed down more to avoid text
        const deviceHeight = h * (s.deviceScale / 100) * 0.85;
        const deviceWidth = deviceHeight * 0.48;
        const deviceX = (w - deviceWidth) / 2;
        // Ensure strictly below text area (approx 450px safe zone) or use relative
        // Default text area ends around 300-400px. 
        // Let's secure it at h - deviceHeight + 100 (was 200) - shows more of the phone
        const deviceY = h - deviceHeight + 100 + posOffset;

        this.drawDevice(deviceX, deviceY, deviceWidth, deviceHeight, 0, screen.screenshot);
    }

    drawTextLeftLayout(screen) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const s = this.getSettings();
        const posOffset = (s.devicePosition / 100) * h;

        // Strict 2-Column Grid
        // Text: Left 40% (Reduced from 42% for safety)
        // GAP: 15% (Center Safe Zone)
        // Device: Right 45%

        // Text Position
        const textX = w * 0.08; // Left margin
        const textY = 300; // Use base Y
        const maxWidth = w * 0.38; // Reduced width to prevent overlap

        // Category pill
        if (s.showCategory) {
            this.drawCategoryPill(s.categoryLabel, textX + maxWidth / 2, textY - 80);
        }

        // Text (Left Aligned)
        ctx.font = `${s.fontWeight} ${s.fontSize * 3}px Inter, sans-serif`;
        ctx.fillStyle = s.textColor;
        ctx.textAlign = 'left';

        const headlineEndY = this.drawWrappedText(screen.headline, textX, textY, maxWidth, s.fontSize * 3.2, 'left');

        // Subheadline
        ctx.font = `400 ${s.fontSize * 1.2}px Inter, sans-serif`;
        ctx.fillStyle = s.textColor;
        ctx.globalAlpha = 0.7;
        this.drawWrappedText(screen.subheadline, textX, headlineEndY + s.fontSize * 0.5, maxWidth, s.fontSize * 1.8, 'left');
        ctx.globalAlpha = 1;

        if (s.showRating) {
            this.drawRating(s.rating, textX + 100, headlineEndY + 120, 'left');
        }

        // Device (Right Side)
        const deviceHeight = h * (s.deviceScale / 100) * 0.85;
        const deviceWidth = deviceHeight * 0.48;
        // Shift device slightly more to the right to ensure gap
        let deviceX = (w * 0.60) + ((w * 0.35) - deviceWidth) / 2;
        const deviceY = h * 0.15 + posOffset;

        // Collision Check: Ensure device doesn't overlap text
        // Text ends at textX + maxWidth. We add a 60px safety buffer.
        const safeX = textX + maxWidth + 60;
        if (deviceX < safeX) {
            deviceX = safeX;
        }

        const rotation = s.deviceRotation || 0;
        this.drawDevice(deviceX, deviceY, deviceWidth, deviceHeight, rotation, screen.screenshot);
    }


    drawTextRightLayout(screen) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const s = this.getSettings();
        const posOffset = (s.devicePosition / 100) * h;
        const textYOffset = (s.textPosition / 100) * h;

        // Text Position
        const maxWidth = w * 0.35;
        const textX = w * 0.62; 
        const textY = 300 + textYOffset;

        // Device (Left Side)
        const deviceHeight = h * (s.deviceScale / 100) * 0.85;
        const deviceWidth = deviceHeight * 0.48;
        const deviceX = (w * 0.275) - (deviceWidth / 2);
        const deviceY = h * 0.15 + posOffset;
        const rotation = s.deviceRotation || 0;

        this.drawDevice(deviceX, deviceY, deviceWidth, deviceHeight, rotation, screen.screenshot);

        // Category pill
        if (s.showCategory) {
            this.drawCategoryPill(s.categoryLabel, textX + maxWidth / 2, textY - 80, 'center');
        }

        // Draw Text using global helper for consistency
        const originalAlign = s.textAlign;
        s.textAlign = 'left';
        this.drawText(screen.headline, screen.subheadline, textX, textY, 'left', maxWidth);
        s.textAlign = originalAlign;

        if (s.showRating) {
            this.drawRating(s.rating, textX, textY + 400, 'left');
        }
    }

    drawPanoramaLeftLayout(screen) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const s = this.getSettings();
        const posOffset = (s.devicePosition / 100) * h;

        // Text at top
        if (screen.headline) {
            this.drawText(screen.headline, screen.subheadline, w / 2, 280, 'center');
        }

        // Device centered at RIGHT EDGE (w)
        const deviceHeight = h * (s.deviceScale / 100) * 0.8;
        const deviceWidth = deviceHeight * 0.48;
        // Center of device is at X = w
        const deviceX = w - (deviceWidth / 2);
        // Shift Down to 45% to clear text
        const deviceY = h * 0.45 + posOffset;

        this.drawDevice(deviceX, deviceY, deviceWidth, deviceHeight, s.deviceRotation || 0, screen.screenshot);
    }

    drawPanoramaRightLayout(screen) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const s = this.getSettings();
        const posOffset = (s.devicePosition / 100) * h;

        // Text at top
        if (screen.headline) {
            let textY = 280;
            if (s.showCategory) {
                this.drawCategoryPill(s.categoryLabel, w / 2, textY - 80);
            }
            const textBottomY = this.drawText(screen.headline, screen.subheadline, w / 2, textY, 'center');

            if (s.showRating) {
                this.drawRating(s.rating, w / 2, textBottomY + 40);
            }
        }

        // Device centered at LEFT EDGE (0)
        const deviceHeight = h * (s.deviceScale / 100) * 0.8;
        const deviceWidth = deviceHeight * 0.48;
        // Center of device is at X = 0
        const deviceX = -(deviceWidth / 2);
        // Shift Down to 45%
        const deviceY = h * 0.45 + posOffset;

        this.drawDevice(deviceX, deviceY, deviceWidth, deviceHeight, s.deviceRotation || 0, screen.screenshot);
    }

    drawPanoramaTiltedLeftLayout(screen) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const s = this.getSettings();
        const posOffset = (s.devicePosition / 100) * h;

        // Text at top
        if (screen.headline) {
            this.drawText(screen.headline, screen.subheadline, w / 2, 280, 'center');
        }

        // Device centered at RIGHT EDGE (w) with TILT
        const deviceHeight = h * (s.deviceScale / 100) * 0.8;
        const deviceWidth = deviceHeight * 0.48;
        const deviceX = w - (deviceWidth / 2);
        // Shift Down to 45%
        const deviceY = h * 0.45 + posOffset;

        this.drawDevice(deviceX, deviceY, deviceWidth, deviceHeight, s.deviceRotation !== undefined ? s.deviceRotation : -15, screen.screenshot);
    }

    drawPanoramaTiltedRightLayout(screen) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const s = this.getSettings();
        const posOffset = (s.devicePosition / 100) * h;

        // Text at top
        if (screen.headline) {
            this.drawText(screen.headline, screen.subheadline, w / 2, 280, 'center');
        }

        // Device centered at LEFT EDGE (0) with TILT
        const deviceHeight = h * (s.deviceScale / 100) * 0.8;
        const deviceWidth = deviceHeight * 0.48;
        const deviceX = -(deviceWidth / 2);
        // Shift Down to 45%
        const deviceY = h * 0.45 + posOffset;

        this.drawDevice(deviceX, deviceY, deviceWidth, deviceHeight, s.deviceRotation !== undefined ? s.deviceRotation : -15, screen.screenshot);
    }



    drawSpreadLayout(screen) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const s = this.getSettings();
        const posOffset = (s.devicePosition / 100) * h;

        // Text at top (optional)
        if (screen.headline) {
            let textY = 250;
            if (s.showCategory) {
                this.drawCategoryPill(s.categoryLabel, w / 2, textY - 80);
            }
            const textBottomY = this.drawText(screen.headline, screen.subheadline, w / 2, textY, 'center');

            if (s.showRating) {
                this.drawRating(s.rating, w / 2, textBottomY + 40);
            }
        }

        // 3 Devices side-by-side
        // Scale down slightly to fit 3
        const deviceHeight = h * (s.deviceScale / 100) * 0.7; // Smaller
        const deviceWidth = deviceHeight * 0.48;

        const offsetX = deviceWidth * 0.55; // Symmetry offset
        // Shift Down to 45% (was 0.35h)
        const centerY = h * 0.45 + posOffset;

        // Left Device
        this.drawDevice(((w - deviceWidth) / 2) - offsetX, centerY + 40, deviceWidth, deviceHeight, -5, screen.screenshot3 || screen.screenshot);

        // Right Device
        this.drawDevice(((w - deviceWidth) / 2) + offsetX, centerY + 40, deviceWidth, deviceHeight, 5, screen.screenshot2 || screen.screenshot);

        // Center Device (Front)
        this.drawDevice((w - deviceWidth) / 2, centerY, deviceWidth, deviceHeight, 0, screen.screenshot);
    }

    drawBigScreenLayout(screen) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const s = this.getSettings();

        // No text usually for big screen, or overlaid.
        // Let's allow text if specific position, but default behavior is cleaner.
        if (screen.headline) {
            let textY = 200;
            if (s.showCategory) {
                this.drawCategoryPill(s.categoryLabel, w / 2, textY - 80);
            }
            const textBottomY = this.drawText(screen.headline, screen.subheadline, w / 2, textY, 'center');

            if (s.showRating) {
                this.drawRating(s.rating, w / 2, textBottomY + 40);
            }
        }

        const posOffset = (s.devicePosition / 100) * h;

        // Giant Device
        // Scale > 100% of standard relative
        // Standard "100" scale is ~80% of height usually.
        // Let's make it huge.
        const deviceHeight = h * (s.deviceScale / 100) * 1.1;
        const deviceWidth = deviceHeight * 0.48;
        const deviceX = (w - deviceWidth) / 2;
        // Shift Down significantly to 300px offset (was 100) to clear optional text
        const deviceY = (h - deviceHeight) / 2 + posOffset + 300;

        this.drawDevice(deviceX, deviceY, deviceWidth, deviceHeight, s.deviceRotation || 0, screen.screenshot);
    }

    drawTiltedLayout(screen) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const s = this.getSettings();
        const posOffset = (s.devicePosition / 100) * h;

        // Text at top
        let textY = 280;
        if (s.showCategory) {
            this.drawCategoryPill(s.categoryLabel, w / 2, textY - 80);
        }
        const textBottomY = this.drawText(screen.headline, screen.subheadline, w / 2, textY, 'center');

        if (s.showRating) {
            this.drawRating(s.rating, w / 2, textBottomY + 40);
        }

        // Device tilted - pushed down to avoid text (was 0.32)
        const deviceHeight = h * (s.deviceScale / 100) * 0.68;
        const deviceWidth = deviceHeight * 0.48;
        const deviceX = (w - deviceWidth) / 2;
        // Shift Down to 45%
        const deviceY = h * 0.45 + posOffset;
        const rotation = s.deviceRotation !== undefined ? s.deviceRotation : -8;

        this.drawDevice(deviceX, deviceY, deviceWidth, deviceHeight, rotation, screen.screenshot);
    }

    drawMultiDeviceLayout(screen) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const s = this.getSettings();
        const posOffset = (s.devicePosition / 100) * h;

        // Text at top
        let textY = 280;
        if (s.showCategory) {
            this.drawCategoryPill(s.categoryLabel, w / 2, textY - 80);
        }
        const textBottomY = this.drawText(screen.headline, screen.subheadline, w / 2, textY, 'center');

        if (s.showRating) {
            this.drawRating(s.rating, w / 2, textBottomY + 40);
        }

        // Two devices - uses deviceScale
        const deviceHeight = h * (s.deviceScale / 100) * 0.72;
        const deviceWidth = deviceHeight * 0.48;

        // Shift BASE Y to 0.45h (was 0.36h and 0.32h)
        const baseY = h * 0.45 + posOffset;

        // Left device (tilted back)
        const leftX = w * 0.08;
        const leftY = baseY + (h * 0.04); // Slightly lower
        this.drawDevice(leftX, leftY, deviceWidth * 0.9, deviceHeight * 0.9, 8);

        // Right device (tilted forward)
        const rightX = w * 0.42;
        const rightY = baseY;

        // Swap image for second device if exists
        const originalImage = this.screenshotImage;
        if (screen.screenshot2) {
            this.screenshotImage = screen.screenshot2;
        }

        this.drawDevice(rightX, rightY, deviceWidth, deviceHeight, -5);

        // Restore original image
        this.screenshotImage = originalImage;
    }

    drawMultiDynamicLayout(screen) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const s = this.getSettings();
        const posOffset = (s.devicePosition / 100) * h;
        // Text Position handled in drawText globally now

        // Two devices - uses deviceScale but slightly smaller for pair fitting
        const deviceHeight = h * (s.deviceScale / 100) * 0.65;
        const deviceWidth = deviceHeight * 0.48;

        // Back Device (Top Right)
        // Positioned higher and to the right
        const backX = w * 0.45;
        // Shift UP to 0.08h (was 0.15h) to make room for bottom text
        const backY = h * 0.08 + posOffset;

        // Swap image for DIFFERENT screenshots effectively?
        // Usually back device is secondary? Let's check user intent.
        // Image shows both screens are similar effectively or different.
        // Let's assume Back Device = Screenshot 2 (if exists), Front = Screenshot 1 (Main).
        // Or vice versa? Usually primary content is front.

        const originalImage = this.screenshotImage;
        if (screen.screenshot2) {
            this.screenshotImage = screen.screenshot2;
        }
        // Draw Back Device (faded slightly via shadow or just behind? Draw first = behind)
        this.drawDevice(backX, backY, deviceWidth, deviceHeight, -15);

        // Restore for Front device
        this.screenshotImage = originalImage;

        // Front Device (Bottom Left)
        const frontX = w * 0.15;
        // Shift UP to 0.28h (was 0.35h)
        const frontY = h * 0.28 + posOffset;

        this.drawDevice(frontX, frontY, deviceWidth, deviceHeight, -15);

        // Text at BOTTOM
        const textY = frontY + deviceHeight + 100;
        if (screen.headline) {
            let finalTextY = h - 150;
            if (s.showCategory) {
                this.drawCategoryPill(s.categoryLabel, w / 2, finalTextY - 80);
            }
            const textBottomY = this.drawText(screen.headline, screen.subheadline, w / 2, finalTextY, 'center');

            if (s.showRating) {
                this.drawRating(s.rating, w / 2, textBottomY + 40);
            }
        }
    }

    drawDevice(x, y, width, height, rotation, image) {
        const ctx = this.ctx;
        const s = this.getSettings();
        const cornerRadius = width * 0.12;
        const bezelWidth = width * 0.03;

        ctx.save();

        // Apply rotation
        if (rotation !== 0) {
            ctx.translate(x + width / 2, y + height / 2);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.translate(-(x + width / 2), -(y + height / 2));
        }

        // Shadow
        const shadows = {
            none: { blur: 0, offsetY: 0, alpha: 0 },
            small: { blur: 60, offsetY: 30, alpha: 0.6 },    // Much stronger start
            medium: { blur: 100, offsetY: 50, alpha: 0.75 }, // Heavier
            large: { blur: 140, offsetY: 70, alpha: 0.9 }    // Very dark
        };
        const shadow = shadows[s.deviceShadow] || shadows['medium']; // Default to medium if undefined

        if (shadow.blur > 0) {
            ctx.shadowColor = `rgba(0, 0, 0, ${shadow.alpha})`;
            ctx.shadowBlur = shadow.blur;
            ctx.shadowOffsetY = shadow.offsetY;
        } else {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
        }

        // Device frame
        ctx.fillStyle = '#1a1a1a';
        // Ensure path is started
        ctx.beginPath();
        this.roundRect(x, y, width, height, cornerRadius);
        ctx.fill();

        // Reset shadow for screen
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Screen area
        const screenX = x + bezelWidth;
        const screenY = y + bezelWidth;
        const screenWidth = width - bezelWidth * 2;
        const screenHeight = height - bezelWidth * 2;
        const screenRadius = cornerRadius - bezelWidth;

        // Draw screenshot or placeholder
        ctx.save();
        this.roundRect(screenX, screenY, screenWidth, screenHeight, screenRadius);
        ctx.clip();

        // Use passed image, or fallback to global if undefined (but prefer passed)
        const activeImage = image !== undefined ? image : this.screenshotImage;

        if (activeImage) {
            // Draw uploaded screenshot
            const imgRatio = activeImage.width / activeImage.height;
            const screenRatio = screenWidth / screenHeight;

            let drawWidth, drawHeight, drawX, drawY;

            if (imgRatio > screenRatio) {
                drawHeight = screenHeight;
                drawWidth = drawHeight * imgRatio;
                drawX = screenX - (drawWidth - screenWidth) / 2;
                drawY = screenY;
            } else {
                drawWidth = screenWidth;
                drawHeight = drawWidth / imgRatio;
                drawX = screenX;
                drawY = screenY;
            }

            ctx.drawImage(activeImage, drawX, drawY, drawWidth, drawHeight);
        } else {
            // Placeholder screen
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(screenX, screenY, screenWidth, screenHeight);

            // Placeholder UI elements
            ctx.fillStyle = '#3a3a3a';
            ctx.fillRect(screenX + screenWidth * 0.1, screenY + screenHeight * 0.05, screenWidth * 0.8, screenHeight * 0.03);
            ctx.fillRect(screenX + screenWidth * 0.1, screenY + screenHeight * 0.12, screenWidth * 0.6, screenHeight * 0.02);
        }

        ctx.restore();

        // Dynamic island / notch (for iPhone)
        if (s.deviceFrame.includes('iphone')) {
            ctx.fillStyle = '#000';
            const notchWidth = width * 0.35;
            const notchHeight = height * 0.015;
            const notchX = x + (width - notchWidth) / 2;
            const notchY = y + bezelWidth + height * 0.008;
            this.roundRect(notchX, notchY, notchWidth, notchHeight, notchHeight / 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawText(headline, subheadline, x, y, align, customMaxWidth) {
        const ctx = this.ctx;
        const s = this.getSettings();
        const w = this.width;
        const h = this.height;
        const maxWidth = customMaxWidth || w * 0.85; 
        const lineHeight = s.fontSize * 2.8;

        const textPosOffset = ((s.textPosition || 0) / 100) * h;
        const finalY = y + textPosOffset;

        ctx.textAlign = align;
        const textX = align === 'center' ? x : (align === 'left' ? x : x); // Use passed X mostly

        ctx.font = `${s.fontWeight} ${s.fontSize * 3}px Inter, sans-serif`;
        ctx.fillStyle = s.textColor;

        const headlineY = this.drawWrappedText(headline, textX, finalY, maxWidth, lineHeight, align);

        ctx.font = `400 ${s.fontSize * 1.3}px Inter, sans-serif`;
        ctx.globalAlpha = 0.7;
        const subheadlineY = this.drawWrappedText(subheadline, textX, headlineY + s.fontSize * 1.5, maxWidth, s.fontSize * 1.8, align);
        ctx.globalAlpha = 1;

        return subheadlineY;
    }

    // Word wrap text and return the Y position after the last line
    drawWrappedText(text, x, y, maxWidth, lineHeight, align) {
        const ctx = this.ctx;

        // Split by manual line breaks first (newlines from textarea)
        const paragraphs = text.split('\n');
        let currentY = y;

        for (const paragraph of paragraphs) {
            const words = paragraph.split(' ');
            let line = '';

            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);

                if (metrics.width > maxWidth && line !== '') {
                    ctx.fillText(line.trim(), x, currentY);
                    line = word + ' ';
                    currentY += lineHeight;
                } else {
                    line = testLine;
                }
            }

            // Draw remaining text in this paragraph
            if (line.trim()) {
                ctx.fillText(line.trim(), x, currentY);
                currentY += lineHeight;
            }
        }

        return currentY;
    }

    drawCategoryPill(label, x, y, align = 'center') {
        const ctx = this.ctx;
        const s = this.settings;

        ctx.font = `500 ${s.fontSize * 0.8}px Inter, sans-serif`;
        const textWidth = ctx.measureText(label).width;
        const pillWidth = textWidth + 60;
        const pillHeight = s.fontSize * 1.2;

        ctx.fillStyle = s.textColor;
        ctx.globalAlpha = 0.1;

        const pillX = x + (s.categoryX || 0);
        const pillY = y + (s.categoryY || 0);

        if (align === 'left') {
            this.roundRect(pillX, pillY - pillHeight / 2, pillWidth, pillHeight, pillHeight / 2);
        } else {
            this.roundRect(pillX - pillWidth / 2, pillY - pillHeight / 2, pillWidth, pillHeight, pillHeight / 2);
        }

        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = s.textColor;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';

        if (align === 'left') {
            ctx.fillText(label, pillX + 30, pillY);
        } else {
            ctx.fillText(label, pillX, pillY);
        }

        ctx.textBaseline = 'alphabetic';
    }

    drawRating(rating, x, y, align = 'center') {
        const ctx = this.ctx;
        const s = this.settings;

        const offsetX = s.ratingX || 0;
        const offsetY = s.ratingY || 0;

        // Rating text
        ctx.font = `600 ${s.fontSize * 1.2}px Inter, sans-serif`;
        ctx.fillStyle = s.textColor;
        ctx.textAlign = align;
        ctx.fillText(`${rating} App Store`, x + offsetX, y + offsetY);

        // Stars
        ctx.font = `${s.fontSize}px sans-serif`;
        ctx.fillText('★★★★★', x + offsetX, y + offsetY + s.fontSize * 1.5);
    }

    roundRect(x, y, width, height, radius) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    async exportScreenshot() {
        const downloadBtn = document.getElementById('downloadExport');
        const originalText = downloadBtn.textContent;
        downloadBtn.disabled = true;
        downloadBtn.textContent = 'Preparing...';

        try {
            const zip = new JSZip();
            const appName = document.getElementById('appName').value || 'app-screenshots';
            const folder = zip.folder(appName);

            // Define target sizes
            const targets = [
                { name: 'iPhone-6.7', w: 1290, h: 2796 },
                { name: 'iPhone-6.5', w: 1284, h: 2778 },
                { name: 'iPhone-5.5', w: 1242, h: 2208 }
            ];

            // Get selected targets (all checkboxes in export modal)
            const selectedIndices = [];
            const checkboxes = document.querySelectorAll('#exportModal .export-option input');
            checkboxes.forEach((cb, i) => {
                if (cb.checked) selectedIndices.push(i);
            });

            if (selectedIndices.length === 0) {
                this.showToast('Please select at least one size.', 'error');
                return;
            }

            // Create an off-screen canvas for high-res rendering
            const offCanvas = document.createElement('canvas');
            const offCtx = offCanvas.getContext('2d');
            
            // Store original canvas/ctx to swap back
            const mainCanvas = this.canvas;
            const mainCtx = this.ctx;
            const mainW = this.width;
            const mainH = this.height;

            // Loop through all screens
            for (let i = 0; i < this.screens.length; i++) {
                const screen = this.screens[i];
                downloadBtn.textContent = `Rendering ${i + 1}/${this.screens.length}...`;

                // Loop through selected sizes
                for (const sizeIdx of selectedIndices) {
                    const target = targets[sizeIdx];
                    
                    // Set off-screen canvas size
                    offCanvas.width = target.w;
                    offCanvas.height = target.h;
                    
                    // Temporarily point class to off-screen context
                    this.canvas = offCanvas;
                    this.ctx = offCtx;
                    this.width = target.w;
                    this.height = target.h;
                    this.screenshotImage = screen.screenshot;

                    // Render the screen
                    this.render(screen);

                    // Convert to blob
                    const blob = await new Promise(resolve => offCanvas.toBlob(resolve, 'image/png'));
                    folder.file(`${i + 1}-${target.name}.png`, blob);
                }
            }

            // Restore main canvas
            this.canvas = mainCanvas;
            this.ctx = mainCtx;
            this.width = mainW;
            this.height = mainH;
            this.render(); // Re-render current screen on main canvas

            // Generate ZIP
            downloadBtn.textContent = 'Zipping...';
            const content = await zip.generateAsync({ type: "blob" });
            
            const fileName = `${appName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'app-screenshots'}-exports.zip`;

            // Try the modern File System Access API first (forces native OS save dialog, completely bypassing webview bugs)
            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: fileName,
                        types: [{
                            description: 'ZIP Archive',
                            accept: { 'application/zip': ['.zip'] },
                        }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(content);
                    await writable.close();
                    
                    this.showToast('Export successful!');
                    document.getElementById('exportModal').classList.remove('active');
                    return; // Success!
                } catch (err) {
                    // If user cancelled, just return
                    if (err.name === 'AbortError') return;
                    console.warn('showSaveFilePicker failed, falling back to anchor download:', err);
                }
            }
            
            // Fallback: Construct Data URI for legacy environments
            const base64 = await zip.generateAsync({ type: "base64" });
            const dataUrl = 'data:application/zip;base64,' + base64;
            
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = fileName;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            this.showToast('Export successful!');
            document.getElementById('exportModal').classList.remove('active');
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Export failed. Please try again.', 'error');
        } finally {
            downloadBtn.disabled = false;
            downloadBtn.textContent = originalText;
        }
    }

    deleteScreen(index) {
        if (this.screens.length <= 1) {
            this.showToast('At least one screen is required.', 'error');
            return;
        }

        if (confirm('Are you sure you want to delete this screen?')) {
            this.screens.splice(index, 1);
            if (this.currentScreen > this.screens.length) {
                this.currentScreen = this.screens.length;
            }
            this.updateScreenNavButtons();
            this.loadScreenData();
            this.renderAllScreens();
            this.render();
            this.saveProject();
        }
    }

    async saveProject() {
        try {
            const projectData = {
                appName: document.getElementById('appName').value,
                settings: this.settings,
                screens: this.screens.map(s => ({
                    ...s,
                    screenshot: null,
                    screenshot2: null,
                    screenshot3: null,
                    screenshotSrc: s.screenshot ? s.screenshot.src : null,
                    screenshot2Src: s.screenshot2 ? s.screenshot2.src : null,
                    screenshot3Src: s.screenshot3 ? s.screenshot3.src : null
                })),
                currentScreen: this.currentScreen
            };
            
            await this.storage.saveProject(projectData);

            // Visual feedback
            const status = document.getElementById('saveStatus');
            if (status) {
                status.classList.add('active');
                if (this._saveTimeout) clearTimeout(this._saveTimeout);
                this._saveTimeout = setTimeout(() => {
                    status.classList.remove('active');
                }, 2000);
            }
        } catch (e) {
            console.warn('Auto-save failed:', e);
        }
    }

    // History Management
    async saveToHistory(customName, type = 'Auto Designer') {
        try {
            const currentAppName = customName || document.getElementById('appName')?.value || this.screens[0]?.appName || 'Unnamed Project';
            const firstScreen = this.screens[0] || {};
            const snapshot = {
                id: Date.now(),
                timestamp: new Date().toLocaleString(),
                appName: currentAppName,
                type: type,
                tagline: firstScreen.headline || '',
                screenCount: this.screens.length,
                data: {
                    screens: this.screens.map(s => ({
                        ...s,
                        screenshot: null,
                        screenshot2: null,
                        screenshot3: null,
                        screenshotSrc: s.screenshot ? s.screenshot.src : null,
                        screenshot2Src: s.screenshot2 ? s.screenshot2.src : null,
                        screenshot3Src: s.screenshot3 ? s.screenshot3.src : null
                    })),
                    settings: { ...this.settings, appIcon: null }
                }
            };

            // 1. Primary IndexedDB Storage
            try {
                await this.storage.saveHistory(snapshot);
            } catch (idbErr) {
                console.warn('IndexedDB history save error:', idbErr);
            }

            // 2. Resilient LocalStorage Backup (keeps last 20 generations)
            try {
                const lsHistory = JSON.parse(localStorage.getItem('asoHistoryBackup') || '[]');
                lsHistory.unshift(snapshot);
                if (lsHistory.length > 20) lsHistory.pop();
                localStorage.setItem('asoHistoryBackup', JSON.stringify(lsHistory));
            } catch (lsErr) {
                // If storage quota reached with base64 images, save lightweight version without heavy image strings
                try {
                    const lsHistory = JSON.parse(localStorage.getItem('asoHistoryBackup') || '[]');
                    const lightSnapshot = {
                        ...snapshot,
                        data: {
                            ...snapshot.data,
                            screens: snapshot.data.screens.map(sc => ({
                                ...sc,
                                screenshotSrc: null,
                                screenshot2Src: null,
                                screenshot3Src: null
                            }))
                        }
                    };
                    lsHistory.unshift(lightSnapshot);
                    if (lsHistory.length > 20) lsHistory.pop();
                    localStorage.setItem('asoHistoryBackup', JSON.stringify(lsHistory));
                } catch (e) {}
            }

            this.showToast('Saved to generation history!', 'success');
        } catch (e) {
            console.error('History save failed:', e);
            this.showToast('Saved to backup history.', 'warning');
        }
    }

    saveToHistoryLight() {
        const history = JSON.parse(localStorage.getItem('asoHistory') || '[]');
        const snapshot = {
            id: Date.now(),
            timestamp: new Date().toLocaleString() + ' (No Images)',
            appName: document.getElementById('appName').value || 'Unnamed Project',
            screenCount: this.screens.length,
            data: {
                screens: this.screens.map(s => ({
                    headline: s.headline,
                    subheadline: s.subheadline,
                    template: s.template,
                    textAlign: s.textAlign,
                    bgColor1: s.bgColor1,
                    bgColor2: s.bgColor2,
                    textColor: s.textColor,
                    bgType: s.bgType
                })),
                settings: { ...this.settings, appIcon: null }
            }
        };
        history.unshift(snapshot);
        if (history.length > 10) history.pop();
        localStorage.setItem('asoHistory', JSON.stringify(history));
    }

    async renderHistory() {
        let history = [];
        try {
            history = await this.storage.getHistory();
        } catch (e) {
            console.warn('IndexedDB getHistory failed:', e);
        }

        // Merge with or fallback to localStorage backup if IndexedDB is empty
        if (!history || history.length === 0) {
            try {
                history = JSON.parse(localStorage.getItem('asoHistoryBackup') || localStorage.getItem('asoHistory') || '[]');
            } catch (e) {}
        } else {
            // Also merge any items from localStorage that might not be in IndexedDB
            try {
                const lsHistory = JSON.parse(localStorage.getItem('asoHistoryBackup') || '[]');
                lsHistory.forEach(lsItem => {
                    if (!history.some(h => h.id === lsItem.id)) {
                        history.push(lsItem);
                    }
                });
                history.sort((a, b) => b.id - a.id);
            } catch (e) {}
        }

        const container = document.getElementById('historyList');
        if (!container) return;
        
        if (!history || history.length === 0) {
            container.innerHTML = '<div class="empty-state" style="padding: 2.5rem 1rem; text-align: center; color: #a1a1aa;"><p style="font-size: 1rem; margin-bottom: 0.5rem; color: #f4f4f5;">No history yet</p><p style="font-size: 0.85rem;">Generate screenshots with <strong>⚡️ Auto Designer</strong> or <strong>✨ AI Designer</strong> to see your history here.</p></div>';
            return;
        }

        container.innerHTML = '';
        history.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'history-item';
            card.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; background: #27272a; border-radius: 12px; margin-bottom: 0.75rem; border: 1px solid #3f3f46;';

            const typeColor = item.type === 'AI Designer' ? '#818cf8' : '#34d399';
            const typeLabel = item.type || 'Auto Designer';
            const headlinePreview = item.tagline || item.data?.screens?.[0]?.headline || '';

            card.innerHTML = `
                <div class="history-item__info" style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 700; color: #fff; font-size: 1rem;">${item.appName || 'Unnamed Project'}</span>
                        <span style="font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 999px; background: rgba(255, 255, 255, 0.08); color: ${typeColor}; border: 1px solid ${typeColor}40;">${typeLabel}</span>
                    </div>
                    ${headlinePreview ? `<div style="font-size: 12px; color: #d4d4d8; font-style: italic;">"${headlinePreview}"</div>` : ''}
                    <div style="font-size: 11px; color: #a1a1aa;">${item.timestamp} • ${item.screenCount || 5} screens</div>
                </div>
                <div class="history-item__actions" style="display: flex; gap: 0.5rem;">
                    <button class="btn btn--sm btn--primary restore-btn" style="padding: 0.5rem 1rem;">Restore</button>
                    <button class="btn btn--sm btn--outline delete-btn" style="color: #ef4444; border-color: #ef4444; padding: 0.5rem 0.75rem;">Delete</button>
                </div>
            `;

            card.querySelector('.restore-btn').onclick = (e) => {
                e.preventDefault();
                this.restoreFromHistory(item);
            };
            card.querySelector('.delete-btn').onclick = (e) => {
                e.preventDefault();
                this.deleteHistoryItem(item.id);
            };

            container.appendChild(card);
        });
    }

    async restoreFromHistory(item) {
        if (!item) return;

        this.showToast('Restoring project...');
        
        try {
            // Restore Global Settings
            if (item.data.settings) {
                this.settings = { ...this.settings, ...item.data.settings };
                // Restore app name to input
                if (item.appName) document.getElementById('appName').value = item.appName;
            }
            
            // Restore screens with deep property merging
            this.screens = item.data.screens.map(s => {
                // Merge with defaults to ensure new properties like rotation exist
                const newScreen = { ...this.createNewScreen(), ...s };
                
                // Re-create images from stored sources
                const src = s.screenshotSrc || s.screenshot?.src;
                if (src) {
                    const img = new Image();
                    img.src = src;
                    newScreen.screenshot = img;
                    img.onload = () => this.render(); // Re-render when image arrives
                }

                const src2 = s.screenshot2Src || s.screenshot2?.src;
                if (src2) {
                    const img = new Image();
                    img.src = src2;
                    newScreen.screenshot2 = img;
                    img.onload = () => this.render();
                }

                const src3 = s.screenshot3Src || s.screenshot3?.src;
                if (src3) {
                    const img = new Image();
                    img.src = src3;
                    newScreen.screenshot3 = img;
                    img.onload = () => this.render();
                }
                
                return newScreen;
            });

            this.currentScreen = 1;
            this.updateScreenNavButtons();
            this.loadScreenData();
            this.renderAllScreens();
            this.render();
            this.saveProject();
            
            document.getElementById('historyModal').classList.remove('active');
            this.showToast('History restored successfully!');
        } catch (error) {
            console.error('Restore failed:', error);
            this.showToast('Failed to restore history: ' + error.message, 'error');
        }
    }

    renderTextEditor() {
        const container = document.getElementById('textEditorList');
        container.innerHTML = '';

        this.screens.forEach((screen, index) => {
            const row = document.createElement('div');
            row.style.cssText = 'display: grid; grid-template-columns: 80px 1fr 1.5fr; gap: 1rem; align-items: start; background: #27272a; padding: 1.25rem; border-radius: 12px; border: 1px solid #3f3f46;';
            
            // Thumbnail or screen number
            const thumb = document.createElement('div');
            thumb.style.cssText = 'width: 60px; height: 100px; background: #18181b; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #3f3f46; overflow: hidden; position: relative;';
            if (screen.screenshot) {
                thumb.innerHTML = `<img src="${screen.screenshot.src}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.5;">`;
                thumb.innerHTML += `<span style="position: absolute; z-index: 1; color: #fff;">#${index + 1}</span>`;
            } else {
                thumb.textContent = `#${index + 1}`;
            }

            row.innerHTML = `
                ${thumb.outerHTML}
                <div class="form-group" style="margin: 0;">
                    <label style="font-size: 11px; text-transform: uppercase; color: #888; display: block; margin-bottom: 4px;">Headline</label>
                    <textarea class="form-input batch-headline" data-index="${index}" style="min-height: 80px; font-size: 13px;">${screen.headline}</textarea>
                </div>
                <div class="form-group" style="margin: 0;">
                    <label style="font-size: 11px; text-transform: uppercase; color: #888; display: block; margin-bottom: 4px;">Subheadline</label>
                    <textarea class="form-input batch-subheadline" data-index="${index}" style="min-height: 80px; font-size: 13px;">${screen.subheadline}</textarea>
                </div>
            `;
            container.appendChild(row);
        });
    }

    saveAllTextFromEditor() {
        const headlines = document.querySelectorAll('.batch-headline');
        const subheadlines = document.querySelectorAll('.batch-subheadline');

        headlines.forEach(el => {
            const idx = parseInt(el.dataset.index);
            if (this.screens[idx]) this.screens[idx].headline = el.value;
        });

        subheadlines.forEach(el => {
            const idx = parseInt(el.dataset.index);
            if (this.screens[idx]) this.screens[idx].subheadline = el.value;
        });

        this.loadScreenData();
        this.renderAllScreens();
        this.render();
        this.saveProject();
    }

    async deleteHistoryItem(id) {
        try {
            await this.storage.deleteHistory(id);
        } catch (e) {
            console.warn('IDB delete error:', e);
        }
        try {
            const lsHistory = JSON.parse(localStorage.getItem('asoHistoryBackup') || '[]');
            const filtered = lsHistory.filter(item => item.id !== id);
            localStorage.setItem('asoHistoryBackup', JSON.stringify(filtered));
        } catch (e) {}
        try {
            const lsHistory2 = JSON.parse(localStorage.getItem('asoHistory') || '[]');
            const filtered2 = lsHistory2.filter(item => item.id !== id);
            localStorage.setItem('asoHistory', JSON.stringify(filtered2));
        } catch (e) {}
        this.renderHistory();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ScreenshotGenerator();
});
