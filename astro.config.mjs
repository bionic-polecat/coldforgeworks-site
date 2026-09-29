import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';
import { websiteBrand } from './src/data/site-brand.mjs';

const standalone = websiteBrand(process.env.PUBLIC_SITE_BRAND) === 'backdoor-map';

// https://astro.build/config
export default defineConfig({
    site: standalone ? 'https://backdoormap.com' : 'https://coldforgeworks.com',
    output: 'static',
    vite: {
        plugins: [tailwindcss()]
    },
    adapter: netlify()
});
