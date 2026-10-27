import { publicationFor } from '../data/site-brand.mjs';

// Explicit publication list: drafts, account actions and duplicate overview URLs stay out.
export function searchUrls(brand) {
    const publication = publicationFor(brand);
    const root = new URL('/', publication.urls.overview).href;
    // Both overview routes describe the same product; its canonical home is
    // backdoormap.com. Do not submit the company's duplicate product overview.
    return [...new Set([root, ...(publication.standalone ? [publication.urls.overview] : []), publication.urls.communityStandards])];
}

export function sitemapXml(brand) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n'
        + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + searchUrls(brand).map(url => `  <url><loc>${url}</loc></url>`).join('\n')
        + '\n</urlset>\n';
}

export function robotsText(brand) {
    const root = new URL('/', publicationFor(brand).urls.overview);
    // Allow crawlers to see noindex on draft/action pages; robots.txt is not access control.
    return `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml', root).href}\n`;
}
