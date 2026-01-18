import { PrismaClient, Role, VehicleType, DriverRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@pingintrip.com' },
        update: {},
        create: {
            email: 'admin@pingintrip.com',
            password: adminPassword,
            name: 'Admin User',
            role: Role.ADMIN,
            isActive: true,
        },
    });
    console.log(`✅ Created admin user: ${admin.email}`);

    const staff = await prisma.user.upsert({
        where: { email: 'staff@pingintrip.com' },
        update: {},
        create: {
            email: 'staff@pingintrip.com',
            password: staffPassword,
            name: 'Staff User',
            role: Role.STAFF,
            isActive: true,
        },
    });
    console.log(`✅ Created staff user: ${staff.email}`);

    // Create GPS devices
    const gpsDevice1 = await prisma.gpsDevice.upsert({
        where: { deviceId: 'GPS-001' },
        update: {},
        create: { deviceId: 'GPS-001' },
    });

    const gpsDevice2 = await prisma.gpsDevice.upsert({
        where: { deviceId: 'GPS-002' },
        update: {},
        create: { deviceId: 'GPS-002' },
    });

    const gpsDevice3 = await prisma.gpsDevice.upsert({
        where: { deviceId: 'GPS-003' },
        update: {},
        create: { deviceId: 'GPS-003' },
    });

    // Create vehicles
    const vehicle1 = await prisma.vehicle.upsert({
        where: { plateNumber: 'DR 1234 AB' },
        update: {},
        create: {
            type: VehicleType.CAR,
            brand: 'Toyota',
            model: 'Avanza',
            plateNumber: 'DR 1234 AB',
            capacity: 7,
            notes: 'Family car with AC',
            gpsDeviceId: gpsDevice1.id,
        },
    });
    console.log(`✅ Created vehicle: ${vehicle1.plateNumber}`);

    const vehicle2 = await prisma.vehicle.upsert({
        where: { plateNumber: 'DR 5678 CD' },
        update: {},
        create: {
            type: VehicleType.CAR,
            brand: 'Toyota',
            model: 'Innova',
            plateNumber: 'DR 5678 CD',
            capacity: 8,
            notes: 'Premium MPV',
            gpsDeviceId: gpsDevice2.id,
        },
    });
    console.log(`✅ Created vehicle: ${vehicle2.plateNumber}`);

    const vehicle3 = await prisma.vehicle.upsert({
        where: { plateNumber: 'DR 9012 EF' },
        update: {},
        create: {
            type: VehicleType.MOTOR,
            brand: 'Honda',
            model: 'PCX 160',
            plateNumber: 'DR 9012 EF',
            capacity: 2,
            notes: 'Automatic scooter',
            gpsDeviceId: gpsDevice3.id,
        },
    });
    console.log(`✅ Created vehicle: ${vehicle3.plateNumber}`);

    // Create drivers
    const driver1 = await prisma.driver.upsert({
        where: { id: 'driver-1' },
        update: {},
        create: {
            id: 'driver-1',
            name: 'Budi Santoso',
            phone: '081234567890',
            role: DriverRole.DRIVER,
            notes: 'Experienced driver, 5 years',
        },
    });
    console.log(`✅ Created driver: ${driver1.name}`);

    const driver2 = await prisma.driver.upsert({
        where: { id: 'driver-2' },
        update: {},
        create: {
            id: 'driver-2',
            name: 'Made Wirawan',
            phone: '081234567891',
            role: DriverRole.BOTH,
            notes: 'Driver and tour guide, speaks English',
        },
    });
    console.log(`✅ Created driver: ${driver2.name}`);

    console.log('✅ Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
