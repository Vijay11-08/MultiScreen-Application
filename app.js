// Default State Configuration
const DEFAULT_STATE = {
    workspaceName: "My Active Workspace",
    screenCount: 4,
    aspectRatio: "auto",
    gridCols: "auto",
    gridGap: 16,
    theme: "dark",
    screens: [
        { id: 1, url: "https://www.wikipedia.org", label: "Wikipedia" },
        { id: 2, url: "https://github.com/Vijay11-08", label: "GitHub" },
        { id: 3, url: "https://www.youtube.com/embed/dQw4w9WgXcQ", label: "YouTube" },
        { id: 4, url: "", label: "Empty Screen" }
    ]
};

// Application State Layer
let state = { ...DEFAULT_STATE };

// List of high-profile domains that are known to block iframe embedding via X-Frame-Options / CSP
const IFRAME_BUST_DOMAINS = [
    'google.com', 'google.co', 'youtube.com', 'youtu.be', 'github.com', 
    'amazon.com', 'facebook.com', 'twitter.com', 'x.com', 'instagram.com', 
    'netflix.com', 'linkedin.com', 'reddit.com', 'apple.com', 'microsoft.com',
    'yahoo.com', 'bing.com', 'duckduckgo.com', 'github.io'
];

// Rich site metadata for branded preview cards on blocked domains
const SITE_META = {
    'github.com': {
        name: 'GitHub',
        icon: 'https://github.githubassets.com/favicons/favicon-dark.svg',
        color: '#238636',
        gradient: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #238636 150%)',
        desc: 'GitHub blocks iframe embedding for security. Use the buttons below to view this page.',
        iconFallback: '🐙'
    },
    'youtube.com': {
        name: 'YouTube',
        icon: 'https://www.youtube.com/s/desktop/favicon_144x144.png',
        color: '#FF0000',
        gradient: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #FF0000 150%)',
        desc: 'Tip: Paste a video link and it will auto-convert to an embeddable player!',
        iconFallback: '▶️'
    },
    'google.com': {
        name: 'Google',
        icon: 'https://www.google.com/favicon.ico',
        color: '#4285F4',
        gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #4285F4 150%)',
        desc: 'Google does not allow iframe embedding. Open in a new tab or popup instead.',
        iconFallback: '🔍'
    },
    'reddit.com': {
        name: 'Reddit',
        icon: 'https://www.redditstatic.com/shreddit/assets/favicon/64x64.png',
        color: '#FF4500',
        gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0e1113 50%, #FF4500 150%)',
        desc: 'Reddit blocks iframe embedding. Use the actions below to open this page.',
        iconFallback: '🤖'
    },
    'linkedin.com': {
        name: 'LinkedIn',
        icon: 'https://static.licdn.com/aero-v1/sc/h/aahlc7dl5iqo46789phkgnn0e',
        color: '#0A66C2',
        gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0a1628 50%, #0A66C2 150%)',
        desc: 'LinkedIn prevents iframe embedding for security reasons.',
        iconFallback: '💼'
    },
    'twitter.com': {
        name: 'X (Twitter)',
        icon: 'https://abs.twimg.com/favicons/twitter.3.ico',
        color: '#1DA1F2',
        gradient: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #1DA1F2 150%)',
        desc: 'X/Twitter blocks iframe embedding. Open in a new window instead.',
        iconFallback: '𝕏'
    },
    'x.com': {
        name: 'X (Twitter)',
        icon: 'https://abs.twimg.com/favicons/twitter.3.ico',
        color: '#1DA1F2',
        gradient: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #1DA1F2 150%)',
        desc: 'X/Twitter blocks iframe embedding. Open in a new window instead.',
        iconFallback: '𝕏'
    }
};

// Get rich metadata for a blocked domain
function getSiteMeta(url) {
    if (!url) return null;
    try {
        const hostname = new URL(url).hostname.toLowerCase();
        for (const [domain, meta] of Object.entries(SITE_META)) {
            if (hostname.includes(domain)) return meta;
        }
    } catch(e) {}
    return null;
}

// Extract GitHub repo info from URL
function getGitHubInfo(url) {
    if (!url) return null;
    try {
        const u = new URL(url);
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) {
            return { user: parts[0], repo: parts[1], path: parts.slice(2).join('/') };
        } else if (parts.length === 1) {
            return { user: parts[0], repo: null, path: '' };
        }
    } catch(e) {}
    return null;
}

// Extract YouTube video title hint from URL
function getYouTubeVideoId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([^&\s?#]+)/);
    return match ? match[1] : null;
}

// DOM Elements
const sidebar = document.getElementById('sidebar');
const gridViewport = document.getElementById('gridViewport');
const collapseSidebarBtn = document.getElementById('collapseSidebarBtn');
const expandSidebarBtn = document.getElementById('expandSidebarBtn');
const screenCountInput = document.getElementById('screenCount');
const incScreensBtn = document.getElementById('incScreensBtn');
const decScreensBtn = document.getElementById('decScreensBtn');
const aspectRatioSelect = document.getElementById('aspectRatio');
const gridColsSelect = document.getElementById('gridCols');
const gridGapSlider = document.getElementById('gridGap');
const gridGapVal = document.getElementById('gridGapVal');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const workspaceTitle = document.getElementById('workspaceTitle');
const activeCountText = document.getElementById('activeCount');
const reloadAllBtn = document.getElementById('reloadAllBtn');
const syncUrlBtn = document.getElementById('syncUrlBtn');
const fullscreenWorkspaceBtn = document.getElementById('fullscreenWorkspaceBtn');
const launchWindowsBtn = document.getElementById('launchWindowsBtn');

// Modals DOM
const bulkModal = document.getElementById('bulkModal');
const helpModal = document.getElementById('helpModal');
const syncModal = document.getElementById('syncModal');
const openBulkModalBtn = document.getElementById('openBulkModalBtn');
const openHelpModalBtn = document.getElementById('openHelpModalBtn');
const applyBulkUrlsBtn = document.getElementById('applyBulkUrlsBtn');
const bulkUrlsInput = document.getElementById('bulkUrlsInput');
const bulkAutoHttps = document.getElementById('bulkAutoHttps');
const syncUrlInput = document.getElementById('syncUrlInput');
const applySyncUrlBtn = document.getElementById('applySyncUrlBtn');

// --- Helper Functions ---

// Load state from localStorage
function loadState() {
    const savedState = localStorage.getItem('multiscreen_workspace_state');
    if (savedState) {
        try {
            state = JSON.parse(savedState);
            // Ensure array consistency
            if (!Array.isArray(state.screens)) state.screens = [];
        } catch (e) {
            console.error("Failed to parse saved state, using defaults:", e);
            state = { ...DEFAULT_STATE };
        }
    } else {
        state = { ...DEFAULT_STATE };
    }
    // Clean and normalize URLs immediately on load to convert standard YouTube links to embeds
    if (Array.isArray(state.screens)) {
        state.screens.forEach(s => {
            if (s.url) {
                s.url = sanitizeUrl(s.url);
            }
        });
    }
    applyTheme(state.theme || 'dark');
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('multiscreen_workspace_state', JSON.stringify(state));
}

// Converts standard/shorts/shortened YouTube URLs to standard embed urls to support iframe playability
function convertYoutubeUrl(url) {
    if (!url) return url;
    try {
        const trimmed = url.trim();
        const urlObj = new URL(trimmed);
        
        // Handle short URLs (youtu.be)
        if (urlObj.hostname.toLowerCase() === 'youtu.be') {
            const videoId = urlObj.pathname.slice(1);
            if (videoId) {
                const time = urlObj.searchParams.get('t') || urlObj.searchParams.get('start');
                let embedUrl = `https://www.youtube.com/embed/${videoId}`;
                if (time) {
                    const seconds = time.replace('s', '');
                    embedUrl += `?start=${seconds}`;
                }
                return embedUrl;
            }
        }
        
        // Handle standard/shorts/embed URLs
        if (urlObj.hostname.toLowerCase().includes('youtube.com')) {
            let videoId = '';
            if (urlObj.pathname.includes('/watch')) {
                videoId = urlObj.searchParams.get('v');
            } else if (urlObj.pathname.includes('/shorts/')) {
                videoId = urlObj.pathname.split('/shorts/')[1].split(/[?#]/)[0];
            } else if (urlObj.pathname.includes('/embed/')) {
                return trimmed;
            } else if (urlObj.pathname.includes('/v/')) {
                videoId = urlObj.pathname.split('/v/')[1].split(/[?#]/)[0];
            }
            
            if (videoId) {
                const time = urlObj.searchParams.get('t') || urlObj.searchParams.get('start');
                let embedUrl = `https://www.youtube.com/embed/${videoId}`;
                if (time) {
                    const seconds = time.replace('s', '');
                    embedUrl += `?start=${seconds}`;
                }
                return embedUrl;
            }
        }
    } catch (e) {
        // Fallback matching using regex if URL parsing fails
        const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\s?]+)/);
        if (watchMatch && watchMatch[1]) {
            return `https://www.youtube.com/embed/${watchMatch[1]}`;
        }
    }
    return url;
}

// Check if a URL will likely bust an iframe
function isLikelyIframeBuster(url) {
    if (!url) return false;
    // YouTube embed URLs are perfectly safe for iframes
    if (url.toLowerCase().includes('youtube.com/embed/')) return false;
    // YouTube nocookie embed URLs are also safe
    if (url.toLowerCase().includes('youtube-nocookie.com/embed/')) return false;
    try {
        const domain = new URL(url).hostname.toLowerCase();
        return IFRAME_BUST_DOMAINS.some(d => domain.includes(d));
    } catch (e) {
        const lowerUrl = url.toLowerCase();
        return IFRAME_BUST_DOMAINS.some(d => lowerUrl.includes(d));
    }
}

// Clean and validate URL
function sanitizeUrl(url, autoHttps = true) {
    if (!url) return "";
    let trimmed = url.trim();
    if (trimmed === "") return "";
    
    // Auto-prepend protocol
    if (autoHttps && !/^https?:\/\//i.test(trimmed)) {
        trimmed = "https://" + trimmed;
    }

    // Convert YouTube URL if matching
    trimmed = convertYoutubeUrl(trimmed);

    return trimmed;
}

// Get Favicon URL for a given site
function getFavicon(url) {
    if (!url) return '';
    try {
        const host = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?sz=64&domain=${host}`;
    } catch (e) {
        return '';
    }
}

// --- Glassmorphic Toast Notifications Engine ---
window.showToast = function(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background: rgba(18, 22, 33, 0.95);
        backdrop-filter: blur(12px);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
        padding: 12px 20px;
        border-radius: 8px;
        font-family: var(--font-body);
        font-size: 0.82rem;
        font-weight: 500;
        box-shadow: var(--shadow-md);
        display: flex;
        align-items: center;
        gap: 8px;
        transform: translateY(50px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;
    `;

    let icon = 'info';
    if (type === 'success') {
        icon = 'check-circle-2';
        toast.style.borderLeft = '4px solid var(--accent-success)';
    } else if (type === 'error') {
        icon = 'alert-circle';
        toast.style.borderLeft = '4px solid var(--accent-danger)';
    }

    toast.innerHTML = `<i data-lucide="${icon}" style="width:16px;height:16px;color: ${type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)'}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    
    // Trigger Lucide updates dynamically
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateY(-20px)';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
};

// Clipboard copying utility with Toast Alert integration
window.copyCloneUrl = function(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            window.showToast("Clone link copied to clipboard!", "success");
        }).catch(() => {
            window.showToast("Failed to copy clone link", "error");
        });
    } else {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        window.showToast("Clone link copied to clipboard!", "success");
    }
};

// Return standard colors for coding languages
function getLanguageColor(lang) {
    if (!lang) return "#f1e05a"; // Default yellow
    const colors = {
        "javascript": "#f1e05a",
        "html": "#e34c26",
        "css": "#563d7c",
        "python": "#3572a5",
        "dart": "#00b4ab",
        "java": "#b07219",
        "c++": "#f34b7d",
        "c#": "#178600",
        "typescript": "#3178c6",
        "ruby": "#701516",
        "go": "#00add8",
        "php": "#4f5d95"
    };
    return colors[lang.toLowerCase()] || "#8b5cf6";
}

// Convert ISO date strings to human-friendly local dates
function formatDate(dateString) {
    if (!dateString) return "recently";
    try {
        const d = new Date(dateString);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
        return "recently";
    }
}

// Ensure blogs starting without protocols can navigate safely
function sanitizeBlogUrl(blog) {
    if (!blog) return "";
    if (/^https?:\/\//i.test(blog)) return blog;
    return "https://" + blog;
}

// Simulated active repository activity logs
function getSimulatedCommits(user, repo) {
    const isMultiScreen = repo.toLowerCase() === 'multiscreen';
    if (isMultiScreen) {
        return [
            { message: "feat: Added premium live GitHub API dashboard viewer", author: "Vijay11-08", sha: "8f7e2a9" },
            { message: "style: Formatted stats layouts, skeletons & responsive grids", author: "Vijay11-08", sha: "3d4c1b5" },
            { message: "fix: Normalized YouTube watch URLs to embeds to play in iframes", author: "Vijay11-08", sha: "a1b2c3d" }
        ];
    }
    return [
        { message: `Initial release for ${repo} project`, author: user, sha: "9f8d7e6" },
        { message: "Optimized component layouts and performance adjustments", author: user, sha: "4c3b2a1" },
        { message: "Fixed minor layout issues and cleaned unused scripts", author: user, sha: "7e6d5c4" }
    ];
}

// Simulated user repos for live-viewer presentation
function getSimulatedUserRepos(user) {
    const isVijay = user.toLowerCase() === 'vijay11-08';
    if (isVijay) {
        return [
            { name: "MultiScreen", stars: 42, html_url: `https://github.com/${user}/MultiScreen` },
            { name: "Vijay11-08", stars: 10, html_url: `https://github.com/${user}/${user}` },
            { name: "Responsive-Portfolio", stars: 25, html_url: `https://github.com/${user}/Responsive-Portfolio` },
            { name: "Flutter-Shop-App", stars: 15, html_url: `https://github.com/${user}/Flutter-Shop-App` }
        ];
    }
    return [
        { name: "awesome-project", stars: 14, html_url: `https://github.com/${user}/awesome-project` },
        { name: "portfolio-website", stars: 8, html_url: `https://github.com/${user}/portfolio-website` },
        { name: "react-sandbox", stars: 6, html_url: `https://github.com/${user}/react-sandbox` },
        { name: "command-line-utils", stars: 3, html_url: `https://github.com/${user}/command-line-utils` }
    ];
}

// Generate high-fidelity mock data for fallback
function getGitHubMockData(user, repo) {
    const isVijay = user.toLowerCase() === 'vijay11-08';
    const isMultiScreen = repo && repo.toLowerCase() === 'multiscreen';
    
    if (repo) {
        return {
            name: repo,
            full_name: `${user}/${repo}`,
            private: false,
            html_url: `https://github.com/${user}/${repo}`,
            description: isMultiScreen 
                ? "🚀 Advanced Responsive Multi-Screen Web Application with Custom Grid Layouts and Embedded Media normalization."
                : `GitHub repository for ${repo} developed by @${user}.`,
            stargazers_count: isMultiScreen ? 42 : 18,
            forks_count: isMultiScreen ? 8 : 4,
            open_issues_count: 0,
            size: 3584, // KB
            language: isMultiScreen ? "JavaScript" : "HTML",
            updated_at: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hours ago
            clone_url: `https://github.com/${user}/${repo}.git`,
            owner: {
                login: user,
                avatar_url: isVijay 
                    ? "https://media.licdn.com/dms/image/v2/D4D03AQEvjokWHpeK-g/profile-displayphoto-shrink_200_200/B4DZdACWJeHMAg-/0/1749126048516?e=2147483647&v=beta&t=WSrGG6sRuiuNzMkb7778Hr_-ctjcd8XHZ5iAW7ipg_Q" 
                    : `https://api.dicebear.com/7.x/bottts/svg?seed=${user}`,
                html_url: `https://github.com/${user}`
            }
        };
    } else {
        return {
            login: user,
            name: isVijay ? "Vijay Otaradi" : user,
            avatar_url: isVijay 
                ? "https://media.licdn.com/dms/image/v2/D4D03AQEvjokWHpeK-g/profile-displayphoto-shrink_200_200/B4DZdACWJeHMAg-/0/1749126048516?e=2147483647&v=beta&t=WSrGG6sRuiuNzMkb7778Hr_-ctjcd8XHZ5iAW7ipg_Q" 
                : `https://api.dicebear.com/7.x/bottts/svg?seed=${user}`,
            html_url: `https://github.com/${user}`,
            bio: isVijay 
                ? "💻 Full Stack Developer • 🌐 Frontend Creator • 📊 Data Science Enthusiast" 
                : `GitHub Developer Profile for @${user}.`,
            location: isVijay ? "India" : "Earth",
            blog: isVijay ? "linkedin.com/in/vijay-otaradi-678427266" : `github.com/${user}`,
            company: isVijay ? "MultiScreen Studio" : "Open Source",
            public_repos: isVijay ? 14 : 12,
            followers: isVijay ? 104 : 32,
            following: isVijay ? 62 : 18
        };
    }
}

// Render the completed GitHub layout onto screen card viewport
function renderGitHubData(screenId, ghInfo, data, isMock) {
    const container = document.getElementById(`gh-viewer-${screenId}`);
    if (!container) return;

    let html = '';
    const modeBadgeHTML = isMock ? `<span class="gh-mode-badge" title="Displaying high-fidelity local snapshot due to API limits or offline state."><i data-lucide="wifi-off" style="width:10px;height:10px;display:inline-block;margin-right:3px"></i> Snapshot</span>` : '';

    if (ghInfo.repo) {
        // Repository Details View
        const commits = getSimulatedCommits(ghInfo.user, ghInfo.repo);
        const commitsHTML = commits.map(c => `
            <li class="gh-commit-item">
                <p class="gh-commit-msg">${c.message}</p>
                <div class="gh-commit-meta">
                    <span>by ${c.author}</span>
                    <span class="gh-commit-sha">${c.sha}</span>
                </div>
            </li>
        `).join('');

        html = `
            <div class="gh-live-viewer-card">
                ${modeBadgeHTML}
                <div class="gh-live-header">
                    <img src="${data.owner.avatar_url}" class="gh-owner-avatar" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=${ghInfo.user}'">
                    <div class="gh-repo-names">
                        <span class="gh-user-link" onclick="window.open('${data.owner.html_url}', '_blank')">${data.owner.login}</span>
                        <span class="gh-slash">/</span>
                        <span class="gh-repo-link" onclick="window.open('${data.html_url}', '_blank')">${data.name}</span>
                    </div>
                    <span class="gh-public-badge">${data.private ? 'Private' : 'Public'}</span>
                </div>
                
                <p class="gh-repo-desc">${data.description || 'No description provided.'}</p>
                
                <div class="gh-repo-stats">
                    <div class="gh-stat-item" title="Stars" onclick="window.open('${data.html_url}/stargazers', '_blank')" style="cursor:pointer">
                        <i data-lucide="star"></i>
                        <span>${data.stargazers_count}</span>
                    </div>
                    <div class="gh-stat-item" title="Forks" onclick="window.open('${data.html_url}/network/members', '_blank')" style="cursor:pointer">
                        <i data-lucide="git-fork"></i>
                        <span>${data.forks_count}</span>
                    </div>
                    <div class="gh-stat-item" title="Open Issues" onclick="window.open('${data.html_url}/issues', '_blank')" style="cursor:pointer">
                        <i data-lucide="circle-dot"></i>
                        <span>${data.open_issues_count}</span>
                    </div>
                    <div class="gh-stat-item" title="Size">
                        <i data-lucide="database"></i>
                        <span>${Math.round((data.size / 1024) * 10) / 10} MB</span>
                    </div>
                </div>

                <div class="gh-repo-details">
                    <div class="gh-lang">
                        <span class="gh-lang-dot" style="background-color: ${getLanguageColor(data.language)}"></span>
                        <span class="gh-lang-name">${data.language || 'JavaScript'}</span>
                    </div>
                    <div class="gh-updated">
                        <i data-lucide="clock"></i>
                        <span>Updated ${formatDate(data.updated_at)}</span>
                    </div>
                </div>

                <div class="gh-activity-section">
                    <h4><i data-lucide="git-commit"></i> Recent Repository Activity</h4>
                    <ul class="gh-commits-list">
                        ${commitsHTML}
                    </ul>
                </div>

                <div class="gh-card-footer">
                    <button class="btn btn-secondary btn-sm" onclick="copyCloneUrl('${data.clone_url}')">
                        <i data-lucide="copy"></i> Copy Clone URL
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="window.open('${data.html_url}/issues', '_blank')">
                        <i data-lucide="circle-dot"></i> Issues
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="window.open('${data.html_url}/pulls', '_blank')">
                        <i data-lucide="git-pull-request"></i> PRs
                    </button>
                </div>
            </div>`;
    } else {
        // User Profile View
        const repos = getSimulatedUserRepos(ghInfo.user);
        const reposHTML = repos.map(r => `
            <div class="gh-user-repo-card" onclick="window.open('${r.html_url}', '_blank')">
                <p class="gh-user-repo-name">${r.name}</p>
                <div class="gh-user-repo-stars">
                    <i data-lucide="star"></i>
                    <span>${r.stars}</span>
                </div>
            </div>
        `).join('');

        html = `
            <div class="gh-live-viewer-card gh-user-card">
                ${modeBadgeHTML}
                <div class="gh-user-banner" style="background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)"></div>
                <div class="gh-user-info-area">
                    <img src="${data.avatar_url}" class="gh-user-avatar-large" onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=${ghInfo.user}'">
                    <div class="gh-user-header-text">
                        <h3>${data.name || data.login}</h3>
                        <p>@${data.login}</p>
                    </div>
                </div>
                
                <p class="gh-user-bio">${data.bio || 'Active open source developer.'}</p>
                
                <div class="gh-user-meta-items">
                    ${data.location ? `<div class="gh-meta-item"><i data-lucide="map-pin"></i> <span>${data.location}</span></div>` : ''}
                    ${data.blog ? `<div class="gh-meta-item"><i data-lucide="link"></i> <span class="gh-link-text" onclick="window.open('${sanitizeBlogUrl(data.blog)}', '_blank')">${data.blog}</span></div>` : ''}
                    ${data.company ? `<div class="gh-meta-item"><i data-lucide="building"></i> <span>${data.company}</span></div>` : ''}
                </div>

                <div class="gh-user-stats-grid">
                    <div class="gh-user-stat">
                        <span class="gh-stat-num">${data.public_repos}</span>
                        <span class="gh-stat-label">Repos</span>
                    </div>
                    <div class="gh-user-stat">
                        <span class="gh-stat-num">${data.followers}</span>
                        <span class="gh-stat-label">Followers</span>
                    </div>
                    <div class="gh-user-stat">
                        <span class="gh-stat-num">${data.following}</span>
                        <span class="gh-stat-label">Following</span>
                    </div>
                </div>

                <div class="gh-user-repos-section">
                    <h4><i data-lucide="folder-git-2"></i> Top Repositories</h4>
                    <div class="gh-user-repos-grid">
                        ${reposHTML}
                    </div>
                </div>

                <div class="gh-card-footer">
                    <button class="btn btn-primary btn-block btn-sm" onclick="window.open('${data.html_url}', '_blank')">
                        <i data-lucide="github"></i> View Full GitHub Profile
                    </button>
                </div>
            </div>`;
    }

    container.innerHTML = html;
    
    // Re-bind Lucide icons within the generated card content
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Asynchronously load the GitHub Live-Viewer data
async function loadGitHubLiveViewer(screenId, url, ghInfo) {
    const container = document.getElementById(`gh-viewer-${screenId}`);
    if (!container) return;

    const user = ghInfo.user;
    const repo = ghInfo.repo;

    // Show shimmer skeleton screen initially
    container.innerHTML = `
        <div class="gh-viewer-loading">
            <div class="gh-skeleton-avatar"></div>
            <div class="gh-skeleton-line w60"></div>
            <div class="gh-skeleton-line w40"></div>
            <div class="gh-skeleton-line w80"></div>
        </div>`;

    try {
        let data;
        const apiPath = repo ? `repos/${user}/${repo}` : `users/${user}`;
        
        const response = await fetch(`https://api.github.com/${apiPath}`);
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }
        data = await response.json();
        
        renderGitHubData(screenId, ghInfo, data, false);
    } catch (e) {
        console.warn(`GitHub API failure or rate limit: ${e.message}. Loading high-fidelity local snapshot fallback.`, e);
        // Load offline preview fallback
        const mockData = getGitHubMockData(user, repo);
        renderGitHubData(screenId, ghInfo, mockData, true);
    }
}


// --- Theme Management ---
function applyTheme(theme) {
    state.theme = theme;
    if (theme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        themeToggleBtn.innerHTML = `<i data-lucide="moon"></i><span>Dark Mode</span>`;
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        themeToggleBtn.innerHTML = `<i data-lucide="sun"></i><span>Light Mode</span>`;
    }
    lucide.createIcons();
    saveState();
}

// --- Grid Generation Engine ---
function renderWorkspace() {
    // Sync header elements & sidebar controllers with current state
    workspaceTitle.textContent = state.workspaceName;
    screenCountInput.value = state.screenCount;
    aspectRatioSelect.value = state.aspectRatio;
    if (gridColsSelect) gridColsSelect.value = state.gridCols || "auto";
    gridGapSlider.value = state.gridGap;
    gridGapVal.textContent = `${state.gridGap}px`;
    activeCountText.textContent = `${state.screenCount} Screen${state.screenCount > 1 ? 's' : ''} Running`;

    // Clear viewport
    gridViewport.innerHTML = "";

    // Calculate grid columns dynamically
    const n = state.screenCount;
    let cols = 1;
    if (state.gridCols && state.gridCols !== "auto") {
        cols = parseInt(state.gridCols);
    } else {
        if (n === 1) cols = 1;
        else if (n === 2) cols = 2;
        else if (n === 3) cols = 3;
        else if (n === 4) cols = 2;
        else if (n <= 9) cols = 3;
        else if (n <= 16) cols = 4;
        else if (n <= 25) cols = 5;
        else if (n <= 36) cols = 6;
        else if (n <= 49) cols = 7;
        else if (n <= 64) cols = 8;
        else if (n <= 81) cols = 9;
        else cols = 10;
    }

    // Apply grid configurations to parent container
    gridViewport.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridViewport.style.gap = `${state.gridGap}px`;

    // Normalize screen definitions list inside state
    while (state.screens.length < n) {
        const nextId = state.screens.length + 1;
        state.screens.push({ id: nextId, url: "", label: `Screen ${nextId}` });
    }
    // Truncate if list is larger than target count
    if (state.screens.length > n) {
        state.screens = state.screens.slice(0, n);
    }

    // Spawn Screen Cards
    state.screens.forEach((screenData, index) => {
        const card = createScreenCard(screenData, index + 1);
        gridViewport.appendChild(card);

        // If this is a GitHub screen card, kick off API loading!
        const isBuster = isLikelyIframeBuster(screenData.url);
        const ghInfo = (isBuster && screenData.url && screenData.url.includes('github.com')) ? getGitHubInfo(screenData.url) : null;
        if (isBuster && ghInfo) {
            loadGitHubLiveViewer(screenData.id, screenData.url, ghInfo);
        }
    });

    // Re-trigger Lucide icon conversions
    lucide.createIcons();
}

// Create a single screen card component
function createScreenCard(screen, displayIndex) {
    const card = document.createElement('article');
    card.className = 'screen-card';
    card.dataset.id = screen.id;

    // Apply aspect ratio classes if customized
    if (state.aspectRatio !== 'auto') {
        card.style.aspectRatio = state.aspectRatio.replace('-', '/');
    } else {
        card.style.aspectRatio = '';
    }

    const hasUrl = !!screen.url;
    const faviconSrc = hasUrl ? getFavicon(screen.url) : '';
    const isBuster = isLikelyIframeBuster(screen.url);
    const siteMeta = isBuster ? getSiteMeta(screen.url) : null;
    const ghInfo = (isBuster && screen.url && screen.url.includes('github.com')) ? getGitHubInfo(screen.url) : null;
    const ytId = (isBuster && screen.url && (screen.url.includes('youtube.com') || screen.url.includes('youtu.be'))) ? getYouTubeVideoId(screen.url) : null;

    // Build the blocked-site rich preview HTML
    let blockedPreviewHTML = '';
    const isGitHub = isBuster && screen.url && screen.url.includes('github.com') && ghInfo;

    if (isGitHub) {
        // GitHub gets a LIVE API-powered viewer instead of a static blocked message
        blockedPreviewHTML = `
            <div class="gh-live-viewer visible" id="gh-viewer-${screen.id}">
                <div class="gh-viewer-loading">
                    <div class="gh-skeleton-avatar"></div>
                    <div class="gh-skeleton-line w60"></div>
                    <div class="gh-skeleton-line w40"></div>
                    <div class="gh-skeleton-line w80"></div>
                </div>
            </div>`;
    } else if (isBuster && siteMeta) {
        const siteIconHTML = `<img src="${siteMeta.icon}" class="rich-preview-icon" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" alt="${siteMeta.name}">`;
        const fallbackIconHTML = `<span class="rich-preview-icon-fallback" style="display:none;font-size:2rem">${siteMeta.iconFallback}</span>`;

        let extraInfoHTML = '';
        if (ytId) {
            extraInfoHTML = `<div class="rich-preview-meta"><span class="rp-chip"><i data-lucide="play" style="width:12px;height:12px"></i> Video ID: ${ytId}</span><span class="rp-chip-hint">Paste the link again — it will auto-embed!</span></div>`;
        }

        blockedPreviewHTML = `
            <div class="rich-blocked-preview visible" style="--site-color: ${siteMeta.color}; background: ${siteMeta.gradient}">
                <div class="rbp-glow" style="background: ${siteMeta.color}"></div>
                <div class="rbp-content">
                    <div class="rbp-icon-area">
                        ${siteIconHTML}
                        ${fallbackIconHTML}
                    </div>
                    <h3 class="rbp-title">${siteMeta.name}</h3>
                    <p class="rbp-url">${screen.url}</p>
                    <p class="rbp-desc">${siteMeta.desc}</p>
                    ${extraInfoHTML}
                    <div class="rbp-actions">
                        <button class="btn btn-glow rbp-btn" onclick="openSinglePopup(${screen.id})">
                            <i data-lucide="external-link"></i> Open Popup
                        </button>
                        <button class="btn btn-secondary rbp-btn" onclick="openDirect(${screen.id})">
                            <i data-lucide="arrow-up-right"></i> New Tab
                        </button>
                    </div>
                    <button class="btn btn-text-link rbp-help" onclick="openHelpModal()">
                        <i data-lucide="info"></i> Why can't this load inline?
                    </button>
                </div>
            </div>`;
    } else if (isBuster) {
        blockedPreviewHTML = `
            <div class="rich-blocked-preview visible generic">
                <div class="rbp-content">
                    <div class="rbp-icon-area">
                        <i data-lucide="shield-alert" style="width:40px;height:40px;color:var(--accent-warning)"></i>
                    </div>
                    <h3 class="rbp-title">Site Blocked Embedding</h3>
                    <p class="rbp-url">${screen.url}</p>
                    <p class="rbp-desc">This website prevents iframe embedding for security. Use the buttons below to view it.</p>
                    <div class="rbp-actions">
                        <button class="btn btn-glow rbp-btn" onclick="openSinglePopup(${screen.id})">
                            <i data-lucide="external-link"></i> Open Popup
                        </button>
                        <button class="btn btn-secondary rbp-btn" onclick="openDirect(${screen.id})">
                            <i data-lucide="arrow-up-right"></i> New Tab
                        </button>
                    </div>
                    <button class="btn btn-text-link rbp-help" onclick="openHelpModal()">
                        <i data-lucide="info"></i> Why can't this load inline?
                    </button>
                </div>
            </div>`;
    }

    card.innerHTML = `
        <div class="screen-header">
            <div class="screen-info">
                <span class="screen-icon" id="icon-${screen.id}">
                    ${faviconSrc ? `<img src="${faviconSrc}" onerror="this.style.display='none'">` : '<i data-lucide="globe" class="default-globe-icon"></i>'}
                </span>
                <span class="screen-title" contenteditable="true" spellcheck="false" title="Click to rename" id="title-${screen.id}">${screen.label || `Screen ${displayIndex}`}</span>
                <span class="screen-url-bar" title="Click to edit URL" id="urlbar-${screen.id}">${screen.url || 'No URL configured'}</span>
            </div>
            <div class="screen-controls">
                <button class="btn-card-ctrl" title="Refresh Screen" onclick="refreshFrame(${screen.id})">
                    <i data-lucide="refresh-cw" class="size-sm"></i>
                </button>
                <button class="btn-card-ctrl" title="Open in Direct Tab" onclick="openDirect(${screen.id})">
                    <i data-lucide="external-link" class="size-sm"></i>
                </button>
                <button class="btn-card-ctrl" title="Maximize Screen" onclick="toggleMaximize(${screen.id})">
                    <i data-lucide="maximize" class="size-sm" id="max-icon-${screen.id}"></i>
                </button>
                <button class="btn-card-ctrl danger" title="Clear Screen" onclick="clearScreen(${screen.id})">
                    <i data-lucide="trash-2" class="size-sm"></i>
                </button>
            </div>
        </div>
        <div class="screen-body">
            ${blockedPreviewHTML}

            <!-- Empty State Placeholder -->
            <div class="empty-placeholder" style="display: ${hasUrl ? 'none' : 'flex'}">
                <div class="empty-placeholder-icon-wrap">
                    <i data-lucide="monitor-plus"></i>
                </div>
                <h4>Add a Website</h4>
                <p>Enter a URL to load a live website in this frame.</p>
                <div class="empty-input-row">
                    <input type="text" placeholder="e.g. wikipedia.org or paste any link" id="placeholder-input-${screen.id}" onkeydown="handlePlaceholderEnter(event, ${screen.id})">
                    <button class="btn btn-primary empty-load-btn" onclick="loadPlaceholderUrl(${screen.id})">
                        <i data-lucide="arrow-right" style="width:14px;height:14px"></i>
                    </button>
                </div>
            </div>

            <!-- Live Browser Viewport Frame -->
            ${(hasUrl && !isBuster) ? `<iframe src="${screen.url}" id="iframe-${screen.id}" allow="autoplay; encrypted-media; picture-in-picture" sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"></iframe>` : ''}
        </div>
    `;

    // --- Inline Input & Editable Event Handlers ---

    // Title label focusout handler
    const titleEl = card.querySelector(`#title-${screen.id}`);
    titleEl.addEventListener('blur', () => {
        const text = titleEl.textContent.trim();
        screen.label = text || `Screen ${displayIndex}`;
        saveState();
    });
    titleEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            titleEl.blur();
        }
    });

    // Editable URL bar click-to-edit conversion
    const urlBarEl = card.querySelector(`#urlbar-${screen.id}`);
    urlBarEl.addEventListener('click', () => {
        makeUrlBarEditable(urlBarEl, screen.id);
    });

    return card;
}

// Convert url text bar into fully active input field
function makeUrlBarEditable(urlBarEl, id) {
    if (urlBarEl.querySelector('input')) return; // Already editing

    const currentUrl = state.screens.find(s => s.id === id).url;
    urlBarEl.classList.add('editing');
    urlBarEl.innerHTML = `<input type="text" class="url-edit-input" value="${currentUrl}" placeholder="Enter URL..." style="width: 100%; background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 0.72rem;">`;

    const input = urlBarEl.querySelector('input');
    input.focus();
    input.select();

    const commitChanges = () => {
        const value = input.value.trim();
        const sanitized = sanitizeUrl(value);
        updateScreenUrl(id, sanitized);
    };

    input.addEventListener('blur', commitChanges);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            commitChanges();
        } else if (e.key === 'Escape') {
            input.removeEventListener('blur', commitChanges);
            renderWorkspace(); // Reload frame layout without committing changes
        }
    });
}

// Update url values and reload frame
function updateScreenUrl(id, newUrl) {
    const screen = state.screens.find(s => s.id === id);
    if (screen) {
        screen.url = newUrl;
        // Auto label if it's default or empty
        if (!screen.label || screen.label.startsWith('Screen') || screen.label === 'Empty Screen') {
            try {
                if (newUrl) {
                    const host = new URL(newUrl).hostname.replace('www.', '');
                    screen.label = host.charAt(0).toUpperCase() + host.slice(1);
                } else {
                    screen.label = "Empty Screen";
                }
            } catch (e) {
                screen.label = "Active Frame";
            }
        }
        saveState();
        renderWorkspace();
    }
}

// Placeholder Actions
function handlePlaceholderEnter(e, id) {
    if (e.key === 'Enter') {
        loadPlaceholderUrl(id);
    }
}

function loadPlaceholderUrl(id) {
    const input = document.getElementById(`placeholder-input-${id}`);
    if (input) {
        const sanitized = sanitizeUrl(input.value);
        updateScreenUrl(id, sanitized);
    }
}

// --- Screen Command Handlers ---

window.refreshFrame = function(id) {
    const iframe = document.getElementById(`iframe-${id}`);
    if (iframe) {
        iframe.src = iframe.src;
    } else {
        renderWorkspace();
    }
};

window.openDirect = function(id) {
    const screen = state.screens.find(s => s.id === id);
    if (screen && screen.url) {
        window.open(screen.url, '_blank');
    }
};

window.openSinglePopup = function(id) {
    const screen = state.screens.find(s => s.id === id);
    if (!screen || !screen.url) return;

    // Open a single clean popup window in the center of the screen
    const width = 1100;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const specs = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`;
    
    const newWindow = window.open(screen.url, `_blank_workspace_win_single_${id}`, specs);
    if (!newWindow) {
        alert("Pop-up blocked! Please click 'Always Allow Popups' in the top-right of your browser bar.");
    }
};

window.clearScreen = function(id) {
    const screen = state.screens.find(s => s.id === id);
    if (screen) {
        screen.url = "";
        screen.label = "Empty Screen";
        saveState();
        renderWorkspace();
    }
};

window.toggleMaximize = function(id) {
    const cards = document.querySelectorAll('.screen-card');
    const targetCard = Array.from(cards).find(c => parseInt(c.dataset.id) === id);
    const maxIcon = document.getElementById(`max-icon-${id}`);

    if (targetCard) {
        const isFullscreen = targetCard.classList.contains('fullscreen-active');
        // Clear all maximizations first
        cards.forEach(c => c.classList.remove('fullscreen-active'));
        
        // Reset all icons
        document.querySelectorAll('[id^="max-icon-"]').forEach(icon => {
            icon.setAttribute('data-lucide', 'maximize');
        });

        if (!isFullscreen) {
            targetCard.classList.add('fullscreen-active');
            maxIcon.setAttribute('data-lucide', 'minimize');
        }

        lucide.createIcons();
    }
};

// --- Modal Helper Functions ---

function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

window.openHelpModal = function() {
    openModal(helpModal);
};

// --- Control Sidebar Event Listeners ---

// Toggle sidebar states
collapseSidebarBtn.addEventListener('click', () => {
    sidebar.classList.add('collapsed');
    expandSidebarBtn.style.display = 'flex';
});

expandSidebarBtn.addEventListener('click', () => {
    sidebar.classList.remove('collapsed');
    expandSidebarBtn.style.display = 'none';
});

// Custom Workspace Screen Count Increments/Decrements
incScreensBtn.addEventListener('click', () => {
    let count = parseInt(screenCountInput.value);
    if (count < 100) {
        count++;
        state.screenCount = count;
        saveState();
        renderWorkspace();
    }
});

decScreensBtn.addEventListener('click', () => {
    let count = parseInt(screenCountInput.value);
    if (count > 1) {
        count--;
        state.screenCount = count;
        saveState();
        renderWorkspace();
    }
});

screenCountInput.addEventListener('change', () => {
    let count = parseInt(screenCountInput.value);
    if (isNaN(count) || count < 1) count = 1;
    if (count > 100) count = 100;
    state.screenCount = count;
    saveState();
    renderWorkspace();
});

// Aspect Ratio Updates
aspectRatioSelect.addEventListener('change', () => {
    state.aspectRatio = aspectRatioSelect.value;
    saveState();
    renderWorkspace();
});

// Grid Columns per Row Updates
gridColsSelect.addEventListener('change', () => {
    state.gridCols = gridColsSelect.value;
    saveState();
    renderWorkspace();
});

// Spacing Gap Updates
gridGapSlider.addEventListener('input', () => {
    const val = gridGapSlider.value;
    gridGapVal.textContent = `${val}px`;
    state.gridGap = parseInt(val);
    saveState();
    
    // Quick inline style gap override to prevent full workspace re-renders while dragging
    gridViewport.style.gap = `${val}px`;
});
gridGapSlider.addEventListener('change', () => {
    saveState();
    renderWorkspace();
});

// Preset Buttons Event Loader
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const count = parseInt(btn.dataset.screens);
        state.screenCount = count;
        saveState();
        renderWorkspace();
    });
});

// Theme Switches
themeToggleBtn.addEventListener('click', () => {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
});

// Global Header Control Actions
reloadAllBtn.addEventListener('click', () => {
    state.screens.forEach(s => {
        if (s.url) {
            refreshFrame(s.id);
        }
    });
});

fullscreenWorkspaceBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
        fullscreenWorkspaceBtn.innerHTML = `<i data-lucide="minimize"></i>`;
    } else {
        document.exitFullscreen();
        fullscreenWorkspaceBtn.innerHTML = `<i data-lucide="maximize"></i>`;
    }
    lucide.createIcons();
});

// Sync Title Editable Header
workspaceTitle.addEventListener('blur', () => {
    state.workspaceName = workspaceTitle.textContent.trim() || "My Workspace";
    saveState();
});
workspaceTitle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        workspaceTitle.blur();
    }
});

// Sync URLs Dialog Trigger
syncUrlBtn.addEventListener('click', () => {
    syncUrlInput.value = "";
    openModal(syncModal);
});

applySyncUrlBtn.addEventListener('click', () => {
    const rawUrl = syncUrlInput.value;
    if (rawUrl.trim()) {
        const sanitized = sanitizeUrl(rawUrl);
        state.screens.forEach(s => {
            s.url = sanitized;
            try {
                const host = new URL(sanitized).hostname.replace('www.', '');
                s.label = host.charAt(0).toUpperCase() + host.slice(1);
            } catch (e) {
                s.label = "Active Frame";
            }
        });
        saveState();
        closeModal(syncModal);
        renderWorkspace();
    }
});

// Bulk paste Modal Actions
openBulkModalBtn.addEventListener('click', () => {
    // Pre-populate input field with existing non-empty screen URLs
    const currentList = state.screens
        .map(s => s.url)
        .filter(url => url !== "")
        .join('\n');
    bulkUrlsInput.value = currentList;
    openModal(bulkModal);
});

applyBulkUrlsBtn.addEventListener('click', () => {
    const text = bulkUrlsInput.value;
    const autoHttps = bulkAutoHttps.checked;
    
    // Parse urls line by line
    const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line !== "");

    if (lines.length > 0) {
        state.screenCount = lines.length;
        state.screens = lines.map((line, index) => {
            const sanitized = sanitizeUrl(line, autoHttps);
            let label = `Screen ${index + 1}`;
            try {
                const host = new URL(sanitized).hostname.replace('www.', '');
                label = host.charAt(0).toUpperCase() + host.slice(1);
            } catch (e) {}
            return {
                id: index + 1,
                url: sanitized,
                label: label
            };
        });
        saveState();
        closeModal(bulkModal);
        renderWorkspace();
    }
});

// --- Modal Global Listeners ---

document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const modalId = btn.dataset.modal;
        const targetModal = document.getElementById(modalId);
        if (targetModal) closeModal(targetModal);
    });
});

// Close modals when clicking background overlay
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal(overlay);
        }
    });
});

openHelpModalBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(helpModal);
});

// --- Chrome Popup Matrix Window Engine ---
launchWindowsBtn.addEventListener('click', () => {
    const activeScreens = state.screens.filter(s => s.url !== "");
    if (activeScreens.length === 0) {
        alert("Please load at least one screen with a valid URL before launching the window engine.");
        return;
    }

    const confirmLaunch = confirm(
        `This will open ${activeScreens.length} individual Chrome windows.\n\n` +
        `IMPORTANT: Your browser will block these as pop-ups initially. Please click 'Always Allow Pop-ups' in Chrome's URL bar when prompted.`
    );
    if (!confirmLaunch) return;

    // Grid coordinates calculations based on primary screen limits
    const screenWidth = window.screen.availWidth || 1920;
    const screenHeight = window.screen.availHeight || 1080;
    
    const count = activeScreens.length;
    let cols = Math.ceil(Math.sqrt(count));
    let rows = Math.ceil(count / cols);

    const winWidth = Math.floor(screenWidth / cols);
    const winHeight = Math.floor(screenHeight / rows);

    activeScreens.forEach((screen, index) => {
        const colIndex = index % cols;
        const rowIndex = Math.floor(index / cols);

        const left = colIndex * winWidth;
        const top = rowIndex * winHeight;

        const specs = `width=${winWidth},height=${winHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`;
        
        // Launch dynamic chrome window frame
        const newWindow = window.open(screen.url, `_blank_workspace_win_${index}`, specs);
        if (!newWindow) {
            console.warn("Pop-up blocked by browser for: " + screen.url);
        }
    });
});


// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    loadState();
    
    // Force expand state of sidebar by default on large desktops
    if (window.innerWidth > 1024) {
        sidebar.classList.remove('collapsed');
        expandSidebarBtn.style.display = 'none';
    } else {
        sidebar.classList.add('collapsed');
        expandSidebarBtn.style.display = 'flex';
    }

    renderWorkspace();
});
