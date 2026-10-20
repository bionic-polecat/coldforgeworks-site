import { publicationFor } from './site-brand.mjs';

export const BACKDOOR_MAP_GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.coldforgeworks.backdoormap';

export const BACKDOOR_MAP_PUBLICATION = {
    productName: 'BackDoor Map',
    operatorName: 'Cold Forge Works LLC',
    supportEmail: 'support@coldforgeworks.com',
    effectiveDate: 'July 18, 2026',
    ...publicationFor(import.meta.env.PUBLIC_SITE_BRAND)
} as const;
