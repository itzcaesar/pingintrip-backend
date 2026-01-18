import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';

import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { UsersModule } from './users';
import { BookingsModule } from './bookings';
import { VehiclesModule } from './vehicles';
import { DriversModule } from './drivers';
import { GpsModule } from './gps';
import { GatewaysModule } from './gateways';
import { GformModule } from './integrations/gform';
import { HttpExceptionFilter } from './common/filters';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting for auth routes
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Database
    PrismaModule,

    // Core modules
    AuthModule,
    UsersModule,
    BookingsModule,
    VehiclesModule,
    DriversModule,
    GpsModule,

    // Integrations
    GformModule,

    // Realtime
    GatewaysModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule { }
