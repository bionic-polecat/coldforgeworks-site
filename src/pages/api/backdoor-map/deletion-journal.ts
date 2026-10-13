import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';
import { createDeletionJournalHandler, deletionJournalConfig } from '../../../lib/backdoor-deletion-journal.mjs';

export const prerender=false;
export const ALL: APIRoute=({request})=>createDeletionJournalHandler(
    deletionJournalConfig(process.env,import.meta.env.DEV),
    (target: 'beta'|'dev')=>getStore({name:`bdm-deletion-journal-${target}`,consistency:'strong',
        fetch:(input: RequestInfo|URL,init?: RequestInit)=>fetch(input,{...init,signal:AbortSignal.timeout(7000)})}),
)(request);
