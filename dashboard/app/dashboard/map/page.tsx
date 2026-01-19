"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Navigation, Radio, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";

// Dynamically import Map to avoid SSR issues with Leaflet
const DashboardMap = dynamic(() => import("@/components/dashboard-map"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-slate-100/50 backdrop-blur-sm rounded-xl animate-pulse">
            <span className="text-slate-400 font-medium">Loading Map...</span>
        </div>
    ),
});

type VehicleType = "CAR" | "MOTOR";

interface GpsVehicle {
    id: string;
    vehicleId: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    vehicle?: {
        id: string;
        brand: string;
        model: string;
        plateNumber: string;
        type: string;
    };
}

interface VehicleData {
    id: string;
    lat: number;
    lng: number;
    type: VehicleType;
    name: string;
    plate: string;
    rotation: number;
    status: "MOVING" | "IDLE";
    speed: number;
    destination: [number, number];
    driverName: string;
    customerName: string;
}

// Lombok road waypoints for realistic movement
const LOMBOK_WAYPOINTS = [
    { lat: -8.5833, lng: 116.1167 }, // Mataram City
    { lat: -8.5200, lng: 116.0750 }, // Batulayar
    { lat: -8.4927, lng: 116.0480 }, // Senggigi
    { lat: -8.4650, lng: 116.0350 }, // Mangsit
    { lat: -8.7573, lng: 116.2765 }, // Airport
    { lat: -8.7100, lng: 116.2650 }, // Praya Bypass
    { lat: -8.8950, lng: 116.2920 }, // Kuta Lombok
    { lat: -8.6500, lng: 116.2100 }, // Praya Town
    { lat: -8.4100, lng: 116.4200 }, // Sembalun
    { lat: -8.4050, lng: 116.1200 }, // Bangsal
];

export default function MapPage() {
    const [vehicles, setVehicles] = useState<VehicleData[]>([]);
    const animationRef = useRef<NodeJS.Timeout | null>(null);
    const destinationsRef = useRef<Map<string, { lat: number; lng: number }>>(new Map());

    // Fetch GPS vehicle data from API
    const { data: gpsVehicles = [], isLoading } = useQuery<GpsVehicle[]>({
        queryKey: ["gps-vehicles"],
        queryFn: async () => {
            const res = await api.get("/gps/vehicles");
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        },
        refetchInterval: 30000, // Refresh from server every 30 seconds
    });

    // Get a random waypoint different from current position
    const getRandomDestination = useCallback((currentLat: number, currentLng: number) => {
        const filtered = LOMBOK_WAYPOINTS.filter(
            wp => Math.abs(wp.lat - currentLat) > 0.01 || Math.abs(wp.lng - currentLng) > 0.01
        );
        return filtered[Math.floor(Math.random() * filtered.length)] || LOMBOK_WAYPOINTS[0];
    }, []);

    // Calculate heading between two points
    const calculateHeading = (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
        const dLng = toLng - fromLng;
        const dLat = toLat - fromLat;
        const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
        return (angle + 360) % 360;
    };

    // Transform GPS data to map format (initial load)
    useEffect(() => {
        if (gpsVehicles.length > 0 && vehicles.length === 0) {
            const transformed: VehicleData[] = gpsVehicles
                .filter((gps) =>
                    gps.latitude != null &&
                    gps.longitude != null &&
                    !isNaN(gps.latitude) &&
                    !isNaN(gps.longitude)
                )
                .map((gps) => {
                    const vType = gps.vehicle?.type;
                    const displayType: VehicleType = vType === "MOTOR" ? "MOTOR" : "CAR";
                    const dest = getRandomDestination(gps.latitude, gps.longitude);
                    destinationsRef.current.set(gps.id, dest);

                    return {
                        id: gps.id,
                        lat: gps.latitude,
                        lng: gps.longitude,
                        type: displayType,
                        name: gps.vehicle ? `${gps.vehicle.brand} ${gps.vehicle.model}` : "Unknown Vehicle",
                        plate: gps.vehicle?.plateNumber || "N/A",
                        rotation: calculateHeading(gps.latitude, gps.longitude, dest.lat, dest.lng),
                        status: "MOVING",
                        speed: 20 + Math.random() * 40, // 20-60 km/h
                        destination: [dest.lat, dest.lng] as [number, number],
                        driverName: "On Duty",
                        customerName: "Active Trip",
                    };
                });
            setVehicles(transformed);
        }
    }, [gpsVehicles, vehicles.length, getRandomDestination]);

    // Animate vehicle movement
    useEffect(() => {
        if (vehicles.length === 0) return;

        const moveVehicles = () => {
            setVehicles(prevVehicles =>
                prevVehicles.map(vehicle => {
                    // Get or set destination
                    let dest = destinationsRef.current.get(vehicle.id);
                    if (!dest) {
                        dest = getRandomDestination(vehicle.lat, vehicle.lng);
                        destinationsRef.current.set(vehicle.id, dest);
                    }

                    // Calculate distance to destination
                    const distLat = dest.lat - vehicle.lat;
                    const distLng = dest.lng - vehicle.lng;
                    const distance = Math.sqrt(distLat * distLat + distLng * distLng);

                    // If close to destination, pick a new one
                    if (distance < 0.005) {
                        dest = getRandomDestination(vehicle.lat, vehicle.lng);
                        destinationsRef.current.set(vehicle.id, dest);
                    }

                    // Move toward destination (smaller steps for smoother animation)
                    const baseSpeed = vehicle.type === "MOTOR" ? 0.00015 : 0.00025;
                    const speed = baseSpeed + Math.random() * 0.00005;

                    // Normalize direction
                    const newLat = vehicle.lat + (distLat / distance) * speed;
                    const newLng = vehicle.lng + (distLng / distance) * speed;

                    // Calculate new heading
                    const newRotation = calculateHeading(vehicle.lat, vehicle.lng, newLat, newLng);

                    // Random chance to go idle (1% per tick)
                    const isMoving = Math.random() > 0.01;

                    return {
                        ...vehicle,
                        lat: isMoving ? newLat : vehicle.lat,
                        lng: isMoving ? newLng : vehicle.lng,
                        rotation: newRotation,
                        status: isMoving ? "MOVING" : "IDLE",
                        speed: isMoving ? 20 + Math.random() * 40 : 0,
                    };
                })
            );
        };

        // Update positions every 300ms for smooth animation
        animationRef.current = setInterval(moveVehicles, 300);

        return () => {
            if (animationRef.current) {
                clearInterval(animationRef.current);
            }
        };
    }, [vehicles.length, getRandomDestination]);

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-6rem)] w-full p-6 relative">
                <Skeleton className="h-full w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-6rem)] w-full p-6 relative">
            <div className="absolute top-10 left-10 z-10 space-y-4 max-w-sm pointer-events-none">
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-white/40 dark:border-slate-700 shadow-xl pointer-events-auto p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <Navigation className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800 dark:text-foreground">Fleet Monitor</h2>
                            <p className="text-xs text-slate-500 dark:text-muted-foreground">Live GPS Tracking • Lombok, ID</p>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                            <Radio className="h-3 w-3 mr-1 animate-pulse" /> {vehicles.filter(v => v.status === "MOVING").length} Active
                        </Badge>
                        <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-muted-foreground">
                            {vehicles.filter(v => v.status === "IDLE").length} Idle
                        </Badge>
                    </div>
                </Card>
            </div>

            <Card className="h-full w-full overflow-hidden border-white/20 dark:border-slate-700 shadow-2xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm rounded-2xl relative z-0">
                {vehicles.length > 0 ? (
                    <DashboardMap vehicles={vehicles} />
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground">
                        <MapPin className="h-12 w-12 mb-4 opacity-50" />
                        <p className="font-medium">No GPS Data Available</p>
                        <p className="text-sm">Vehicles with GPS devices will appear here</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
