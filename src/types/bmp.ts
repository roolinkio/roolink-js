export interface BMPSensorRequest {
  app: string;
  proxy: string;
  language?: string;
  deviceId?: string;
  android?: boolean;
  ipad?: boolean;
}

export interface Cookie {
  name: string;
  value: string;
  domain: string;
}

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
