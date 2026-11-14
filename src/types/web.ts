/**
 * The values parseScript reads from an Akamai Web script, which
 * generateWebSensor needs. Its values stay `any`, because narrowing an exported
 * type would break callers.
 */
export type ScriptData = Record<string, any>;

/** Asks for an Akamai Web sensor. */
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

/** An Akamai Web sensor to post to the site. */
export interface WebSensorResponse {
  sensor: string;
}

/** Asks for an Akamai pixel sensor. */
export interface PixelRequest {
  userAgent: string;
  bazadebezolkohpepadr: number;
  hash: string;
}

/** An Akamai pixel sensor. */
export interface PixelResponse {
  sensor: string;
}

/** An Akamai sec-cpt challenge to solve. */
export interface SecCptRequest {
  'sec-cp-challenge'?: string;
  provider?: string;
  branding_url_content?: string;
  chlg_duration?: number;
  token: string;
  timestamp: number;
  nonce: string;
  difficulty: number;
  count: number;
  timeout?: number;
  cpu?: boolean;
  cookie: string;
}

/** The solved sec-cpt challenge to post to the site. */
export interface SecCptResponse {
  token: string;
  answers: string[];
}

/** Asks for an Akamai SBSD payload. */
export interface SBSDRequest {
  vid: string;
  userAgent: string;
  bm_o: string;
  legacy?: boolean;
  url: string;
  script_hash?: string;
  script_url?: string;
}

/** The SBSD request body to post to the site. */
export interface SBSDResponse {
  body: string;
}
