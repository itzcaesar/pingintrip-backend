import { PrismaClient, Driver, Vehicle, GpsDevice, Booking, DriverRole, DriverStatus, VehicleType, BookingStatus, BookingSource, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ============================================================================
// REALISTIC INDONESIAN DATA
// ============================================================================

const INDONESIAN_FIRST_NAMES = [
    'Wayan', 'Made', 'Nyoman', 'Ketut', 'Putu', 'Kadek', 'Komang', 'Gede',
    'Agus', 'Budi', 'Dewi', 'Sari', 'Putri', 'Sri', 'Ayu', 'Eka',
    'Dodi', 'Rini', 'Wati', 'Sandi', 'Rizki', 'Andi', 'Yudi', 'Hadi',
    'Lukman', 'Arief', 'Bagus', 'Indra', 'Nia', 'Fitri', 'Maya', 'Dian'
];

const INDONESIAN_LAST_NAMES = [
    'Suryawan', 'Pratama', 'Wijaya', 'Kusuma', 'Dharma', 'Mahendra', 'Wibawa',
    'Saputra', 'Hidayat', 'Santoso', 'Wibowo', 'Nugroho', 'Susanto', 'Kurniawan',
    'Permana', 'Purnama', 'Setiawan', 'Budiman', 'Hartono', 'Gunawan'
];

// ============================================================================
// REALISTIC LOMBOK TRAVEL ROUTES
// These represent actual travel patterns in Lombok tourism
// ============================================================================

type TripRoute = {
    pickup: string;
    dropoff: string;
    duration: number;  // typical duration in days
    category: 'AIRPORT_TRANSFER' | 'GILI_TRIP' | 'SOUTH_BEACHES' | 'RINJANI' | 'ISLAND_TOUR' | 'CITY_TOUR';
    vehicleTypes: VehicleType[];  // suitable vehicle types
};

const LOMBOK_ROUTES: TripRoute[] = [
    // Airport Transfers (most common)
    { pickup: 'Bandara Lombok Praya', dropoff: 'Hotel Senggigi Area', duration: 1, category: 'AIRPORT_TRANSFER', vehicleTypes: ['CAR', 'VAN'] },
    { pickup: 'Bandara Lombok Praya', dropoff: 'Kuta Mandalika', duration: 1, category: 'AIRPORT_TRANSFER', vehicleTypes: ['CAR', 'VAN'] },
    { pickup: 'Bandara Lombok Praya', dropoff: 'Mataram City', duration: 1, category: 'AIRPORT_TRANSFER', vehicleTypes: ['CAR', 'VAN'] },
    { pickup: 'Hotel Senggigi Area', dropoff: 'Bandara Lombok Praya', duration: 1, category: 'AIRPORT_TRANSFER', vehicleTypes: ['CAR', 'VAN'] },
    { pickup: 'Kuta Mandalika', dropoff: 'Bandara Lombok Praya', duration: 1, category: 'AIRPORT_TRANSFER', vehicleTypes: ['CAR', 'VAN'] },

    // Gili Island Day Trips (via Bangsal Harbour)
    { pickup: 'Hotel Senggigi Area', dropoff: 'Bangsal Harbour (Gili Boats)', duration: 1, category: 'GILI_TRIP', vehicleTypes: ['CAR', 'MOTOR'] },
    { pickup: 'Mataram City', dropoff: 'Bangsal Harbour (Gili Boats)', duration: 1, category: 'GILI_TRIP', vehicleTypes: ['CAR', 'MOTOR'] },
    { pickup: 'Bangsal Harbour', dropoff: 'Hotel Senggigi Area', duration: 1, category: 'GILI_TRIP', vehicleTypes: ['CAR', 'MOTOR'] },

    // South Beaches Tour (Kuta, Tanjung Aan, Selong Belanak)
    { pickup: 'Hotel Senggigi Area', dropoff: 'South Beaches (Kuta, Tanjung Aan, Selong Belanak)', duration: 1, category: 'SOUTH_BEACHES', vehicleTypes: ['CAR', 'MOTOR'] },
    { pickup: 'Mataram City', dropoff: 'South Beaches Tour', duration: 1, category: 'SOUTH_BEACHES', vehicleTypes: ['CAR', 'MOTOR'] },
    { pickup: 'Kuta Mandalika', dropoff: 'Tanjung Aan & Selong Belanak', duration: 1, category: 'SOUTH_BEACHES', vehicleTypes: ['MOTOR'] },
    { pickup: 'Bandara Lombok Praya', dropoff: 'Kuta Beaches Full Day', duration: 2, category: 'SOUTH_BEACHES', vehicleTypes: ['CAR', 'VAN'] },

    // Mount Rinjani Trekking (requires multi-day)
    { pickup: 'Mataram City', dropoff: 'Sembalun Village (Rinjani Basecamp)', duration: 3, category: 'RINJANI', vehicleTypes: ['CAR', 'VAN'] },
    { pickup: 'Hotel Senggigi Area', dropoff: 'Senaru (Rinjani Basecamp)', duration: 3, category: 'RINJANI', vehicleTypes: ['CAR', 'VAN'] },
    { pickup: 'Bandara Lombok Praya', dropoff: 'Sembalun Village (Rinjani Trek)', duration: 4, category: 'RINJANI', vehicleTypes: ['CAR', 'VAN'] },

    // Full Island Tour
    { pickup: 'Bandara Lombok Praya', dropoff: 'Lombok Island Full Tour', duration: 3, category: 'ISLAND_TOUR', vehicleTypes: ['CAR', 'VAN'] },
    { pickup: 'Hotel Senggigi Area', dropoff: 'Lombok Circle Tour', duration: 2, category: 'ISLAND_TOUR', vehicleTypes: ['CAR', 'VAN'] },
    { pickup: 'Kuta Mandalika', dropoff: 'North Lombok & Senggigi Tour', duration: 2, category: 'ISLAND_TOUR', vehicleTypes: ['CAR'] },

    // City & Culture Tours
    { pickup: 'Hotel Senggigi Area', dropoff: 'Sasak Village Sade & Pottery Village', duration: 1, category: 'CITY_TOUR', vehicleTypes: ['CAR', 'MOTOR'] },
    { pickup: 'Mataram City', dropoff: 'Narmada Temple & Mayura Water Palace', duration: 1, category: 'CITY_TOUR', vehicleTypes: ['CAR', 'MOTOR'] },
    { pickup: 'Kuta Mandalika', dropoff: 'Traditional Weaving Villages', duration: 1, category: 'CITY_TOUR', vehicleTypes: ['CAR', 'MOTOR'] },

    // Scooter rentals (self-drive exploration)
    { pickup: 'Kuta Mandalika', dropoff: 'Self-drive Exploration (Scooter)', duration: 1, category: 'SOUTH_BEACHES', vehicleTypes: ['MOTOR'] },
    { pickup: 'Hotel Senggigi Area', dropoff: 'Self-drive Exploration (Scooter)', duration: 2, category: 'CITY_TOUR', vehicleTypes: ['MOTOR'] },
    { pickup: 'Mataram City', dropoff: 'Self-drive Exploration (Scooter)', duration: 3, category: 'ISLAND_TOUR', vehicleTypes: ['MOTOR'] },
];

// Specific GPS coordinates for real locations in Lombok (ON LAND)
const LOMBOK_LOCATIONS = [
    // Mataram City (Capital)
    { lat: -8.5833, lng: 116.1167, name: 'Mataram City Center' },
    { lat: -8.5775, lng: 116.1231, name: 'Mataram Mall' },
    { lat: -8.5912, lng: 116.0986, name: 'Ampenan' },
    // Senggigi Beach Road
    { lat: -8.4927, lng: 116.0465, name: 'Senggigi Beach' },
    { lat: -8.5102, lng: 116.0587, name: 'Senggigi Central' },
    { lat: -8.4756, lng: 116.0321, name: 'Mangsit' },
    // Lombok Airport Area
    { lat: -8.7573, lng: 116.2765, name: 'Lombok Praya Airport' },
    { lat: -8.7489, lng: 116.2654, name: 'Airport Road' },
    // Kuta Lombok (South)
    { lat: -8.8989, lng: 116.2889, name: 'Kuta Lombok' },
    { lat: -8.8876, lng: 116.3012, name: 'Tanjung Aan' },
    { lat: -8.8765, lng: 116.2567, name: 'Selong Belanak' },
    // Central Lombok
    { lat: -8.6512, lng: 116.1234, name: 'Praya Town' },
    { lat: -8.6234, lng: 116.1567, name: 'Jonggat' },
    // Mount Rinjani Area
    { lat: -8.4112, lng: 116.4223, name: 'Sembalun Village' },
    { lat: -8.3989, lng: 116.3876, name: 'Senaru' },
    // West Lombok
    { lat: -8.5234, lng: 116.0123, name: 'Lembar Port' },
    { lat: -8.5567, lng: 116.0456, name: 'Gerung' },
];

function randomLombokGPS() {
    // Pick a random known location and add small variance (100-500m)
    const base = LOMBOK_LOCATIONS[Math.floor(Math.random() * LOMBOK_LOCATIONS.length)];
    return {
        lat: base.lat + (Math.random() - 0.5) * 0.005, // ~500m variance
        lng: base.lng + (Math.random() - 0.5) * 0.005,
    };
}

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomIndonesianName(): string {
    return `${randomElement(INDONESIAN_FIRST_NAMES)} ${randomElement(INDONESIAN_LAST_NAMES)}`;
}

function randomIndonesianPhone(): string {
    const prefixes = ['812', '813', '821', '822', '852', '853', '857', '858', '877', '878'];
    return `+62${randomElement(prefixes)}${Math.floor(10000000 + Math.random() * 90000000)}`;
}

function randomEmail(name: string): string {
    const domains = ['gmail.com', 'yahoo.co.id', 'outlook.com', 'icloud.com'];
    const cleanName = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
    return `${cleanName}${Math.floor(Math.random() * 100)}@${randomElement(domains)}`;
}

function getDateDaysFromNow(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}

async function main() {
    console.log('🌱 Seeding production-like data for Pingintrip Demo...');
    console.log('================================================');

    // Clear existing data (optional - for fresh seed)
    console.log('🗑️  Clearing existing data...');
    await prisma.gpsLocation.deleteMany({});
    await prisma.bookingHistory.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.vehicleMaintenance.deleteMany({});
    await prisma.vehicleImage.deleteMany({});
    await prisma.vehicle.deleteMany({});
    await prisma.gpsDevice.deleteMany({});
    await prisma.driver.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.systemSetting.deleteMany({});
    // Keep users

    // ========================================================================
    // 1. USERS
    // ========================================================================
    console.log('\n👤 Creating users...');
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
        where: { email: 'operator@pingintrip.com' },
        update: {},
        create: {
            email: 'operator@pingintrip.com',
            name: 'Wayan Operator',
            password: staffHash,
            role: 'STAFF',
        },
    });
    console.log('   ✓ 2 users created');

    // ========================================================================
    // 2. DRIVERS (8 drivers)
    // ========================================================================
    console.log('\n🚗 Creating drivers...');
    const driverData = [
        { name: 'Wayan Sudiarta', role: 'BOTH', status: 'ACTIVE' },
        { name: 'Made Wirawan', role: 'DRIVER', status: 'ACTIVE' },
        { name: 'Nyoman Gede Putra', role: 'DRIVER', status: 'ACTIVE' },
        { name: 'Ketut Sudirman', role: 'BOTH', status: 'ACTIVE' },
        { name: 'Agus Pratama', role: 'GUIDE', status: 'ACTIVE' },
        { name: 'Putu Darma', role: 'DRIVER', status: 'OFF' },
        { name: 'Kadek Sutrisna', role: 'BOTH', status: 'ACTIVE' },
        { name: 'Komang Budi', role: 'DRIVER', status: 'ACTIVE' },
    ];

    const drivers: Driver[] = [];
    for (const d of driverData) {
        const driver = await prisma.driver.create({
            data: {
                name: d.name,
                phone: randomIndonesianPhone(),
                role: d.role as DriverRole,
                status: d.status as DriverStatus,
                notes: d.role === 'GUIDE' ? 'Certified tour guide with 5+ years experience' : null,
            },
        });
        drivers.push(driver);
    }
    console.log(`   ✓ ${drivers.length} drivers created`);

    // ========================================================================
    // 3. GPS DEVICES (23 devices - one per vehicle)
    // ========================================================================
    console.log('\n📍 Creating GPS devices...');
    const gpsDevices: GpsDevice[] = [];
    for (let i = 1; i <= 26; i++) {  // 26 devices for 26 vehicles (15 cars + 8 motors + 3 vans)
        const device = await prisma.gpsDevice.create({
            data: {
                deviceId: `GPS-${String(i).padStart(3, '0')}`,
            },
        });
        gpsDevices.push(device);
    }
    console.log(`   ✓ ${gpsDevices.length} GPS devices created`);

    // ========================================================================
    // 4. VEHICLES (26 vehicles: 15 cars, 8 motorcycles, 3 vans)
    // ========================================================================
    console.log('\n🚙 Creating vehicles...');
    const vehicleData = [
        // CARS (15 units)
        { type: 'CAR', brand: 'Toyota', model: 'Avanza', plate: 'DR 1234 AB', cap: 7, rate: 350000, odo: 45000 },
        { type: 'CAR', brand: 'Toyota', model: 'Innova Reborn', plate: 'DR 5678 CD', cap: 7, rate: 750000, odo: 32000 },
        { type: 'CAR', brand: 'Toyota', model: 'Avanza Veloz', plate: 'DR 8765 EF', cap: 7, rate: 400000, odo: 58000 },
        { type: 'CAR', brand: 'Honda', model: 'Brio RS', plate: 'DR 9012 GH', cap: 5, rate: 300000, odo: 28000 },
        { type: 'CAR', brand: 'Mitsubishi', model: 'Xpander Cross', plate: 'DR 3456 IJ', cap: 7, rate: 500000, odo: 41000 },
        { type: 'CAR', brand: 'Toyota', model: 'HiAce Commuter', plate: 'DR 7890 KL', cap: 15, rate: 1200000, odo: 65000 },
        { type: 'CAR', brand: 'Suzuki', model: 'Ertiga GX', plate: 'DR 2345 MN', cap: 7, rate: 350000, odo: 38000 },
        { type: 'CAR', brand: 'Suzuki', model: 'Jimny', plate: 'DR 6789 OP', cap: 4, rate: 650000, odo: 22000 },
        { type: 'CAR', brand: 'Daihatsu', model: 'Terios X', plate: 'DR 2468 ST', cap: 7, rate: 400000, odo: 51000 },
        { type: 'CAR', brand: 'Nissan', model: 'Livina', plate: 'DR 1357 UV', cap: 7, rate: 350000, odo: 42000 },
        { type: 'CAR', brand: 'Toyota', model: 'Alphard', plate: 'DR 8899 XYZ', cap: 7, rate: 2500000, odo: 15000 },
        { type: 'CAR', brand: 'Toyota', model: 'Fortuner GR', plate: 'DR 1122 GR', cap: 7, rate: 1800000, odo: 25000 },
        { type: 'CAR', brand: 'Hyundai', model: 'Stargazer X', plate: 'DR 3344 ST', cap: 7, rate: 450000, odo: 12000 },
        { type: 'CAR', brand: 'Wuling', model: 'Air EV', plate: 'DR 5566 EV', cap: 4, rate: 500000, odo: 5000 },
        { type: 'CAR', brand: 'Toyota', model: 'Raize GR', plate: 'DR 7788 RZ', cap: 5, rate: 450000, odo: 18000 },
        // MOTORCYCLES (8 units)
        { type: 'MOTOR', brand: 'Honda', model: 'Vario 160', plate: 'DR 1122 AA', cap: 2, rate: 85000, odo: 12000 },
        { type: 'MOTOR', brand: 'Yamaha', model: 'NMAX', plate: 'DR 3344 BB', cap: 2, rate: 120000, odo: 18000 },
        { type: 'MOTOR', brand: 'Honda', model: 'PCX 160', plate: 'DR 5566 CC', cap: 2, rate: 130000, odo: 15000 },
        { type: 'MOTOR', brand: 'Vespa', model: 'Sprint 150', plate: 'DR 7788 DD', cap: 2, rate: 175000, odo: 8000 },
        { type: 'MOTOR', brand: 'Honda', model: 'Scoopy', plate: 'DR 9900 EE', cap: 2, rate: 75000, odo: 22000 },
        { type: 'MOTOR', brand: 'Yamaha', model: 'Aerox 155', plate: 'DR 1133 FF', cap: 2, rate: 100000, odo: 19000 },
        { type: 'MOTOR', brand: 'Honda', model: 'ADV 160', plate: 'DR 4466 II', cap: 2, rate: 150000, odo: 9000 },
        { type: 'MOTOR', brand: 'Kawasaki', model: 'Ninja 250', plate: 'DR 5577 JJ', cap: 2, rate: 250000, odo: 7500 },
        // VANS (3 units)
        { type: 'VAN', brand: 'Toyota', model: 'HiAce Premio', plate: 'DR 1001 VN', cap: 12, rate: 1500000, odo: 35000 },
        { type: 'VAN', brand: 'Isuzu', model: 'Elf NLR', plate: 'DR 1002 VN', cap: 14, rate: 1300000, odo: 48000 },
        { type: 'VAN', brand: 'Mercedes', model: 'Sprinter', plate: 'DR 1003 VN', cap: 16, rate: 2000000, odo: 28000 },
    ];

    const vehicles: Vehicle[] = [];
    for (let i = 0; i < vehicleData.length; i++) {
        const v = vehicleData[i];
        const gps = gpsDevices[i];
        const vehicle = await prisma.vehicle.create({
            data: {
                type: v.type as VehicleType,
                brand: v.brand,
                model: v.model,
                plateNumber: v.plate,
                capacity: v.cap,
                dailyRate: v.rate,
                odometer: v.odo,
                oilChangeKm: 5000,
                coolantChangeKm: 40000,
                lastOilChangeKm: v.odo - Math.floor(Math.random() * 3000),
                lastCoolantKm: v.odo - Math.floor(Math.random() * 10000),
                status: 'AVAILABLE',
                gpsDeviceId: gps.id,
            },
        });
        vehicles.push(vehicle);
    }
    console.log(`   ✓ ${vehicles.length} vehicles created with GPS`);

    // ========================================================================
    // 5. VEHICLE MAINTENANCE RECORDS
    // ========================================================================
    console.log('\n🔧 Creating maintenance records...');
    let maintenanceCount = 0;
    for (const v of vehicles) {
        // Future oil change
        await prisma.vehicleMaintenance.create({
            data: {
                vehicleId: v.id,
                type: 'OIL_CHANGE',
                description: 'Scheduled oil change',
                dueAtKm: v.odometer + 2000 + Math.floor(Math.random() * 1000),
            },
        });
        maintenanceCount++;

        // Past completed service
        if (Math.random() > 0.5) {
            await prisma.vehicleMaintenance.create({
                data: {
                    vehicleId: v.id,
                    type: 'INSPECTION',
                    description: 'Regular inspection',
                    completedAt: getDateDaysFromNow(-Math.floor(Math.random() * 30)),
                    cost: 150000 + Math.floor(Math.random() * 100000),
                },
            });
            maintenanceCount++;
        }
    }
    console.log(`   ✓ ${maintenanceCount} maintenance records created`);

    // ========================================================================
    // 6. GPS LOCATION HISTORY
    // ========================================================================
    console.log('\n📍 Creating GPS location history...');
    let gpsLocationCount = 0;
    for (const device of gpsDevices) {
        // Create 10-20 location points per device over last 7 days
        const pointCount = 10 + Math.floor(Math.random() * 10);
        for (let i = 0; i < pointCount; i++) {
            const gps = randomLombokGPS();
            await prisma.gpsLocation.create({
                data: {
                    deviceId: device.id,
                    latitude: gps.lat,
                    longitude: gps.lng,
                    speed: Math.random() * 60,
                    timestamp: getDateDaysFromNow(-Math.floor(Math.random() * 7)),
                },
            });
            gpsLocationCount++;
        }
    }
    console.log(`   ✓ ${gpsLocationCount} GPS locations created`);

    // ========================================================================
    // 7. BOOKINGS (55 bookings with realistic distribution)
    // ========================================================================
    console.log('\n📋 Creating bookings...');

    // Generate 25 unique customer names/profiles
    const customerProfiles: { name: string; phone: string; email: string }[] = [];
    for (let i = 0; i < 25; i++) {
        const name = randomIndonesianName();
        customerProfiles.push({
            name,
            phone: randomIndonesianPhone(),
            email: randomEmail(name),
        });
    }

    // Track vehicle bookings by date to prevent double-booking
    type VehicleBooking = { vehicleId: string; startDate: Date; endDate: Date };
    const vehicleSchedule: VehicleBooking[] = [];

    function isVehicleAvailable(vehicleId: string, startDate: Date, duration: number): boolean {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration);

        return !vehicleSchedule.some(booking => {
            if (booking.vehicleId !== vehicleId) return false;
            // Check for date overlap
            return startDate < booking.endDate && endDate > booking.startDate;
        });
    }

    function bookVehicle(vehicleId: string, startDate: Date, duration: number) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration);
        vehicleSchedule.push({ vehicleId, startDate, endDate });
    }

    // Status distribution:
    // - 8 PENDING (upcoming)
    // - 12 CONFIRMED (upcoming)
    // - 6 ON_TRIP (current)
    // - 25 COMPLETED (past)
    // - 4 CANCELLED
    const bookingConfigs = [
        // PENDING - future dates
        ...Array(8).fill({ status: 'PENDING', dayOffset: () => 5 + Math.floor(Math.random() * 20) }),
        // CONFIRMED - upcoming
        ...Array(12).fill({ status: 'CONFIRMED', dayOffset: () => 1 + Math.floor(Math.random() * 10) }),
        // ON_TRIP - current
        ...Array(6).fill({ status: 'ON_TRIP', dayOffset: () => -Math.floor(Math.random() * 2) }),
        // COMPLETED - past
        ...Array(25).fill({ status: 'COMPLETED', dayOffset: () => -3 - Math.floor(Math.random() * 60) }),
        // CANCELLED
        ...Array(4).fill({ status: 'CANCELLED', dayOffset: () => -5 - Math.floor(Math.random() * 30) }),
    ];

    const bookings: Booking[] = [];
    const sources: BookingSource[] = ['WEB', 'GFORM', 'MANUAL'];

    for (const config of bookingConfigs) {
        const customer = randomElement(customerProfiles);
        const pickupDate = getDateDaysFromNow(config.dayOffset());

        // Pick a random route
        const route = randomElement(LOMBOK_ROUTES);
        const duration = route.duration + (Math.random() > 0.7 ? 1 : 0); // Sometimes extend

        // Get matching vehicle type from route
        const vehicleType = randomElement(route.vehicleTypes);

        // Find an available vehicle of that type
        let assignedVehicle: Vehicle | null = null;
        let assignedDriver: Driver | null = null;

        const matchingVehicles = vehicles.filter(v => v.type === vehicleType);

        // Try to find a vehicle that's not booked for these dates
        for (const v of matchingVehicles) {
            if (isVehicleAvailable(v.id, pickupDate, duration)) {
                assignedVehicle = v;
                bookVehicle(v.id, pickupDate, duration);
                break;
            }
        }

        // Fallback: just use any matching vehicle (allows some overlap for completed bookings)
        if (!assignedVehicle && matchingVehicles.length > 0) {
            assignedVehicle = randomElement(matchingVehicles);
        }

        let totalPrice = 0;
        if (assignedVehicle) {
            totalPrice = assignedVehicle.dailyRate * duration;

            // Assign driver for CAR/VAN (with driver) - 80% chance
            if ((vehicleType === 'CAR' || vehicleType === 'VAN') && Math.random() > 0.2) {
                const activeDrivers = drivers.filter(d => d.status === 'ACTIVE');
                if (activeDrivers.length > 0) {
                    assignedDriver = randomElement(activeDrivers);
                    // Add driver fee (approximately 150k-200k/day)
                    totalPrice += (150000 + Math.floor(Math.random() * 50000)) * duration;
                }
            }
        } else {
            // Fallback price based on route category
            const basePrices = {
                'AIRPORT_TRANSFER': 250000,
                'GILI_TRIP': 300000,
                'SOUTH_BEACHES': 350000,
                'RINJANI': 500000,
                'ISLAND_TOUR': 450000,
                'CITY_TOUR': 300000
            };
            totalPrice = (basePrices[route.category] || 300000) * duration;
        }

        // Generate contextual notes based on route
        let notes: string | null = null;
        if (Math.random() > 0.6) {
            const noteOptions: Record<string, string[]> = {
                'AIRPORT_TRANSFER': ['Flight arrives at 14:30', 'Need baby seat', 'Will have 3 large suitcases'],
                'GILI_TRIP': ['Please arrive early for 9am boat', 'Will return on evening boat'],
                'SOUTH_BEACHES': ['Want to visit Pink Beach too', 'Sunrise at Tanjung Aan'],
                'RINJANI': ['Trekking with local guide', 'Need 4WD for Sembalun road'],
                'ISLAND_TOUR': ['Include traditional village visit', 'Flexible itinerary'],
                'CITY_TOUR': ['Interest in pottery workshops', 'Include Sasak culture tour'],
            };
            notes = randomElement(noteOptions[route.category] || ['Customer requests early pickup']);
        }

        const booking = await prisma.booking.create({
            data: {
                customerName: customer.name,
                phone: customer.phone,
                source: randomElement(sources),
                vehicleType: vehicleType,
                pickupDate,
                duration,
                pickupLocation: route.pickup,
                dropoffLocation: route.dropoff,
                notes,
                status: config.status as BookingStatus,
                totalPrice,
                assignedVehicleId: assignedVehicle?.id,
                assignedDriverId: assignedDriver?.id,
            },
        });

        // Create booking history
        await prisma.bookingHistory.create({
            data: {
                bookingId: booking.id,
                toStatus: 'PENDING',
                changedBy: 'system',
            },
        });

        if (config.status !== 'PENDING') {
            await prisma.bookingHistory.create({
                data: {
                    bookingId: booking.id,
                    fromStatus: 'PENDING',
                    toStatus: config.status,
                    changedBy: 'admin@pingintrip.com',
                },
            });
        }

        bookings.push(booking);
    }

    // Update vehicle statuses based on bookings
    for (const v of vehicles) {
        const hasOnTrip = bookings.some(b =>
            b.assignedVehicleId === v.id && b.status === 'ON_TRIP'
        );
        const hasConfirmed = bookings.some(b =>
            b.assignedVehicleId === v.id && b.status === 'CONFIRMED'
        );

        let status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' = 'AVAILABLE';
        if (hasOnTrip) status = 'BOOKED';
        else if (hasConfirmed && Math.random() > 0.5) status = 'BOOKED';
        else if (Math.random() > 0.9) status = 'MAINTENANCE';

        await prisma.vehicle.update({
            where: { id: v.id },
            data: { status },
        });
    }

    console.log(`   ✓ ${bookings.length} bookings created`);

    // ========================================================================
    // 8. NOTIFICATIONS
    // ========================================================================
    console.log('\n🔔 Creating notifications...');
    const notifications = [
        { title: 'New Booking', message: 'Wayan Suryawan booked Toyota Avanza for 3 days', type: 'SUCCESS' },
        { title: 'Booking Confirmed', message: 'Booking #7890 has been confirmed', type: 'SUCCESS' },
        { title: 'Payment Received', message: 'Payment of Rp 1.050.000 received via BCA Transfer', type: 'SUCCESS' },
        { title: 'Vehicle Maintenance Due', message: 'HiAce DR 7890 KL needs oil change at 67,000 km', type: 'WARNING' },
        { title: 'Driver Assignment', message: 'Made Wirawan assigned to booking #1234', type: 'INFO' },
        { title: 'Cancellation', message: 'Booking #5678 was cancelled by customer', type: 'WARNING' },
        { title: 'Trip Completed', message: 'Trip for Dewi Kusuma completed successfully', type: 'SUCCESS' },
        { title: 'Low Inventory', message: 'Only 2 motorcycles available for this weekend', type: 'WARNING' },
    ];

    for (let i = 0; i < notifications.length; i++) {
        await prisma.notification.create({
            data: {
                title: notifications[i].title,
                message: notifications[i].message,
                type: notifications[i].type as NotificationType,
                isRead: i < 3, // First 3 are read
                createdAt: getDateDaysFromNow(-Math.floor(Math.random() * 7)),
            },
        });
    }
    console.log(`   ✓ ${notifications.length} notifications created`);

    // ========================================================================
    // 9. SYSTEM SETTINGS
    // ========================================================================
    console.log('\n⚙️  Creating system settings...');

    const systemSettings = [
        { key: 'business_name', value: JSON.stringify('Pingintrip Lombok'), category: 'BUSINESS' },
        { key: 'business_phone', value: JSON.stringify('+62 370 123 4567'), category: 'BUSINESS' },
        { key: 'business_email', value: JSON.stringify('info@pingintrip.com'), category: 'BUSINESS' },
        { key: 'business_address', value: JSON.stringify('Jl. Raya Senggigi No. 123, Lombok Barat, NTB'), category: 'BUSINESS' },
        { key: 'currency', value: JSON.stringify('IDR'), category: 'GENERAL' },
        { key: 'timezone', value: JSON.stringify('Asia/Makassar'), category: 'GENERAL' },
        { key: 'default_rental_start_time', value: JSON.stringify('08:00'), category: 'BOOKING' },
        { key: 'min_booking_duration', value: JSON.stringify(1), category: 'BOOKING' },
        { key: 'max_booking_duration', value: JSON.stringify(30), category: 'BOOKING' },
        { key: 'oil_change_reminder_km', value: JSON.stringify(5000), category: 'MAINTENANCE' },
        { key: 'coolant_change_reminder_km', value: JSON.stringify(40000), category: 'MAINTENANCE' },
    ];

    for (const setting of systemSettings) {
        await prisma.systemSetting.create({ data: setting });
    }
    console.log(`   ✓ ${systemSettings.length} system settings created`);

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n================================================');
    console.log('🎉 SEED COMPLETE!');
    console.log('================================================');
    console.log(`   📊 Summary:`);
    console.log(`      - Users: 2`);
    console.log(`      - Drivers: ${drivers.length}`);
    console.log(`      - Vehicles: ${vehicles.length}`);
    console.log(`      - GPS Devices: ${gpsDevices.length}`);
    console.log(`      - Bookings: ${bookings.length}`);
    console.log(`      - Maintenance: ${maintenanceCount}`);
    console.log(`      - GPS Locations: ${gpsLocationCount}`);
    console.log(`      - Notifications: ${notifications.length}`);
    console.log(`      - System Settings: ${systemSettings.length}`);
    console.log('');
    console.log('   🔑 Login Credentials:');
    console.log('      Admin: admin@pingintrip.com / admin123');
    console.log('      Staff: operator@pingintrip.com / staff123');
    console.log('================================================');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
