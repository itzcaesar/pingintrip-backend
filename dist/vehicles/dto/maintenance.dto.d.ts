export declare enum MaintenanceType {
    OIL_CHANGE = "OIL_CHANGE",
    COOLANT = "COOLANT",
    TIRE = "TIRE",
    INSPECTION = "INSPECTION",
    OTHER = "OTHER"
}
export declare class CreateMaintenanceDto {
    type: MaintenanceType;
    description?: string;
    dueAtKm?: number;
    dueDate?: string;
    cost?: number;
    notes?: string;
}
export declare class UpdateMaintenanceDto {
    completedAt?: string;
    cost?: number;
    notes?: string;
}
export declare class UpdateOdometerDto {
    odometer: number;
}
export declare class AddVehicleImageDto {
    url: string;
    isPrimary?: boolean;
}
