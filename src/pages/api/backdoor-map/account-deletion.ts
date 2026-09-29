import type { APIRoute } from 'astro';
import { createDeletionHandler, deletionConfig } from '../../../lib/backdoor-account-deletion.mjs';

export const prerender = false;
export const ALL: APIRoute = ({ request }) =>
    createDeletionHandler(deletionConfig(process.env, import.meta.env.DEV))(request);
