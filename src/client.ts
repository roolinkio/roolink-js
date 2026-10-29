import {gzipSync} from 'node:zlib';
import {request} from 'undici';
import type {BMPSensorRequest, BMPSensorResponse} from './types/bmp';
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

const DEFAULT_TIMEOUT = 30000;
const BMP_BASE_URL = 'https://bmp.roolink.io';
const WEB_BASE_URL = 'https://web.roolink.io';

export class RoolinkClient {
  private apiKey: string;
  private timeout: number;
  private compress: boolean;

  /** `compress` sets whether parseScript gzips the script payload (enabled by default). */
  constructor(apiKey: string, {compress = true}: {compress?: boolean} = {}) {
    this.apiKey = apiKey;
    this.timeout = DEFAULT_TIMEOUT;
    this.compress = compress;
  }

  private async send(
    url: string,
    body: string,
    contentType: string,
    compress = false,
  ): Promise<string> {
    const {statusCode, body: responseBody} = await request(url, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': contentType,
        ...(compress && {'Content-Encoding': 'gzip'}),
      },
      body: compress ? gzipSync(body) : body,
      bodyTimeout: this.timeout,
      headersTimeout: this.timeout,
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
    compress = false,
  ): Promise<T> {
    return JSON.parse(
      await this.send(url, body, contentType, compress),
    ) as T;
  }

  async generateBMPSensor(req: BMPSensorRequest): Promise<BMPSensorResponse> {
    return this.makeRequest<BMPSensorResponse>(
      `${BMP_BASE_URL}/api/v1/sensor`,
      JSON.stringify(req),
      'application/json',
    );
  }

  async generateWebSensor(req: WebSensorRequest): Promise<WebSensorResponse> {
    return this.makeRequest<WebSensorResponse>(
      `${WEB_BASE_URL}/api/v1/sensor`,
      JSON.stringify(req),
      'application/json',
    );
  }

  // /pixel returns the sensor as text/plain, not JSON.
  async generatePixel(req: PixelRequest): Promise<PixelResponse> {
    const sensor = await this.send(
      `${WEB_BASE_URL}/api/v1/pixel`,
      JSON.stringify(req),
      'application/json',
    );
    return {sensor};
  }

  async solveSecCpt(req: SecCptRequest): Promise<SecCptResponse> {
    return this.makeRequest<SecCptResponse>(
      `${WEB_BASE_URL}/api/v1/sec-cpt`,
      JSON.stringify(req),
      'application/json',
    );
  }

  async solveSBSD(req: SBSDRequest): Promise<SBSDResponse> {
    return this.makeRequest<SBSDResponse>(
      `${WEB_BASE_URL}/api/v1/sbsd`,
      JSON.stringify(req),
      'application/json',
    );
  }

  async parseScript(scriptContent: string): Promise<ScriptData> {
    return this.makeRequest<ScriptData>(
      `${WEB_BASE_URL}/api/v1/parse`,
      scriptContent,
      'text/plain',
      this.compress,
    );
  }
}
