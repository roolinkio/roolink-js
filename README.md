# Roolink TypeScript SDK

Node.js and TypeScript client (`@roolink/sdk`) for the Roolink Akamai Web (`web.roolink.io`) and Akamai BMP (`bmp.roolink.io`) APIs.

Documentation: https://docs.roolink.io

## Install

```sh
npm install @roolink/sdk
```

## Usage

```ts
import {RoolinkClient} from '@roolink/sdk';

const client = new RoolinkClient('your-api-key');

const scriptData = await client.parseScript(scriptText);
const {sensor} = await client.generateWebSensor({
  userAgent,
  url: 'https://example.com/',
  _abck: abckCookie,
  bm_sz: bmSzCookie,
  scriptData,
});
```

## Methods

| Method | Endpoint |
| --- | --- |
| `parseScript(scriptText)` | `POST https://web.roolink.io/api/v1/parse` (gzip-compressed by default; pass `{compress: false}` to the constructor to disable) |
| `generateWebSensor(req)` | `POST https://web.roolink.io/api/v1/sensor` |
| `generatePixel(req)` | `POST https://web.roolink.io/api/v1/pixel` |
| `solveSecCpt(req)` | `POST https://web.roolink.io/api/v1/sec-cpt` |
| `solveSBSD(req)` | `POST https://web.roolink.io/api/v1/sbsd` |
| `generateBMPSensor(req)` | `POST https://bmp.roolink.io/api/v1/sensor` (`android: false` for iOS, `android: true` for Android) |

## License

MIT — see [LICENSE](LICENSE).
