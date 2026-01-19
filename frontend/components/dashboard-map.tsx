"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icons in Next.js
const icon = L.icon({
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Custom DivIcon for Vehicles
const createVehicleIcon = (type: string, rotation: number) => {
    return L.divIcon({
        className: "bg-transparent",
        html: `
            <div style="transform: rotate(${rotation}deg); transition: transform 0.5s ease;">
                <div class="relative flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg border-2 border-white ring-2 ${type === 'CAR' ? 'ring-blue-400' : 'ring-emerald-400'}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${type === 'CAR' ? 'text-blue-600' : 'text-emerald-600'}">
                        ${type === 'CAR'
                ? '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>'
                : '<circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M15 6h5l-3 13"/><path d="M5 6h12"/><path d="M22 11.5c0 3.59-2.91 6.5-6.5 6.5H8.5C4.91 18 2 15.09 2 11.5S4.91 5 8.5 5h3.69a6.5 6.5 0 0 1 9.81 6.5z"/>'
            }
                    </svg>
                    <div class="absolute -bottom-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20], // Center
    });
};

interface VehiclePosition {
    id: string;
    lat: number;
    lng: number;
    type: "CAR" | "MOTOR";
    name: string;
    plate: string;
    rotation: number;
    status: string;
    driverName: string;
    customerName: string;
}

interface DashboardMapProps {
    vehicles: VehiclePosition[];
}

export default function DashboardMap({ vehicles }: DashboardMapProps) {
    // Default center (Lombok - Mataram area)
    const center: [number, number] = [-8.5833, 116.1167];

    return (
        <MapContainer
            center={center}
            zoom={11}
            scrollWheelZoom={true}
            className="h-full w-full rounded-xl z-0"
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {vehicles.map((v, index) => (
                <Marker
                    key={v.id || `vehicle-${index}`}
                    position={[v.lat, v.lng]}
                    icon={createVehicleIcon(v.type, v.rotation)}
                    eventHandlers={{
                        mouseover: (e) => e.target.openPopup(),
                        mouseout: (e) => e.target.closePopup(),
                        click: (e) => e.target.openPopup(),
                    }}
                >
                    <Popup className="glass-popup" closeButton={false}>
                        <div className="p-1 min-w-[200px]">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-slate-800 text-lg">{v.plate}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${v.status === 'MOVING' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {v.status}
                                </span>
                            </div>
                            <div className="space-y-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Driver</p>
                                        <p className="text-sm font-medium text-slate-700 leading-none">{v.driverName}</p>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Customer</p>
                                        <p className="text-sm font-medium text-slate-700 leading-none">{v.customerName}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 text-xs text-center text-slate-400 font-medium">
                                {v.type} • {v.name}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
