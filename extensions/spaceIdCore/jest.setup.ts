import dotenv from 'dotenv'
import { fetch, Headers } from 'undici'

dotenv.config()

// @ts-ignore
global.fetch = fetch
// @ts-ignore
global.Headers = Headers
