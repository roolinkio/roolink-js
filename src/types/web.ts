export type ScriptData = Record<string, any>;

export interface WebSensorRequest {
  userAgent: string;
  flags?: string;
  url: string;
  _abck?: string;
  bm_sz?: string;
  sec_cpt?: boolean;
  index?: number;
  stepper?: boolean;
  keyboard?: boolean;
  count?: boolean;
  language?: string;
  scriptData?: ScriptData;
  scriptUrl?: string;
}

export interface WebSensorResponse {
  sensor: string;
}

export interface PixelRequest {
  userAgent: string;
  bazadebezolkohpepadr: number;
  hash: string;
}

export interface PixelResponse {
  sensor: string;
}

export interface SecCptRequest {
  'sec-cp-challenge'?: string;
  provider?: string;
  branding_url_content?: string;
  chlg_duration?: number;
  token: string;
  timestamp: number;
  nonce: string;
  difficulty: number;
  timeout?: number;
  cpu?: boolean;
  cookie: string;
}

export interface SecCptResponse {
  token: string;
  answers: string[];
}

export interface SBSDRequest {
  vid: string;
  userAgent: string;
  bm_o: string;
  legacy?: boolean;
  url: string;
  script_hash?: string;
  script_url?: string;
}

export interface SBSDResponse {
  body: string;
}

export interface ParseResponse {
  scriptData: ScriptData;
}
