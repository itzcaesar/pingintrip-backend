import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
    console.log('🧹 Clearing database data...');

    // Delete bookings first (has foreign keys)
    const deletedBookings = await prisma.booking.deleteMany({});
    console.log(`❌ Deleted ${deletedBookings.count} bookings`);

    // Delete drivers
    const deletedDrivers = await prisma.driver.deleteMany({});
    console.log(`❌ Deleted ${deletedDrivers.count} drivers`);

    // Delete vehicles
    const deletedVehicles = await prisma.vehicle.deleteMany({});
    console.log(`❌ Deleted ${deletedVehicles.count} vehicles`);

    console.log('✅ Database cleared! Only users remain.');
}

clearData()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
