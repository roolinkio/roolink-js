/** Asks for a Kasada /tl payload. */
export interface KasadaPayloadRequest {
  script: string;
  ipsUrl: string;
  language: string;
  referer: string;
  userAgent: string;
}

/** A Kasada /tl request to send to the site. */
export interface KasadaPayloadResponse {
  headers: Record<string, string>;
  /** The /tl request body, already decoded from the base64 the API sends. */
  payload: Buffer;
}

/** Asks for an x-kpsdk-cd header from the site's challenge values. */
export interface KasadaCDRequest {
  st: number;
  ct: string;
  fc?: string;
  domain: string;
}

/** An x-kpsdk-cd header value. */
export interface KasadaCDResponse {
  /**
   * The x-kpsdk-cd header value, which is itself JSON, so send it unchanged.
   */
  payload: string;
}

/** Asks for an x-is-human header. */
export interface KasadaBotIDRequest {
  script: string;
}

/**
 * Sent as the x-is-human header with `JSON.stringify`, which keeps the API's
 * field order.
 */
export interface KasadaBotIDResponse {
  b: number;
  v: number;
  e: string;
  s: string;
  d: number;
  vr: string;
}
