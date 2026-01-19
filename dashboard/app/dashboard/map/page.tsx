"use client";

import { useEffect, useState } from "react";
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

export default function MapPage() {
    const [vehicles, setVehicles] = useState<VehicleData[]>([]);

    // Fetch GPS vehicle data from API
    const { data: gpsVehicles = [], isLoading } = useQuery<GpsVehicle[]>({
        queryKey: ["gps-vehicles"],
        queryFn: async () => {
            const res = await api.get("/gps/vehicles");
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        },
        refetchInterval: 5000, // Refresh every 5 seconds for live updates
    });

    // Transform GPS data to map format
    useEffect(() => {
        if (gpsVehicles.length > 0) {
            const transformed: VehicleData[] = gpsVehicles
                // Filter out any GPS data with invalid coordinates
                .filter((gps) =>
                    gps.latitude != null &&
                    gps.longitude != null &&
                    !isNaN(gps.latitude) &&
                    !isNaN(gps.longitude)
                )
                .map((gps) => {
                    // Properly detect vehicle type - MOTOR is for motorcycles, everything else is CAR
                    const vType = gps.vehicle?.type;
                    const displayType: VehicleType = vType === "MOTOR" ? "MOTOR" : "CAR";

                    return {
                        id: gps.id,
                        lat: gps.latitude,
                        lng: gps.longitude,
                        type: displayType,
                        name: gps.vehicle ? `${gps.vehicle.brand} ${gps.vehicle.model}` : "Unknown Vehicle",
                        plate: gps.vehicle?.plateNumber || "N/A",
                        rotation: gps.heading || 0,
                        status: (gps.speed && gps.speed > 0) ? "MOVING" : "IDLE",
                        speed: gps.speed || 0,
                        destination: [gps.latitude, gps.longitude] as [number, number],
                        driverName: "N/A",
                        customerName: "N/A",
                    };
                });
            setVehicles(transformed);
        }
    }, [gpsVehicles]);

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
