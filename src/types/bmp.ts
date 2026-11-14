/** Asks for an Akamai BMP sensor for a mobile app. */
export interface BMPSensorRequest {
  app: string;
  proxy: string;
  language?: string;
  deviceId?: string;
  android?: boolean;
  ipad?: boolean;
}

/** A cookie the app must set before it sends the sensor. */
export interface Cookie {
  name: string;
  value: string;
  domain: string;
}

/**
 * A BMP sensor and the device it was built for. The iOS and Android fields are
 * set only for that platform.
 */
export interface BMPSensorResponse {
  sensor: string;
  platform: string;

  ios?: string;
  kernelOsRelease?: string;
  kernelOsVersion?: string;
  machineId?: string;
  cookies?: Cookie[];

  android?: string;
  deviceModel?: string;
  deviceManufacturer?: string;
  sdkVersion?: string;
  appVersionCode?: number;

  deviceId: string;
  appVersion: string;
  screenHeight: number;
  screenWidth: number;
  language: string;
}
