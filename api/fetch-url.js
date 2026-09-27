// Vercel Serverless Function: Scrape URL for App Metadata
export default async function handler(req, res) {
    // Enable CORS for cross-origin frontend requests
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
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: `Failed to fetch URL: HTTP ${response.status}` });
        }

        const html = await response.text();

        // Extract metadata using regex
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);

        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
        const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);

        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);

        const iconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i) ||
            html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i);

        // Extract headings for features
        const headings = [];
        const headingRegex = /<h[23][^>]*>([^<]+)<\/h[23]>/gi;
        let hMatch;
        while ((hMatch = headingRegex.exec(html)) !== null) {
            const hText = hMatch[1].replace(/&[a-z]+;/gi, ' ').trim();
            if (hText.length > 3 && hText.length < 50 && !headings.includes(hText)) {
                headings.push(hText);
            }
            if (headings.length >= 6) break;
        }

        // Clean relative icon/image URLs
        let iconUrl = iconMatch ? iconMatch[1] : null;
        let ogImageUrl = ogImageMatch ? ogImageMatch[1] : null;

        const baseUrl = new URL(targetUrl);
        if (iconUrl && !/^https?:\/\//i.test(iconUrl)) {
            iconUrl = new URL(iconUrl, baseUrl.origin).href;
        }
        if (ogImageUrl && !/^https?:\/\//i.test(ogImageUrl)) {
            ogImageUrl = new URL(ogImageUrl, baseUrl.origin).href;
        }

        return res.status(200).json({
            title: (ogTitleMatch ? ogTitleMatch[1] : (titleMatch ? titleMatch[1] : '')).trim(),
            description: (ogDescMatch ? ogDescMatch[1] : (descMatch ? descMatch[1] : '')).trim(),
            ogImage: ogImageUrl,
            icon: iconUrl || `https://www.google.com/s2/favicons?domain=${baseUrl.hostname}&sz=128`,
            features: headings,
            url: targetUrl
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
