import { fetch, Headers } from 'undici';

// @ts-ignore
global.fetch = fetch
// @ts-ignore
global.Headers = Headers
