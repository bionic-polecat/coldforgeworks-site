import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// This exact commit is the currently published company site. Keep existing legal
// documents intact while new account-aware policies remain unapproved drafts.
const publishedCommit = '0b98f6cab3f8b9a407acca5a76f7e9ed137c1d58';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const brand = process.argv[2];
if (!['company', 'backdoor-map'].includes(brand)) throw new Error('Choose company or backdoor-map');
const work = mkdtempSync(join(tmpdir(), `cgw-publish-${brand}-`));
const legacy = join(work, 'published-source');
const output = join(work, 'public');
mkdirSync(legacy);
mkdirSync(output);
const git = (...args) => execFileSync('git', args, { cwd: root });
const paths = git('ls-tree', '-r', '--name-only', publishedCommit).toString().trim().split('\n');
for (const path of paths.filter(path => /^(src\/|public\/|astro\.config\.mjs$|package\.json$)/.test(path))) {
    const destination = join(legacy, path);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, git('show', `${publishedCommit}:${path}`));
}
symlinkSync(join(root, 'node_modules'), join(legacy, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
const astro = join(root, 'node_modules/astro/astro.js');
function build(cwd, env) {
    execFileSync(process.execPath, [astro, 'build'], { cwd, env: { ...process.env, ...env }, stdio: 'inherit' });
}
build(legacy, { PUBLIC_SITE_BRAND: 'company', PUBLIC_WEBSITE_ANALYTICS: 'false', PUBLIC_BACKDOOR_SITE_LIVE: 'false' });
build(root, { PUBLIC_SITE_BRAND: brand, PUBLIC_WEBSITE_ANALYTICS: 'true', PUBLIC_BACKDOOR_SITE_LIVE: process.argv.includes('--backdoor-live') ? 'true' : 'false' });
function copy(from, relative) {
    const source = join(from, relative);
    if (!existsSync(source)) throw new Error(`Missing publication asset: ${relative}`);
    cpSync(source, join(output, relative), { recursive: true });
}
const current = join(root, 'dist');
for (const file of ['index.html', '_astro', 'favicon.svg', 'website-privacy/index.html']) copy(current, file);
for (const file of ['mark.svg', 'service-entrance.webp', 'search-preview.webp', 'community-preview.webp', 'notes-preview.webp']) copy(current, `backdoor-map/${file}`);
copy(current, 'backdoor-map/index.html');
const policies = ['privacy', 'terms', 'support', 'data-requests', 'community-standards'];
if (brand === 'company') {
    copy(join(legacy, 'dist'), '_astro');
    for (const page of policies) copy(join(legacy, 'dist'), `backdoor-map/${page}/index.html`);
} else {
    copy(current, 'backdoor-map/community-standards/index.html');
}
const redirects = [];
if (brand === 'backdoor-map') {
    for (const page of policies.filter(page => page !== 'community-standards')) {
        redirects.push(`/backdoor-map/${page} https://coldforgeworks.com/backdoor-map/${page} 302`);
        redirects.push(`/backdoor-map/${page}/ https://coldforgeworks.com/backdoor-map/${page} 302`);
    }
}
redirects.push('/backdoor-map/delete-account /backdoor-map/support 302');
redirects.push('/backdoor-map/delete-account/ /backdoor-map/support 302');
writeFileSync(join(output, '_redirects'), redirects.join('\n') + '\n');
writeFileSync(join(output, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n');
writeFileSync(join(output, '404.html'), '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page not found</title><h1>Page not found</h1><p><a href="/">Return home</a></p></html>');
const origin = brand === 'company' ? 'https://coldforgeworks.com' : 'https://backdoormap.com';
const urls = [`${origin}/`, `${origin}/website-privacy`, ...(brand === 'company' ? [`${origin}/backdoor-map`, ...policies.map(page => `${origin}/backdoor-map/${page}`)] : [`${origin}/backdoor-map/community-standards`])];
writeFileSync(join(output, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls.map(url => `<url><loc>${url}</loc></url>`).join('') + '</urlset>\n');
writeFileSync(join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
function files(dir, prefix = '') {
    return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(dir, entry.name), `${prefix}${entry.name}/`) : [`${prefix}${entry.name}`]);
}
const manifest = [];
for (const file of files(output)) {
    if (/(^|\/)(api|\.netlify|\.env|node_modules|functions)(\/|$)/.test(file)) throw new Error(`Unsafe exported path: ${file}`);
    const data = readFileSync(join(output, file));
    if (file.endsWith('.html') && /Release draft|Not yet effective|id="deletion-flow"|id="request-code"/.test(data.toString())) throw new Error(`Unapproved content: ${file}`);
    manifest.push({ path: file, sha256: createHash('sha256').update(data).digest('hex'), bytes: data.length });
}
if (existsSync(join(output, 'api')) || existsSync(join(output, 'backdoor-map/delete-account'))) throw new Error('Account routes must not be exported');
writeFileSync(join(work, 'manifest.json'), JSON.stringify({ brand, publishedPolicyCommit: publishedCommit, sourceHead: git('rev-parse', 'HEAD').toString().trim(), files: manifest }, null, 2));
console.log(JSON.stringify({ publicationDirectory: output, manifest: join(work, 'manifest.json'), files: manifest.length }));
