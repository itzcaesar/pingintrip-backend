import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto, QueryVehiclesDto, CreateMaintenanceDto, UpdateMaintenanceDto, UpdateOdometerDto, AddVehicleImageDto } from './dto';
export declare class VehiclesController {
    private readonly vehiclesService;
    constructor(vehiclesService: VehiclesService);
    create(createVehicleDto: CreateVehicleDto): Promise<{
        gpsDevice: {
            id: string;
            createdAt: Date;
            deviceId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.VehicleType;
        notes: string | null;
        status: import("@prisma/client").$Enums.VehicleStatus;
        deletedAt: Date | null;
        brand: string;
        model: string;
        plateNumber: string;
        capacity: number;
        dailyRate: number;
        gpsDeviceId: string | null;
        odometer: number;
        oilChangeKm: number;
        coolantChangeKm: number;
        lastOilChangeKm: number;
        lastCoolantKm: number;
    }>;
    findAll(queryDto: QueryVehiclesDto): Promise<import("../common").PaginatedResult<any>>;
    getAvailable(type?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.VehicleType;
        notes: string | null;
        status: import("@prisma/client").$Enums.VehicleStatus;
        deletedAt: Date | null;
        brand: string;
        model: string;
        plateNumber: string;
        capacity: number;
        dailyRate: number;
        gpsDeviceId: string | null;
        odometer: number;
        oilChangeKm: number;
        coolantChangeKm: number;
        lastOilChangeKm: number;
        lastCoolantKm: number;
    }[]>;
    findOne(id: string): Promise<{
        gpsDevice: ({
            locations: {
                id: string;
                deviceId: string;
                timestamp: Date;
                latitude: number;
                longitude: number;
                speed: number | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            deviceId: string;
        }) | null;
        bookings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            customerName: string;
            source: import("@prisma/client").$Enums.BookingSource;
            vehicleType: import("@prisma/client").$Enums.VehicleType;
            pickupDate: Date;
            duration: number;
            pickupLocation: string;
            dropoffLocation: string | null;
            notes: string | null;
            assignedVehicleId: string | null;
            assignedDriverId: string | null;
            status: import("@prisma/client").$Enums.BookingStatus;
            totalPrice: number;
            deletedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.VehicleType;
        notes: string | null;
        status: import("@prisma/client").$Enums.VehicleStatus;
        deletedAt: Date | null;
        brand: string;
        model: string;
        plateNumber: string;
        capacity: number;
        dailyRate: number;
        gpsDeviceId: string | null;
        odometer: number;
        oilChangeKm: number;
        coolantChangeKm: number;
        lastOilChangeKm: number;
        lastCoolantKm: number;
    }>;
    update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<{
        gpsDevice: {
            id: string;
            createdAt: Date;
            deviceId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.VehicleType;
        notes: string | null;
        status: import("@prisma/client").$Enums.VehicleStatus;
        deletedAt: Date | null;
        brand: string;
        model: string;
        plateNumber: string;
        capacity: number;
        dailyRate: number;
        gpsDeviceId: string | null;
        odometer: number;
        oilChangeKm: number;
        coolantChangeKm: number;
        lastOilChangeKm: number;
        lastCoolantKm: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    updateOdometer(id: string, dto: UpdateOdometerDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.VehicleType;
        notes: string | null;
        status: import("@prisma/client").$Enums.VehicleStatus;
        deletedAt: Date | null;
        brand: string;
        model: string;
        plateNumber: string;
        capacity: number;
        dailyRate: number;
        gpsDeviceId: string | null;
        odometer: number;
        oilChangeKm: number;
        coolantChangeKm: number;
        lastOilChangeKm: number;
        lastCoolantKm: number;
    }>;
    getMaintenance(id: string): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        type: string;
        notes: string | null;
        dueAtKm: number | null;
        dueDate: Date | null;
        cost: number;
        completedAt: Date | null;
        vehicleId: string;
    }[]>;
    addMaintenance(id: string, dto: CreateMaintenanceDto): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        type: string;
        notes: string | null;
        dueAtKm: number | null;
        dueDate: Date | null;
        cost: number;
        completedAt: Date | null;
        vehicleId: string;
    }>;
    updateMaintenance(id: string, maintenanceId: string, dto: UpdateMaintenanceDto): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        type: string;
        notes: string | null;
        dueAtKm: number | null;
        dueDate: Date | null;
        cost: number;
        completedAt: Date | null;
        vehicleId: string;
    }>;
    deleteMaintenance(id: string, maintenanceId: string): Promise<{
        message: string;
    }>;
    getImages(id: string): Promise<{
        id: string;
        createdAt: Date;
        url: string;
        isPrimary: boolean;
        vehicleId: string;
    }[]>;
    addImage(id: string, dto: AddVehicleImageDto): Promise<{
        id: string;
        createdAt: Date;
        url: string;
        isPrimary: boolean;
        vehicleId: string;
    }>;
    removeImage(id: string, imageId: string): Promise<{
        message: string;
    }>;
}
