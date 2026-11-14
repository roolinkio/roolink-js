import {gzipSync} from 'node:zlib';
import {request} from 'undici';
import {version} from '../package.json';
import type {BMPSensorRequest, BMPSensorResponse} from './types/bmp';
import type {
  ImpervaPayloadRequest,
  ImpervaUTMVCRequest,
  ImpervaUTMVCResponse,
} from './types/imperva';
import type {
  KasadaBotIDRequest,
  KasadaBotIDResponse,
  KasadaCDRequest,
  KasadaCDResponse,
  KasadaPayloadRequest,
  KasadaPayloadResponse,
} from './types/kasada';
import type {
  WebSensorRequest,
  WebSensorResponse,
  PixelRequest,
  PixelResponse,
  SecCptRequest,
  SecCptResponse,
  SBSDRequest,
  SBSDResponse,
  ScriptData,
} from './types/web';

const DEFAULT_TIMEOUT_MS = 30000;
const BMP_BASE_URL = 'https://bmp.roolink.io';
const WEB_BASE_URL = 'https://web.roolink.io';
const KASADA_BASE_URL = 'https://ksd.roolink.io';
const IMPERVA_BASE_URL = 'https://imperva.roolink.io';
const USER_AGENT = `roolink-js/${version}`;

/** Calls the Roolink APIs with one API key. */
export class RoolinkClient {
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly compress: boolean;

  /**
   * Creates a client that sends `apiKey` with every request. `compress` sets
   * whether parseScript gzips the script, which it does by default.
   */
  constructor(apiKey: string, {compress = true}: {compress?: boolean} = {}) {
    this.apiKey = apiKey;
    this.timeoutMs = DEFAULT_TIMEOUT_MS;
    this.compress = compress;
  }

  private async send(
    url: string,
    body: string,
    contentType: string,
    {compress = false}: {compress?: boolean} = {},
  ): Promise<string> {
    const {statusCode, body: responseBody} = await request(url, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': contentType,
        'User-Agent': USER_AGENT,
        ...(compress && {'Content-Encoding': 'gzip'}),
      },
      body: compress ? gzipSync(body) : body,
      bodyTimeout: this.timeoutMs,
      headersTimeout: this.timeoutMs,
    });

    if (statusCode >= 400) {
      const errorText = await responseBody.text();
      throw new Error(`API error (status ${statusCode}): ${errorText}`);
    }

    return responseBody.text();
  }

  private async makeRequest<T>(
    url: string,
    body: string,
    contentType: string,
    options: {compress?: boolean} = {},
  ): Promise<T> {
    // The API's response for each endpoint has the shape of its response type.
    const response: T = JSON.parse(
      await this.send(url, body, contentType, options),
    );
    return response;
  }

  /** Returns an Akamai BMP sensor for a mobile app. */
  async generateBMPSensor(req: BMPSensorRequest): Promise<BMPSensorResponse> {
    return this.makeRequest<BMPSensorResponse>(
      `${BMP_BASE_URL}/api/v1/sensor`,
      JSON.stringify(req),
      'application/json',
    );
  }

  /** Returns an Akamai Web sensor. */
  async generateWebSensor(req: WebSensorRequest): Promise<WebSensorResponse> {
    return this.makeRequest<WebSensorResponse>(
      `${WEB_BASE_URL}/api/v1/sensor`,
      JSON.stringify(req),
      'application/json',
    );
  }

  /** Returns an Akamai pixel sensor, which the API sends as text, not JSON. */
  async generatePixel(req: PixelRequest): Promise<PixelResponse> {
    const sensor = await this.send(
      `${WEB_BASE_URL}/api/v1/pixel`,
      JSON.stringify(req),
      'application/json',
    );
    return {sensor};
  }

  /** Solves an Akamai sec-cpt challenge. */
  async solveSecCpt(req: SecCptRequest): Promise<SecCptResponse> {
    return this.makeRequest<SecCptResponse>(
      `${WEB_BASE_URL}/api/v1/sec-cpt`,
      JSON.stringify(req),
      'application/json',
    );
  }

  /** Returns the Akamai SBSD request body to post to the site. */
  async solveSBSD(req: SBSDRequest): Promise<SBSDResponse> {
    return this.makeRequest<SBSDResponse>(
      `${WEB_BASE_URL}/api/v1/sbsd`,
      JSON.stringify(req),
      'application/json',
    );
  }

  /** Returns the values a web sensor needs from an Akamai Web script. */
  async parseScript(scriptContent: string): Promise<ScriptData> {
    return this.makeRequest<ScriptData>(
      `${WEB_BASE_URL}/api/v1/parse`,
      scriptContent,
      'text/plain',
      {compress: this.compress},
    );
  }

  /**
   * Returns the Kasada /tl request. The API sends its body as base64 inside
   * JSON, so it is decoded here to the bytes /tl expects.
   */
  async generateKasadaPayload(
    req: KasadaPayloadRequest,
  ): Promise<KasadaPayloadResponse> {
    const {headers, payload} = await this.makeRequest<{
      headers: Record<string, string>;
      payload: string;
    }>(
      `${KASADA_BASE_URL}/api/v1/payload`,
      JSON.stringify(req),
      'application/json',
    );
    return {headers, payload: Buffer.from(payload, 'base64')};
  }

  /** Returns the x-kpsdk-cd header value for one protected request. */
  async generateKasadaCD(req: KasadaCDRequest): Promise<KasadaCDResponse> {
    return this.makeRequest<KasadaCDResponse>(
      `${KASADA_BASE_URL}/api/v1/cd`,
      JSON.stringify(req),
      'application/json',
    );
  }

  /** Returns the x-is-human header for Vercel BotID. */
  async generateKasadaBotID(
    req: KasadaBotIDRequest,
  ): Promise<KasadaBotIDResponse> {
    return this.makeRequest<KasadaBotIDResponse>(
      `${KASADA_BASE_URL}/api/v1/botid`,
      JSON.stringify(req),
      'application/json',
    );
  }

  /**
   * Returns the Reese84 submission as the API sent it, because it must be
   * posted to the challenge endpoint unchanged.
   */
  async generateImpervaPayload(req: ImpervaPayloadRequest): Promise<string> {
    return this.send(
      `${IMPERVA_BASE_URL}/api/v1/payload`,
      JSON.stringify(req),
      'application/json',
    );
  }

  /** Returns the Imperva ___utmvc cookie. */
  async generateImpervaUTMVC(
    req: ImpervaUTMVCRequest,
  ): Promise<ImpervaUTMVCResponse> {
    return this.makeRequest<ImpervaUTMVCResponse>(
      `${IMPERVA_BASE_URL}/api/v1/utmvc`,
      JSON.stringify(req),
      'application/json',
    );
  }
}
