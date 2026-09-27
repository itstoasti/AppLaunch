// Vercel Serverless Function: Scrape URL for Deep App Metadata and Features
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const rawUrl = req.query.url || req.body?.url;
    if (!rawUrl) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }

    let targetUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
    }

    try {
        const ghMatch = targetUrl.match(/(?:github\.com\/)([^\/]+)\/([^\/\?#]+)/i);
        if (ghMatch) {
            const owner = ghMatch[1];
            const repo = ghMatch[2].replace(/\.git$/i, '');
            const result = await extractGitHubProduct(owner, repo, targetUrl);
            return res.status(200).json(result);
        }

        const result = await extractWebsiteProduct(targetUrl);
        return res.status(200).json(result);
    } catch (err) {
        console.error('Error scraping URL:', err);
        return res.status(500).json({ error: err.message });
    }
}

const BLACKLIST = /^(menu|nav|navigation|footer|header|sign in|sign up|log in|pricing|contact|cookies|privacy|terms|copyright|rights reserved|explore all|start free|get started|now in|frequently asked|latest commit|folders and files|history|navigation menu|table of contents|license|installation|getting started|contributing|releases|requirements|build|prerequisites)/i;

function cleanText(str) {
    return (str || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/&#\d+;/g, ' ')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/[*_`#]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function detectCategory(text) {
    const t = (text || '').toLowerCase();
    if (/workout|fitness|gym|health|calorie|training|runner|exercise|sport|diet|meditation|sleep|step|yoga/i.test(t)) return 'fitness';
    if (/budget|finance|money|expense|crypto|invest|bank|wallet|stock|trading|accounting|cash|invoice/i.test(t)) return 'finance';
    if (/habit|task|todo|routine|organize|note|calendar|focus|productivity|schedule|reminder|workflow|timeblock|screenshot|mockup|design|developer/i.test(t)) return 'productivity';
    if (/social|chat|friend|community|message|dating|connect|network|stream|creator|feed|post/i.test(t)) return 'social';
    if (/shop|store|product|discount|order|cart|checkout|ecommerce|retail|delivery|food|clothing/i.test(t)) return 'ecommerce';
    if (/learn|study|quiz|course|student|education|lesson|language|school|academic|flashcard|book/i.test(t)) return 'education';
    if (/music|video|movie|film|stream|podcast|game|entertainment|play|show|radio|tv|audio/i.test(t)) return 'entertainment';
    return 'utilities';
}

function parseHtmlProduct(html, pageUrl) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)?.[1];
    const ogSiteName = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)?.[1];
    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)?.[1];
    const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i)?.[1];
    const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)?.[1];
    const iconMatch = html.match(/<link[^>]*rel=["'](?:apple-touch-icon|shortcut icon|icon)["'][^>]*href=["']([^"']+)["']/i) ||
        html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:apple-touch-icon|shortcut icon|icon)["']/i);

    // Nav logo
    const logoMatch = html.match(/<a[^>]*class=["'][^"']*logo[^"']*["'][^>]*>([\s\S]*?)<\/a>/i);
    const navLogo = logoMatch ? cleanText(logoMatch[1]) : '';

    // Hero title & description
    const heroH1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
    const heroP = html.match(/<(?:p|div)[^>]*class=["'][^"']*(?:hero__description|hero-desc|hero-sub|lead|subtitle)[^"']*["'][^>]*>([\s\S]*?)<\/(?:p|div)>/i)?.[1];

    let fullTitle = cleanText(ogTitle || titleMatch?.[1] || '');
    let extractedAppName = navLogo || ogSiteName || '';
    if (!extractedAppName && fullTitle) {
        extractedAppName = fullTitle.split(/[|\-–:•]/)[0].trim();
    }
    extractedAppName = extractedAppName.replace(/^GitHub\s*-\s*/i, '').trim();

    let extractedHook = heroH1 ? cleanText(heroH1) : (fullTitle ? fullTitle.split(/[|\-–:•]/)[0].trim() : extractedAppName);
    let extractedDesc = heroP ? cleanText(heroP) : cleanText(ogDesc || metaDesc || '');

    const features = [];

    // Helper to safely add feature
    function addFeature(title, desc) {
        const t = cleanText(title);
        let d = cleanText(desc);
        if (t.length < 3 || t.length > 60 || d.length < 10) return;
        if (BLACKLIST.test(t)) return;

        // Strip duplicate title prefix from description
        if (d.toLowerCase().startsWith(t.toLowerCase())) {
            d = d.slice(t.length).replace(/^[:\s-]+/, '').trim();
        }
        if (d.length < 8) return;

        if (!features.some(f => f.title.toLowerCase() === t.toLowerCase())) {
            features.push({ title: t, description: d });
        }
    }

    // 1. Feature Cards / Highlight Cards
    const cardRegex = /<(?:div|article|section)[^>]*class=["'][^"']*(?:feature|benefit|card|highlight|service)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|article|section)>/gi;
    let cMatch;
    while ((cMatch = cardRegex.exec(html)) !== null) {
        const block = cMatch[1];
        const h = block.match(/<h[234][^>]*>([\s\S]*?)<\/h[234]>/i);
        const p = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
        if (h && p) {
            addFeature(h[1], p[1]);
        }
    }

    // 2. Headings followed by Paragraphs
    const secRegex = /<h([23])[^>]*>([\s\S]*?)<\/h\1>[\s\n]*<p[^>]*>([\s\S]*?)<\/p>/gi;
    let sMatch;
    while ((sMatch = secRegex.exec(html)) !== null) {
        addFeature(sMatch[2], sMatch[3]);
    }

    // 3. Bullet points with bold headers: <li><strong>Title</strong>: Description</li>
    const liRegex = /<li[^>]*>(?:<p[^>]*>)?[\s\n]*<(?:strong|b)[^>]*>([^<]+)<\/(?:strong|b)>[:\s-]+([\s\S]*?)(?:<\/p>)?<\/li>/gi;
    let liMatch;
    while ((liMatch = liRegex.exec(html)) !== null) {
        addFeature(liMatch[1], liMatch[2]);
    }

    // Icon handling
    let iconUrl = iconMatch ? iconMatch[1] : null;
    let ogImageUrl = ogImg || null;

    try {
        const baseUrl = new URL(pageUrl);
        if (iconUrl && !/^https?:\/\//i.test(iconUrl)) {
            iconUrl = new URL(iconUrl, baseUrl.origin).href;
        }
        if (ogImageUrl && !/^https?:\/\//i.test(ogImageUrl)) {
            ogImageUrl = new URL(ogImageUrl, baseUrl.origin).href;
        }
        if (!iconUrl) {
            iconUrl = `https://www.google.com/s2/favicons?domain=${baseUrl.hostname}&sz=128`;
        }
    } catch (e) {}

    return {
        appName: extractedAppName,
        title: fullTitle,
        tagline: extractedDesc || extractedHook,
        hookHeadline: extractedHook,
        description: extractedDesc,
        features: features.slice(0, 8),
        iconUrl,
        ogImage: ogImageUrl,
        category: detectCategory(`${extractedAppName} ${fullTitle} ${extractedDesc} ${features.map(f => f.title).join(' ')}`),
        url: pageUrl
    };
}

function parseMarkdownProduct(markdown, repoName = '') {
    let title = '';
    let description = '';
    const features = [];

    // Title from H1
    const h1Match = markdown.match(/^#\s+([^\n]+)/m);
    if (h1Match) {
        title = cleanText(h1Match[1].split(/[-–:|]/)[0]);
    }

    // Intro paragraphs
    const paragraphs = markdown
        .split(/\n\s*\n/)
        .map(p => cleanText(p))
        .filter(p => p.length > 25 && !p.startsWith('#') && !p.startsWith('!') && !p.startsWith('['));

    if (paragraphs.length > 0) {
        description = paragraphs[0];
    }

    // Bold bullet points: - **Title**: Description
    const bulletRegex = /^[*-]\s+(?:[^\w\s]*\s*)?(?:\*\*|__)(.*?)(?:\*\*|__)[:\s-]+([\s\S]*?)(?=\n[*-]|\n\n|\n#|$)/gm;
    let bMatch;
    while ((bMatch = bulletRegex.exec(markdown)) !== null) {
        const t = cleanText(bMatch[1]);
        const d = cleanText(bMatch[2]);
        if (t.length > 2 && t.length < 60 && d.length > 8 && !BLACKLIST.test(t)) {
            if (!features.some(f => f.title.toLowerCase() === t.toLowerCase())) {
                features.push({ title: t, description: d });
            }
        }
    }

    // Headings H2/H3 followed by paragraph
    const sectionRegex = /^##+\s+([^\n]+)\n+([^#\n*-][^\n]+)/gm;
    let sMatch;
    while ((sMatch = sectionRegex.exec(markdown)) !== null) {
        const t = cleanText(sMatch[1]);
        const d = cleanText(sMatch[2]);
        if (t.length > 2 && t.length < 60 && d.length > 15 && !BLACKLIST.test(t)) {
            if (!features.some(f => f.title.toLowerCase() === t.toLowerCase())) {
                features.push({ title: t, description: d });
            }
        }
    }

    return {
        appName: title || repoName,
        hookHeadline: title || repoName,
        description: description,
        features: features.slice(0, 8)
    };
}

async function extractGitHubProduct(owner, repo, originalUrl) {
    let repoData = {};
    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                'User-Agent': 'AppLaunch-Scraper/1.0',
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (res.ok) {
            repoData = await res.json();
        }
    } catch (e) {
        console.warn('GitHub API failed:', e);
    }

    let result = {
        appName: repoData.name ? repoData.name.replace(/[-_.]+/g, ' ').replace(/\b(app|ios|android|mobile|client|web)\b/gi, '').trim() : repo,
        title: repoData.name || repo,
        tagline: repoData.description || '',
        hookHeadline: repoData.description || `Build better with ${repo}`,
        description: repoData.description || '',
        features: [],
        iconUrl: repoData.owner?.avatar_url || null,
        ogImage: `https://opengraph.githubassets.com/1/${owner}/${repo}`,
        category: 'productivity',
        url: originalUrl
    };

    // If repo has homepage, fetch and parse the LIVE landing page (highest quality source!)
    if (repoData.homepage && /^https?:\/\//i.test(repoData.homepage)) {
        try {
            const hpRes = await fetch(repoData.homepage, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });
            if (hpRes.ok) {
                const html = await hpRes.text();
                const hpParsed = parseHtmlProduct(html, repoData.homepage);
                if (hpParsed.appName) result.appName = hpParsed.appName;
                if (hpParsed.hookHeadline) result.hookHeadline = hpParsed.hookHeadline;
                if (hpParsed.description) result.description = hpParsed.description;
                if (hpParsed.tagline) result.tagline = hpParsed.tagline;
                if (hpParsed.features.length > 0) result.features = hpParsed.features;
                if (hpParsed.iconUrl) result.iconUrl = hpParsed.iconUrl;
                result.category = hpParsed.category;
            }
        } catch (e) {
            console.warn('Failed to fetch repo homepage:', e);
        }
    }

    // In parallel or if no homepage features, fetch raw README and index.html from repo
    if (result.features.length < 3) {
        const branches = ['HEAD', 'main', 'master'];
        for (const branch of branches) {
            try {
                // Try README
                const readmeRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`);
                if (readmeRes.ok) {
                    const md = await readmeRes.text();
                    const mdParsed = parseMarkdownProduct(md, result.appName);
                    if (mdParsed.appName && !result.appName) result.appName = mdParsed.appName;
                    if (mdParsed.description && !result.description) result.description = mdParsed.description;
                    if (mdParsed.features.length > 0) {
                        mdParsed.features.forEach(f => {
                            if (!result.features.some(rf => rf.title.toLowerCase() === f.title.toLowerCase())) {
                                result.features.push(f);
                            }
                        });
                    }
                }

                // If still short on features, try index.html in repo!
                if (result.features.length < 3) {
                    const indexRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/index.html`);
                    if (indexRes.ok) {
                        const html = await indexRes.text();
                        const htmlParsed = parseHtmlProduct(html, originalUrl);
                        if (htmlParsed.appName && (!result.appName || result.appName === repo)) result.appName = htmlParsed.appName;
                        if (htmlParsed.hookHeadline && !result.hookHeadline) result.hookHeadline = htmlParsed.hookHeadline;
                        if (htmlParsed.description && !result.description) result.description = htmlParsed.description;
                        htmlParsed.features.forEach(f => {
                            if (!result.features.some(rf => rf.title.toLowerCase() === f.title.toLowerCase())) {
                                result.features.push(f);
                            }
                        });
                    }
                }

                if (result.features.length >= 3) break;
            } catch (e) {}
        }
    }

    // Capitalize clean appName
    if (result.appName) {
        result.appName = result.appName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    result.category = detectCategory(`${result.appName} ${result.hookHeadline} ${result.description} ${result.features.map(f => f.title).join(' ')}`);
    return result;
}

async function extractWebsiteProduct(targetUrl) {
    const response = await fetch(targetUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch URL: HTTP ${response.status}`);
    }

    const html = await response.text();
    return parseHtmlProduct(html, targetUrl);
}
