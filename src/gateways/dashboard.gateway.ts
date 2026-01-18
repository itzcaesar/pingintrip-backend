import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    namespace: '/dashboard',
    cors: {
        origin: '*',
        credentials: true,
    },
})
export class DashboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(DashboardGateway.name);

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // Booking events
    emitBookingCreated(booking: any) {
        this.server.emit('booking.created', booking);
        this.logger.debug(`Emitted booking.created for ${booking.id}`);
    }

    emitBookingUpdated(booking: any) {
        this.server.emit('booking.updated', booking);
        this.logger.debug(`Emitted booking.updated for ${booking.id}`);
    }

    // Vehicle location events
    emitVehicleLocationUpdated(data: {
        vehicleId: string;
        plateNumber: string;
        latitude: number;
        longitude: number;
        speed?: number;
        timestamp: Date;
    }) {
        this.server.emit('vehicle.location.updated', data);
        this.logger.debug(`Emitted vehicle.location.updated for ${data.vehicleId}`);
    }
}
