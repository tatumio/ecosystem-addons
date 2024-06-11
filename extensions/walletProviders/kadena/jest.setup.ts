import crypto from 'crypto'
import { fetch, Headers } from 'undici';

// @ts-ignore
global.fetch = fetch
// @ts-ignore
global.Headers = Headers

Object.defineProperty(global, 'crypto', {
    value: {
        getRandomValues: (arr:any) => crypto.randomBytes(arr.length)
    }
});
