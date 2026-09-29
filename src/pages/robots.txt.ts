import { robotsText } from '../lib/site-search.mjs';

export const prerender = true;
export function GET() {
    return new Response(robotsText(import.meta.env.PUBLIC_SITE_BRAND), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
}
