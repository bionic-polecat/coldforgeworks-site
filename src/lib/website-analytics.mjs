// Public beacon identifiers, not API credentials. Automatic injection stays disabled.
export const analyticsSites = Object.freeze({
    'coldforgeworks.com': '680d6c397584487eb185d025d3abe326',
    'backdoormap.com': '83390ee2a8c24c6e8dc987e8d09b91fc'
});

export function analyticsEnabled(value) {
    if (value === undefined || value === '' || value === 'false') return false;
    if (value === 'true') return true;
    throw new Error('PUBLIC_WEBSITE_ANALYTICS must be true or false');
}

export function analyticsToken(url, referrer = '', doNotTrack = null) {
    if (doNotTrack === '1' || doNotTrack === 'yes') return null;
    try {
        const page = new URL(url);
        if (page.protocol !== 'https:' || page.port || page.pathname !== '/' || page.search || page.hash) return null;
        if (referrer) {
            const source = new URL(referrer);
            if (source.search || source.hash) return null;
        }
        return analyticsSites[page.hostname] ?? null;
    } catch { return null; }
}
