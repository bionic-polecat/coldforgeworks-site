import { publicationFor } from './site-brand.mjs';

export const BACKDOOR_MAP_GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.coldforgeworks.backdoormap';
export const BACKDOOR_MAP_APP_STORE_URL = 'https://apps.apple.com/us/app/backdoor-map/id6783116672';

export const BACKDOOR_MAP_PUBLICATION = {
    productName: 'BackDoor Map',
    operatorName: 'Cold Forge Works LLC',
    supportEmail: 'support@coldforgeworks.com',
    effectiveDate: 'July 18, 2026',
    ...publicationFor(import.meta.env.PUBLIC_SITE_BRAND)
} as const;
