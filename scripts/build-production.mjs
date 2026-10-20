import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';
import { publicationBrand, verifyApprovedSources, verifyPublicationFiles } from './publication-checks.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const brand = publicationBrand(process.env, process.argv[2]);
verifyApprovedSources(root);
const env = { ...process.env, PUBLIC_SITE_BRAND: brand, PUBLIC_BACKDOOR_SITE_LIVE: 'true' };
const astroPackage = JSON.parse(readFileSync(join(root, 'node_modules/astro/package.json'), 'utf8'));
execFileSync(process.execPath, [join(root, 'node_modules/astro', astroPackage.bin.astro), 'build'], {cwd: root, env, stdio: 'inherit'});
const report = verifyPublicationFiles(root, brand);
// Import and execute the actual packaged server function with only mock upstreams.
execFileSync(process.execPath, [join(root, 'scripts/verify-netlify-build.mjs'), brand], {cwd: root, env, stdio: 'inherit'});
console.log('Verified complete publication:', JSON.stringify(report));
