# Roolink TypeScript SDK

Node.js and TypeScript client (`@roolink/sdk`) for the Roolink Akamai Web (`web.roolink.io`), Akamai BMP (`bmp.roolink.io`), Kasada (`ksd.roolink.io`) and Imperva (`imperva.roolink.io`) APIs.

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
| `generateKasadaPayload(req)` | `POST https://ksd.roolink.io/api/v1/payload` |
| `generateKasadaCD(req)` | `POST https://ksd.roolink.io/api/v1/cd` |
| `generateKasadaBotID(req)` | `POST https://ksd.roolink.io/api/v1/botid` |
| `generateImpervaPayload(req)` | `POST https://imperva.roolink.io/api/v1/payload` |
| `generateImpervaUTMVC(req)` | `POST https://imperva.roolink.io/api/v1/utmvc` |

## Kasada

`generateKasadaPayload` decodes the payload from base64, so `payload` is a `Buffer` holding the `/tl` request body. Each protected request needs a new `generateKasadaCD`, whose `payload` is the `x-kpsdk-cd` header value. For Vercel BotID, the `x-is-human` header is `JSON.stringify` of the response.

```ts
const {headers, payload} = await client.generateKasadaPayload({
  script: ipsScript,
  ipsUrl,
  language: 'en-US',
  referer: 'https://www.example.com/',
  userAgent,
});
// Post payload to /tl with headers, and keep its x-kpsdk-ct and x-kpsdk-st response headers.

const {payload: cd} = await client.generateKasadaCD({st, ct, domain: 'www.example.com'});

const isHuman = JSON.stringify(
  await client.generateKasadaBotID({script: botIdScript}),
);
```

## Imperva

`generateImpervaPayload` returns the Reese84 submission as the JSON text the API sent, which the site expects unchanged. Pass `pow` only when the site's GPC request returns a challenge. `generateImpervaUTMVC` takes every cookie the site has set as one `document.cookie` string, including the `incap_ses_*` cookies, and returns the `___utmvc` cookie.

```ts
const submission = await client.generateImpervaPayload({
  script: sensorScript,
  scriptUrl,
  pageUrl: 'https://www.example.com/',
  userAgent,
  language: 'en-US,en;q=0.9',
  pow: powChallenge || null,
});
// Post submission to scriptUrl with d=<host> in the query, and store the token in the reply as the reese84 cookie.

const {cookie} = await client.generateImpervaUTMVC({
  script: incapsulaScript,
  cookies: documentCookie,
  userAgent,
});
```

## License

MIT — see [LICENSE](LICENSE).
