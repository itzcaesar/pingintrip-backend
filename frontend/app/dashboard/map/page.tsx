"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Navigation, Radio } from "lucide-react";

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

// Simulation Data Generators
const generateRandomPoint = (center: [number, number], radius: number): [number, number] => {
    const y0 = center[0];
    const x0 = center[1];
    const rd = radius / 111300; // about 111300 meters in one degree

    const u = Math.random();
    const v = Math.random();

    const w = rd * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);

    return [y + y0, x + x0];
};

export default function MapPage() {
    const [vehicles, setVehicles] = useState<VehicleData[]>([]);

    // Initialize Simulation
    useEffect(() => {
        const initialVehicles: VehicleData[] = [
            { id: "v1", lat: -8.583, lng: 116.116, type: "CAR", name: "Toyota Avanza", plate: "DR 1234 AB", rotation: 0, status: "MOVING", speed: 0.0005, destination: generateRandomPoint([-8.583, 116.116], 5000), driverName: "Budi Santoso", customerName: "John Doe" }, // Mataram
            { id: "v2", lat: -8.500, lng: 116.050, type: "CAR", name: "Innova Zenix", plate: "DR 8888 XY", rotation: 45, status: "MOVING", speed: 0.0007, destination: generateRandomPoint([-8.500, 116.050], 5000), driverName: "Ahmad Dani", customerName: "Sarah Smith" }, // Senggigi
            { id: "v3", lat: -8.890, lng: 116.280, type: "MOTOR", name: "Honda PCX", plate: "DR 4545 ZZ", rotation: 90, status: "MOVING", speed: 0.0008, destination: generateRandomPoint([-8.890, 116.280], 3000), driverName: "Self-Drive", customerName: "Mike Johnson" }, // Mandalika
            { id: "v4", lat: -8.700, lng: 116.250, type: "MOTOR", name: "NMAX Turbo", plate: "DR 9900 ST", rotation: 180, status: "IDLE", speed: 0, destination: [-8.700, 116.250], driverName: "Self-Drive", customerName: "Available" }, // Praya
            { id: "v5", lat: -8.350, lng: 116.150, type: "CAR", name: "Suzuki Jimny", plate: "DR 7777 AA", rotation: 270, status: "MOVING", speed: 0.0004, destination: generateRandomPoint([-8.350, 116.150], 4000), driverName: "Wayan Gede", customerName: "Family Trip" }, // North Lombok
        ];
        setVehicles(initialVehicles);
    }, []);

    // Simulation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setVehicles(prev => prev.map(v => {
                if (v.status === "IDLE") return v;

                const dx = v.destination[1] - v.lng;
                const dy = v.destination[0] - v.lat;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 0.001) {
                    // Reached destination, pick new one
                    const newDest = generateRandomPoint([-8.583, 116.116], 20000); // Correct Lombok Center
                    return { ...v, destination: newDest };
                }

                const angle = Math.atan2(dy, dx);
                const moveDist = v.speed;

                const newLat = v.lat + Math.sin(angle) * moveDist;
                const newLng = v.lng + Math.cos(angle) * moveDist;
                const rotation = (angle * 180 / Math.PI) + 90; // Leaflet rotation fix

                return {
                    ...v,
                    lat: newLat,
                    lng: newLng,
                    rotation: rotation
                };
            }));
        }, 100); // 20 FPS roughly

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-[calc(100vh-6rem)] w-full p-6 relative">
            <div className="absolute top-10 left-10 z-10 space-y-4 max-w-sm pointer-events-none">
                <Card className="bg-white/80 backdrop-blur-md border-white/40 shadow-xl pointer-events-auto p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Navigation className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">Fleet Monitor</h2>
                            <p className="text-xs text-slate-500">Live Simulation • Lombok, ID</p>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            <Radio className="h-3 w-3 mr-1 animate-pulse" /> {vehicles.filter(v => v.status === "MOVING").length} Active
                        </Badge>
                        <Badge variant="outline" className="bg-slate-50 text-slate-600">
                            {vehicles.filter(v => v.status === "IDLE").length} Idle
                        </Badge>
                    </div>
                </Card>
            </div>

            <Card className="h-full w-full overflow-hidden border-white/20 shadow-2xl bg-white/30 backdrop-blur-sm rounded-2xl relative z-0">
                <DashboardMap vehicles={vehicles} />
            </Card>
        </div>
    );
}
