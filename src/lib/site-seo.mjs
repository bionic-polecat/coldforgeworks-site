import { websiteBrand } from '../data/site-brand.mjs';

export const PRODUCT_CANONICAL = 'https://backdoormap.com/';
const company = 'https://coldforgeworks.com/';
const organization = {
    '@type': 'Organization',
    '@id': `${company}#organization`,
    name: 'Cold Forge Works LLC',
    url: company,
    email: 'support@coldforgeworks.com'
};

// Only verified identities and visible page content. No invented ratings,
// adoption counts, app-store approval, or rich-result eligibility claims.
export function homepageGraph(brand) {
    const product = websiteBrand(brand) === 'backdoor-map';
    const origin = product ? PRODUCT_CANONICAL : company;
    const name = product ? 'BackDoor Map' : 'Cold Forge Works LLC';
    const graph = [organization, {
        '@type': 'WebSite',
        '@id': `${origin}#website`,
        url: origin,
        name,
        inLanguage: 'en-US',
        publisher: { '@id': organization['@id'] }
    }, {
        '@type': 'WebPage',
        '@id': `${origin}#webpage`,
        url: origin,
        name: product ? 'BackDoor Map — Find Freight Entrance Locations' : 'Cold Forge Works LLC — BackDoor Map and reviveme.gg',
        description: product
            ? 'Find freight entrances reported by other people, submit and vote on reports, and save your own freight entrance pins and private notes.'
            : 'Independent software: BackDoor Map’s crowdsourced freight entrance map and reviveme.gg’s gaming community.',
        isPartOf: { '@id': `${origin}#website` },
        publisher: { '@id': organization['@id'] },
        inLanguage: 'en-US'
    }];
    return { '@context': 'https://schema.org', '@graph': graph };
}

export function serializeSearchData(value) {
    return JSON.stringify(value).replaceAll('<', '\\u003c');
}
