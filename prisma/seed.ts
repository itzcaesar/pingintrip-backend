import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database with IDR Pitch Data (Financials Included)...');

    // 1. Users
    const passwordHash = await bcrypt.hash('admin123', 10);
    const staffHash = await bcrypt.hash('staff123', 10);

    await prisma.user.upsert({
        where: { email: 'admin@pingintrip.com' },
        update: {},
        create: {
            email: 'admin@pingintrip.com',
            name: 'Admin Pingintrip',
            password: passwordHash,
            role: 'ADMIN',
        },
    });

    await prisma.user.upsert({
        where: { email: 'staff@pingintrip.com' },
        update: {},
        create: {
            email: 'staff@pingintrip.com',
            name: 'Budi Staff',
            password: staffHash,
            role: 'STAFF',
        },
    });

    // 2. Drivers
    const drivers = [
        'Asep Sunandar', 'Budi Santoso', 'Made Wirawan', 'Wayan Gede',
        'Agus Pratama', 'Siti Aminah', 'Rizky Febian', 'Eko Patrio',
        'Denny Caknan', 'Gilang Dirga'
    ];

    const driverRecords = [];
    for (const name of drivers) {
        const d = await prisma.driver.create({
            data: {
                name,
                phone: `+6281${Math.floor(Math.random() * 90000000 + 10000000)}`,
                role: ['DRIVER', 'GUIDE', 'BOTH'][Math.floor(Math.random() * 3)] as any,
                status: Math.random() > 0.2 ? 'ACTIVE' : 'OFF',
            },
        });
        driverRecords.push(d);
    }
    console.log(`✅ Created ${driverRecords.length} drivers`);

    // 3. Vehicles (With Rates)
    const carsData = [
        { brand: 'Toyota', model: 'Avanza', plate: 'DK 1234 AB', cap: 7, rate: 350000 },
        { brand: 'Toyota', model: 'Innova Reborn', plate: 'DK 5678 CD', cap: 7, rate: 750000 },
        { brand: 'Honda', model: 'Brio', plate: 'DK 9012 EF', cap: 5, rate: 300000 },
        { brand: 'Mitsubishi', model: 'Xpander', plate: 'DK 3456 GH', cap: 7, rate: 450000 },
        { brand: 'Toyota', model: 'HiAce', plate: 'DK 7890 IJ', cap: 15, rate: 1200000 },
        { brand: 'Suzuki', model: 'Jimny', plate: 'DK 9900 ST', cap: 4, rate: 500000 },
    ];

    const bikesData = [
        { brand: 'Honda', model: 'Vario 160', plate: 'DK 1122 KL', cap: 2, rate: 85000 },
        { brand: 'Yamaha', model: 'NMAX', plate: 'DK 3344 MN', cap: 2, rate: 120000 },
        { brand: 'Honda', model: 'PCX', plate: 'DK 5566 OP', cap: 2, rate: 120000 },
        { brand: 'Vespa', model: 'Sprint', plate: 'DK 7788 QR', cap: 2, rate: 150000 },
    ];

    const vehiclesData = [
        ...carsData.map(c => ({ ...c, type: 'CAR' })),
        ...bikesData.map(b => ({ ...b, type: 'MOTOR' }))
    ];

    const vehicleRecords = [];
    for (const v of vehiclesData) {
        const existing = await prisma.vehicle.findUnique({ where: { plateNumber: v.plate } });
        if (!existing) {
            const vec = await prisma.vehicle.create({
                data: {
                    type: v.type as any,
                    brand: v.brand,
                    model: v.model,
                    plateNumber: v.plate,
                    capacity: v.cap,
                    dailyRate: v.rate,
                    status: ['AVAILABLE', 'BOOKED', 'MAINTENANCE'][Math.floor(Math.random() * 3)] as any,
                },
            });
            vehicleRecords.push(vec);
        } else {
            vehicleRecords.push(existing);
        }
    }
    console.log(`✅ Created ${vehicleRecords.length} vehicles`);

    // 4. Bookings
    const statuses = ['PENDING', 'CONFIRMED', 'ON_TRIP', 'COMPLETED', 'CANCELLED'];
    const sources = ['WEB', 'GFORM', 'MANUAL'];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
        const isPast = Math.random() > 0.3;
        const daysOffset = Math.floor(Math.random() * 30) * (isPast ? -1 : 1);

        const pickupDate = new Date();
        pickupDate.setDate(now.getDate() + daysOffset);

        const duration = Math.floor(Math.random() * 5) + 1; // 1-5 days

        const vType = Math.random() > 0.3 ? 'CAR' : 'MOTOR';

        // Find matching vehicle
        let assignedVehicle = null;
        let status = isPast ? 'COMPLETED' : statuses[Math.floor(Math.random() * 3)];
        let price = 0;

        if (status !== 'PENDING' && status !== 'CANCELLED') {
            // assign random vehicle matching type
            const potential = vehicleRecords.filter(v => v.type === vType);
            if (potential.length > 0) {
                assignedVehicle = potential[Math.floor(Math.random() * potential.length)];
                price = Number(assignedVehicle.dailyRate) * duration;
            }
        } else {
            // Estimate price based on type avg
            const base = vType === 'CAR' ? 400000 : 100000;
            price = base * duration;
        }

        await prisma.booking.create({
            data: {
                customerName: `Customer ${i + 1}`,
                phone: `+62812${Math.floor(Math.random() * 10000000)}`,
                source: sources[Math.floor(Math.random() * sources.length)] as any,
                vehicleType: vType as any,
                pickupDate,
                duration,
                pickupLocation: 'Ngurah Rai Airport',
                dropoffLocation: 'Ubud Center',
                status: status as any,
                totalPrice: price,
                assignedVehicleId: assignedVehicle ? assignedVehicle.id : undefined,
                assignedDriverId: assignedVehicle && vType === 'CAR' && Math.random() > 0.5 ? driverRecords[Math.floor(Math.random() * driverRecords.length)].id : undefined,
            },
        });
    }

    console.log('✅ Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
