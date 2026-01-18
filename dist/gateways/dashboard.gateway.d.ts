import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class DashboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    emitBookingCreated(booking: any): void;
    emitBookingUpdated(booking: any): void;
    emitVehicleLocationUpdated(data: {
        vehicleId: string;
        plateNumber: string;
        latitude: number;
        longitude: number;
        speed?: number;
        timestamp: Date;
    }): void;
}
