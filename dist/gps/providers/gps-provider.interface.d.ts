export interface GpsLocationData {
    deviceId: string;
    latitude: number;
    longitude: number;
    speed?: number;
    timestamp?: Date;
}
export interface GpsProvider {
    parseLocationUpdate(data: any): GpsLocationData;
    validateApiKey(apiKey: string): boolean;
}
