export interface BMPSensorRequest {
  app: string;
  proxy: string;
  language?: string;
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

  // iOS specific fields
  ios?: string;
  kernelOsRelease?: string;
  kernelOsVersion?: string;
  machineId?: string;
  cookies?: Cookie[];

  // Android specific fields
  android?: string;
  deviceModel?: string;
  deviceManufacturer?: string;
  sdkVersion?: string;

  // Common fields
  deviceId: string;
  appVersion: string;
  screenHeight: number;
  screenWidth: number;
  language: string;
}
