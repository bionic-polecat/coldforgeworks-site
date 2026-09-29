import { sitemapXml } from '../lib/site-search.mjs';

export const prerender = true;
export function GET() {
    return new Response(sitemapXml(import.meta.env.PUBLIC_SITE_BRAND), {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' }
    });
}
