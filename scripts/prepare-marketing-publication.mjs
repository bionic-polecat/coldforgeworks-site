// Retired October 19, 2026. The September static export removed the now-live
// deletion endpoint and restored superseded July policies. Never emit it again.
console.error('This publication command is retired: its static output would remove current policies and account deletion. Use npm run build (company) or npm run build:backdoor; deploy dist AND the generated .netlify/v1 function bundle. See docs/PUBLICATION.md.');
process.exitCode = 1;
