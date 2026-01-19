// app/dashboard/vehicles/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { CarFront, MoreVertical, Users, Gauge, Plus, MapPin, Wifi, WifiOff } from "lucide-react";

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
    DropdownMenuSeparator,
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
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[280px] rounded-xl" />)}
                </div>
            </div>
        );
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
            case 'BOOKED': return "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
            case 'MAINTENANCE': return "bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800";
            default: return "bg-muted text-muted-foreground border-border";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'CAR': return 'text-blue-600 dark:text-blue-400';
            case 'MOTOR': return 'text-emerald-600 dark:text-emerald-400';
            case 'VAN': return 'text-purple-600 dark:text-purple-400';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Vehicle Fleet</h2>
                    <p className="text-muted-foreground">Manage your vehicles, availability, and pricing.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vehicle
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                            <CarFront className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Available</p>
                            <p className="text-2xl font-bold text-foreground">{vehicles?.filter(v => v.status === 'AVAILABLE').length || 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <CarFront className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Currently Booked</p>
                            <p className="text-2xl font-bold text-foreground">{vehicles?.filter(v => v.status === 'BOOKED').length || 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                            <CarFront className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">In Maintenance</p>
                            <p className="text-2xl font-bold text-foreground">{vehicles?.filter(v => v.status === 'MAINTENANCE').length || 0}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Vehicle Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {vehicles?.map((vehicle) => (
                    <Card key={vehicle.id} className="hover:shadow-md transition-shadow overflow-hidden">
                        {/* Vehicle Image Area */}
                        <div className="h-36 bg-muted flex items-center justify-center relative border-b border-border">
                            <CarFront className={`h-16 w-16 ${getTypeIcon(vehicle.type)}`} />
                            <Badge className={`absolute top-3 right-3 text-xs font-medium ${getStatusStyles(vehicle.status)}`}>
                                {vehicle.status}
                            </Badge>
                            {/* GPS Indicator */}
                            <div className="absolute top-3 left-3 flex items-center gap-1 bg-card px-2 py-1 rounded-full shadow-sm border border-border">
                                <Wifi className="h-3 w-3 text-emerald-500" />
                                <span className="text-[10px] font-medium text-muted-foreground">GPS</span>
                            </div>
                        </div>

                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base font-semibold">{vehicle.brand} {vehicle.model}</CardTitle>
                                    <CardDescription className="font-mono text-sm">{vehicle.plateNumber}</CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                        <DropdownMenuItem>Edit Vehicle</DropdownMenuItem>
                                        <DropdownMenuItem>View Schedule</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600 dark:text-red-400">Remove Vehicle</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>

                        <CardContent className="pb-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1.5">
                                    <Users className="h-4 w-4" />
                                    <span>{vehicle.capacity} seats</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Gauge className="h-4 w-4" />
                                    <span className="capitalize">{vehicle.type.toLowerCase()}</span>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-foreground">{formatIDR(vehicle.dailyRate)}</span>
                                <span className="text-sm text-muted-foreground">/day</span>
                            </div>
                        </CardContent>

                        <CardFooter className="bg-muted/50 p-3 border-t border-border">
                            <Button variant="outline" size="sm" className="w-full">
                                View Schedule
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {vehicles?.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <CarFront className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-1">No vehicles yet</h3>
                        <p className="text-muted-foreground mb-4">Add your first vehicle to get started.</p>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Vehicle
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

