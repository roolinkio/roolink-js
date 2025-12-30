import { request, Dispatcher } from 'undici';
import {
  BMPSensorRequest,
  BMPSensorResponse,
} from './types/bmp';
import {
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

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.timeout = DEFAULT_TIMEOUT;
  }

  private async makeRequest<T>(url: string, body: string, contentType: string): Promise<T> {
    const { statusCode, body: responseBody } = await request(url, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': contentType,
      },
      body: body,
      bodyTimeout: this.timeout,
      headersTimeout: this.timeout,
    });

    if (statusCode >= 400) {
      const errorText = await responseBody.text();
      throw new Error(`API error (status ${statusCode}): ${errorText}`);
    }

    const data = await responseBody.json();
    return data as T;
  }

  // BMP API Methods
  async generateBMPSensor(req: BMPSensorRequest): Promise<BMPSensorResponse> {
    return this.makeRequest<BMPSensorResponse>(
      `${BMP_BASE_URL}/api/v1/sensor`,
      JSON.stringify(req),
      'application/json'
    );
  }

  // Web API Methods
  async generateWebSensor(req: WebSensorRequest): Promise<WebSensorResponse> {
    return this.makeRequest<WebSensorResponse>(
      `${WEB_BASE_URL}/api/v1/sensor`,
      JSON.stringify(req),
      'application/json'
    );
  }

  async generatePixel(req: PixelRequest): Promise<PixelResponse> {
    return this.makeRequest<PixelResponse>(
      `${WEB_BASE_URL}/api/v1/pixel`,
      JSON.stringify(req),
      'application/json'
    );
  }

  async solveSecCpt(req: SecCptRequest): Promise<SecCptResponse> {
    return this.makeRequest<SecCptResponse>(
      `${WEB_BASE_URL}/api/v1/sec-cpt`,
      JSON.stringify(req),
      'application/json'
    );
  }

  async solveSBSD(req: SBSDRequest): Promise<SBSDResponse> {
    return this.makeRequest<SBSDResponse>(
      `${WEB_BASE_URL}/api/v1/sbsd`,
      JSON.stringify(req),
      'application/json'
    );
  }

  async parseScript(scriptContent: string): Promise<ScriptData> {
    return this.makeRequest<ScriptData>(
      `${WEB_BASE_URL}/api/v1/parse`,
      scriptContent,
      'text/plain'
    );
  }
}
