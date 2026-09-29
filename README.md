# Astro on Netlify Platform Starter

## BackDoor Map website candidate

This repository also contains the unpublished dedicated BackDoor Map website.
The default build retains the company homepage; `PUBLIC_SITE_BRAND=backdoor-map`
selects the dedicated product homepage and `backdoormap.com` canonical URLs.
Run `npm test` before building either mode. No additional dependency is required.
The refreshed company homepage links to live reviveme.gg and the working local
BackDoor Map overview. Set `PUBLIC_BACKDOOR_SITE_LIVE=true` only after the dedicated
domain is publicly verified to switch that product link to backdoormap.com.

Read [hosting and verification notes](docs/BACKDOOR_MAP_DOMAIN_SITE.md) before
publishing. Account-aware policies are drafts and outside-app deletion is
disabled by default. Do not push draft changes into an auto-deploying company
project or enable account deletion without its separate validation/approval.

The starter documentation below is retained as reference, not an instruction to
create a replacement account, install tooling or deploy the unfinished candidate.

[Live Demo](https://astro-platform-starter.netlify.app/)

A modern starter based on Astro.js, Tailwind, and [Netlify Core Primitives](https://docs.netlify.com/core/overview/#develop) (Edge Functions, Image CDN, Blob Store).

## Astro Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Deploying to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/netlify-templates/astro-platform-starter)

## Developing Locally

| Prerequisites                                                                |
| :--------------------------------------------------------------------------- |
| [Node.js](https://nodejs.org/) v18.14+.                                      |
| (optional) [nvm](https://github.com/nvm-sh/nvm) for Node version management. |

1. Clone this repository, then run `npm install` in its root directory.

2. For the starter to have full functionality locally (e.g. edge functions, blob store), please ensure you have an up-to-date version of Netlify CLI. Run:

```
npm install netlify-cli@latest -g
```

3. Link your local repository to the deployed Netlify site. This will ensure you're using the same runtime version for both local development and your deployed site.

```
netlify link
```

4. Then, run the Astro.js development server via Netlify CLI:

```
netlify dev
```

If your browser doesn't navigate to the site automatically, visit [localhost:8888](http://localhost:8888).
