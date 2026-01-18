-- AlterEnum
ALTER TYPE "VehicleType" ADD VALUE 'VAN';

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "dropoffLocation" DROP NOT NULL;
