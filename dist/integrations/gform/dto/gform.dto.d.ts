import { VehicleType } from '@prisma/client';
export declare class GformWebhookDto {
    customerName: string;
    phone: string;
    vehicleType: VehicleType;
    pickupDate: string;
    duration: string;
    pickupLocation: string;
    dropoffLocation: string;
    notes?: string;
    responseId: string;
    formId: string;
}
