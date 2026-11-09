export interface ImpervaPayloadRequest {
  script: string;
  /** Absolute, or relative to `pageUrl`. */
  scriptUrl: string;
  pageUrl: string;
  /** The User-Agent your requests to the site send, because the payload is built from a collected browser with it. */
  userAgent: string;
  /** The Accept-Language header your requests send, such as `en-US,en;q=0.9`. */
  language: string;
  /** The site's base64 GPC challenge without the JSON quotes it arrives in. Leave it out or null when the site has none. */
  pow?: string | null;
}

export interface ImpervaUTMVCRequest {
  script: string;
  /** The site's `document.cookie`, which the API requires even when it is empty. */
  cookies: string;
  userAgent: string;
}

/** Only `cookie` or `setCookie` is sent to the site; the fields after them describe how the value was built. */
export interface ImpervaUTMVCResponse {
  name: '___utmvc';
  value: string;
  /** `name=value`, for a Cookie header. */
  cookie: string;
  /** `cookie` with its expiry and path, for a cookie jar. */
  setCookie: string;
  fingerprint: string;
  digest: string;
  signature: string;
  salt: string;
  key: string;
  version: string;
  windowKeyCount: number;
}
