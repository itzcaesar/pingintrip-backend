"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, CarFront, Bike, Truck, MoreVertical, Users, Gauge, MapPin, Eye, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { VehicleFormModal, VehicleFormValues } from "@/components/vehicle-form-modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Separator } from "@/components/ui/separator";

type Vehicle = {
    id: string;
    brand: string;
    model: string;
    plateNumber: string;
    type: "CAR" | "MOTOR" | "VAN";
    status: "AVAILABLE" | "RENTED" | "MAINTENANCE";
    capacity: number;
    dailyRate: number;
    imageUrl?: string;
    hasGps?: boolean;
    lastLocation?: {
        latitude: number;
        longitude: number;
    };
};

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const statusStyles: Record<string, string> = {
    AVAILABLE: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200",
    RENTED: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200",
    MAINTENANCE: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200",
};

const typeIcons: Record<string, React.ReactNode> = {
    CAR: <CarFront className="h-8 w-8 text-muted-foreground" />,
    MOTOR: <Bike className="h-8 w-8 text-muted-foreground" />,
    VAN: <Truck className="h-8 w-8 text-muted-foreground" />,
};

export default function VehiclesPage() {
    const queryClient = useQueryClient();
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

    // Fetch vehicles
    const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
        queryKey: ["vehicles-list"],
        queryFn: async () => {
            const res = await api.get("/vehicles");
            return res.data;
        },
    });

    // Create vehicle mutation
    const createMutation = useMutation({
        mutationFn: async (data: VehicleFormValues) => {
            await api.post("/vehicles", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicles-list"] });
            toast.success("Vehicle added successfully");
            setFormModalOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to add vehicle");
        },
    });

    // Update vehicle mutation
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: VehicleFormValues }) => {
            await api.patch(`/vehicles/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicles-list"] });
            toast.success("Vehicle updated successfully");
            setFormModalOpen(false);
            setSelectedVehicle(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update vehicle");
        },
    });

    // Delete vehicle mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/vehicles/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicles-list"] });
            toast.success("Vehicle removed successfully");
            setDeleteDialogOpen(false);
            setVehicleToDelete(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to remove vehicle");
        },
    });

    const handleAddVehicle = () => {
        setFormMode("create");
        setSelectedVehicle(null);
        setFormModalOpen(true);
    };

    const handleEditVehicle = (vehicle: Vehicle) => {
        setFormMode("edit");
        setSelectedVehicle(vehicle);
        setFormModalOpen(true);
    };

    const handleViewDetails = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setDetailsOpen(true);
    };

    const handleDeleteVehicle = (id: string) => {
        setVehicleToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleFormSubmit = (values: VehicleFormValues) => {
        if (formMode === "create") {
            createMutation.mutate(values);
        } else if (selectedVehicle) {
            updateMutation.mutate({ id: selectedVehicle.id, data: values });
        }
    };

    const stats = {
        total: vehicles?.length || 0,
        available: vehicles?.filter(v => v.status === "AVAILABLE").length || 0,
        rented: vehicles?.filter(v => v.status === "RENTED").length || 0,
        maintenance: vehicles?.filter(v => v.status === "MAINTENANCE").length || 0,
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Vehicles</h2>
                    <p className="text-muted-foreground">Manage your fleet of vehicles.</p>
                </div>
                <Button onClick={handleAddVehicle} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vehicle
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-border shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <CarFront className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Fleet</p>
                            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                            <CarFront className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Available</p>
                            <p className="text-2xl font-bold text-foreground">{stats.available}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <CarFront className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Rented</p>
                            <p className="text-2xl font-bold text-foreground">{stats.rented}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                            <CarFront className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Maintenance</p>
                            <p className="text-2xl font-bold text-foreground">{stats.maintenance}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Vehicle Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vehicles?.map((vehicle) => (
                    <Card key={vehicle.id} className="border-border shadow-sm overflow-hidden">
                        {/* Image/Icon Area */}
                        <div className="h-32 bg-muted flex items-center justify-center relative">
                            {vehicle.imageUrl ? (
                                <img src={vehicle.imageUrl} alt={vehicle.model} className="w-full h-full object-cover" />
                            ) : (
                                typeIcons[vehicle.type]
                            )}
                            <Badge className={`absolute top-2 right-2 text-xs ${statusStyles[vehicle.status]}`}>
                                {vehicle.status}
                            </Badge>
                            {vehicle.hasGps && (
                                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/90 text-foreground px-2 py-1 rounded text-xs">
                                    <MapPin className="h-3 w-3 text-emerald-500" />
                                    GPS Active
                                </div>
                            )}
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
                                        <DropdownMenuItem onClick={() => handleViewDetails(vehicle)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleEditVehicle(vehicle)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Vehicle
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/calendar">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                View Schedule
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => handleDeleteVehicle(vehicle.id)}
                                            className="text-red-600 dark:text-red-400"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Remove Vehicle
                                        </DropdownMenuItem>
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
                            <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link href="/dashboard/calendar">View Schedule</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {vehicles?.length === 0 && (
                <div className="text-center py-12 bg-muted rounded-lg">
                    <CarFront className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No vehicles yet</h3>
                    <p className="text-muted-foreground mb-4">Add your first vehicle to get started.</p>
                    <Button onClick={handleAddVehicle} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vehicle
                    </Button>
                </div>
            )}

            {/* Vehicle Form Modal */}
            <VehicleFormModal
                open={formModalOpen}
                onOpenChange={setFormModalOpen}
                mode={formMode}
                defaultValues={selectedVehicle ? {
                    brand: selectedVehicle.brand,
                    model: selectedVehicle.model,
                    plateNumber: selectedVehicle.plateNumber,
                    type: selectedVehicle.type,
                    capacity: selectedVehicle.capacity,
                    dailyRate: selectedVehicle.dailyRate,
                    status: selectedVehicle.status,
                    imageUrl: selectedVehicle.imageUrl,
                } : undefined}
                loading={createMutation.isPending || updateMutation.isPending}
                onSubmit={handleFormSubmit}
            />

            {/* Vehicle Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Vehicle Details</DialogTitle>
                        <DialogDescription>
                            Full information about this vehicle.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedVehicle && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Brand</p>
                                    <p className="font-medium">{selectedVehicle.brand}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Model</p>
                                    <p className="font-medium">{selectedVehicle.model}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Plate Number</p>
                                    <p className="font-medium font-mono">{selectedVehicle.plateNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Type</p>
                                    <p className="font-medium capitalize">{selectedVehicle.type.toLowerCase()}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Capacity</p>
                                    <p className="font-medium">{selectedVehicle.capacity} seats</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Daily Rate</p>
                                    <p className="font-bold text-lg">{formatIDR(selectedVehicle.dailyRate)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge className={statusStyles[selectedVehicle.status]}>
                                        {selectedVehicle.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">GPS</p>
                                    <p className="font-medium">{selectedVehicle.hasGps ? "Active" : "Not connected"}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Remove Vehicle"
                description="Are you sure you want to remove this vehicle from your fleet? This action cannot be undone."
                confirmText="Remove Vehicle"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={() => vehicleToDelete && deleteMutation.mutate(vehicleToDelete)}
            />
        </div>
    );
}
