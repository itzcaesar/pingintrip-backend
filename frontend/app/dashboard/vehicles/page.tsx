"use client";

import { useQuery } from "@tanstack/react-query";
import { Car, MoreVertical, Fuel, Users, Settings } from "lucide-react";

import api from "@/lib/api";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Vehicle = {
    id: string;
    brand: string;
    model: string;
    plateNumber: string;
    status: "AVAILABLE" | "BOOKED" | "MAINTENANCE";
    type: "CAR" | "MOTOR" | "VAN";
    capacity: number;
    dailyRate: number;
    notes?: string;
};

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export default function VehiclesPage() {
    const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
        queryKey: ["vehicles-list"],
        queryFn: async () => {
            const res = await api.get("/vehicles?limit=100");
            return res.data.data;
        },
    });

    if (isLoading) {
        return (
            <div className="p-8 space-y-8">
                <Skeleton className="h-10 w-48" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[280px]" />)}
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none";
            case 'BOOKED': return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-none";
            case 'MAINTENANCE': return "bg-orange-100 text-orange-700 hover:bg-orange-200 border-none";
            default: return "bg-slate-100 text-slate-700";
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Vehicle Fleet</h2>
                    <p className="text-muted-foreground mt-2">Manage your fleet status and pricing.</p>
                </div>
                <Button>Add Vehicle</Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {vehicles?.map((vehicle) => (
                    <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-32 bg-slate-100 flex items-center justify-center relative">
                            <Car className={`h-16 w-16 ${vehicle.type === 'MOTOR' ? 'text-blue-400' : 'text-slate-400'}`} />
                            <Badge className={`absolute top-2 right-2 ${getStatusColor(vehicle.status)}`}>
                                {vehicle.status}
                            </Badge>
                        </div>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{vehicle.brand} {vehicle.model}</CardTitle>
                                    <CardDescription>{vehicle.plateNumber}</CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                        <DropdownMenuItem>View History</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>{vehicle.capacity} Seats</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Settings className="h-4 w-4" />
                                    <span>{vehicle.type}</span>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-slate-900">
                                {formatIDR(vehicle.dailyRate)} <span className="text-sm font-normal text-muted-foreground">/day</span>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 p-4">
                            <Button variant="outline" className="w-full">
                                View Schedule
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
