// Build-time selection, never derived from an untrusted Host header.
export function websiteBrand(value) {
    if (value === undefined || value === '' || value === 'company') return 'company';
    if (value === 'backdoor-map') return value;
    throw new Error('PUBLIC_SITE_BRAND must be company or backdoor-map');
}

export function publicationFor(value) {
    const standalone = websiteBrand(value) === 'backdoor-map';
    const origin = standalone ? 'https://backdoormap.com' : 'https://coldforgeworks.com';
    const baseUrl = `${origin}/backdoor-map`;
    return {
        standalone, homePath: standalone ? '/' : '/backdoor-map', baseUrl,
        urls: {
            overview: standalone ? `${origin}/` : baseUrl,
            privacy: `${baseUrl}/privacy`, terms: `${baseUrl}/terms`,
            communityStandards: `${baseUrl}/community-standards`,
            support: `${baseUrl}/support`, dataRequests: `${baseUrl}/data-requests`,
            deleteAccount: `${baseUrl}/delete-account`
        }
    };
}

// Switch only after the dedicated site's HTTPS and public pages are verified.
export function backdoorWebsiteLink(value) {
    if (value === 'true') return { href: 'https://backdoormap.com/', live: true };
    if (value === undefined || value === '' || value === 'false') return { href: '/backdoor-map', live: false };
    throw new Error('PUBLIC_BACKDOOR_SITE_LIVE must be true or false');
}
