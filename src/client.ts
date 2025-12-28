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

  private async makeRequest<T>(url: string, body: any): Promise<T> {
    const { statusCode, body: responseBody } = await request(url, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
      req
    );
  }

  // Web API Methods
  async generateWebSensor(req: WebSensorRequest): Promise<WebSensorResponse> {
    return this.makeRequest<WebSensorResponse>(
      `${WEB_BASE_URL}/api/v1/sensor`,
      req
    );
  }

  async generatePixel(req: PixelRequest): Promise<PixelResponse> {
    return this.makeRequest<PixelResponse>(
      `${WEB_BASE_URL}/api/v1/pixel`,
      req
    );
  }

  async solveSecCpt(req: SecCptRequest): Promise<SecCptResponse> {
    return this.makeRequest<SecCptResponse>(
      `${WEB_BASE_URL}/api/v1/sec-cpt`,
      req
    );
  }

  async solveSBSD(req: SBSDRequest): Promise<SBSDResponse> {
    return this.makeRequest<SBSDResponse>(
      `${WEB_BASE_URL}/api/v1/sbsd`,
      req
    );
  }

  async parseScript(scriptContent: string): Promise<ScriptData> {
    return this.makeRequest<ScriptData>(
      `${WEB_BASE_URL}/api/v1/parse`,
      scriptContent
    );
  }
}
