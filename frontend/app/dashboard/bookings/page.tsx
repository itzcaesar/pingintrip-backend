"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowUpDown, MoreHorizontal, Eye, RefreshCw, XCircle, Copy, Check } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import api from "@/lib/api";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Separator } from "@/components/ui/separator";

// Define Booking Type based on API response
type Booking = {
    id: string;
    customerName: string;
    phone: string;
    vehicleType: string;
    pickupDate: string;
    dropoffDate?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    status: "PENDING" | "CONFIRMED" | "ON_TRIP" | "COMPLETED" | "CANCELLED";
    totalPrice: number;
    notes?: string;
    assignedVehicle?: {
        id: string;
        brand: string;
        model: string;
        plateNumber: string;
    };
    assignedDriver?: {
        id: string;
        name: string;
        phone: string;
    };
    createdAt: string;
};

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "ON_TRIP", label: "On Trip" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
];

export default function BookingsPage() {
    const queryClient = useQueryClient();
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

    // Fetch bookings
    const { data: bookings, isLoading } = useQuery<Booking[]>({
        queryKey: ["bookings-list"],
        queryFn: async () => {
            const res = await api.get("/bookings?limit=100");
            return res.data.data;
        },
    });

    // Update status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            await api.patch(`/bookings/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings-list"] });
            toast.success("Booking status updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update status");
        },
    });

    // Cancel booking mutation
    const cancelBookingMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/bookings/${id}/status`, { status: "CANCELLED" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings-list"] });
            toast.success("Booking cancelled successfully");
            setCancelDialogOpen(false);
            setBookingToCancel(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to cancel booking");
        },
    });

    const handleViewDetails = (booking: Booking) => {
        setSelectedBooking(booking);
        setDetailsOpen(true);
    };

    const handleUpdateStatus = (id: string, status: string) => {
        updateStatusMutation.mutate({ id, status });
    };

    const handleCancelBooking = (id: string) => {
        setBookingToCancel(id);
        setCancelDialogOpen(true);
    };

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success("Booking ID copied to clipboard");
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60 border-none";
            case 'ON_TRIP': return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 border-none";
            case 'PENDING': return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 border-none";
            case 'COMPLETED': return "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60 border-none";
            case 'CANCELLED': return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-none";
            default: return "";
        }
    };

    const columns: ColumnDef<Booking>[] = [
        {
            accessorKey: "customerName",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Customer
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: "phone",
            header: "Phone",
        },
        {
            accessorKey: "vehicleType",
            header: "Type",
            cell: ({ row }) => <Badge variant="outline">{row.getValue("vehicleType")}</Badge>,
        },
        {
            header: "Vehicle Details",
            cell: ({ row }) => {
                const vehicle = row.original.assignedVehicle;
                return vehicle ? (
                    <div className="flex flex-col">
                        <span className="font-medium">{vehicle.brand} {vehicle.model}</span>
                        <span className="text-xs text-muted-foreground">{vehicle.plateNumber}</span>
                    </div>
                ) : (
                    <span className="text-muted-foreground italic">Unassigned</span>
                );
            }
        },
        {
            accessorKey: "pickupDate",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Pickup Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => format(new Date(row.getValue("pickupDate")), "PPP"),
        },
        {
            accessorKey: "totalPrice",
            header: () => <div className="text-right">Amount</div>,
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("totalPrice")) || 0;
                return <div className="text-right font-medium">{formatIDR(amount)}</div>;
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <Badge variant="outline" className={getStatusStyles(status)}>
                        {status}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const booking = row.original;
                const isUpdating = updateStatusMutation.isPending;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleCopyId(booking.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy booking ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger disabled={isUpdating}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Update status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {statusOptions.map((option) => (
                                        <DropdownMenuItem
                                            key={option.value}
                                            onClick={() => handleUpdateStatus(booking.id, option.value)}
                                            disabled={booking.status === option.value}
                                        >
                                            {booking.status === option.value && <Check className="mr-2 h-4 w-4" />}
                                            {option.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => handleCancelBooking(booking.id)}
                                        className="text-red-600 dark:text-red-400"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Cancel booking
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="border rounded-md p-4">
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Bookings</h2>
                    <p className="text-muted-foreground">Manage and track all customer bookings.</p>
                </div>
            </div>

            <DataTable columns={columns} data={bookings || []} />

            {/* Booking Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Booking Details</DialogTitle>
                        <DialogDescription>
                            Full information about this booking.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedBooking && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Customer</p>
                                    <p className="font-medium">{selectedBooking.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{selectedBooking.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant="outline" className={getStatusStyles(selectedBooking.status)}>
                                        {selectedBooking.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Price</p>
                                    <p className="font-bold text-lg">{formatIDR(selectedBooking.totalPrice)}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Pickup Date</p>
                                    <p className="font-medium">{format(new Date(selectedBooking.pickupDate), "PPP")}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Dropoff Date</p>
                                    <p className="font-medium">
                                        {selectedBooking.dropoffDate ? format(new Date(selectedBooking.dropoffDate), "PPP") : "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Pickup Location</p>
                                    <p className="font-medium">{selectedBooking.pickupLocation || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Dropoff Location</p>
                                    <p className="font-medium">{selectedBooking.dropoffLocation || "N/A"}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Assigned Vehicle</p>
                                    {selectedBooking.assignedVehicle ? (
                                        <p className="font-medium">
                                            {selectedBooking.assignedVehicle.brand} {selectedBooking.assignedVehicle.model}
                                            <span className="text-muted-foreground ml-2">({selectedBooking.assignedVehicle.plateNumber})</span>
                                        </p>
                                    ) : (
                                        <p className="text-muted-foreground italic">Unassigned</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Assigned Driver</p>
                                    {selectedBooking.assignedDriver ? (
                                        <p className="font-medium">{selectedBooking.assignedDriver.name}</p>
                                    ) : (
                                        <p className="text-muted-foreground italic">Unassigned</p>
                                    )}
                                </div>
                            </div>
                            {selectedBooking.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Notes</p>
                                        <p className="font-medium">{selectedBooking.notes}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <ConfirmDialog
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
                title="Cancel Booking"
                description="Are you sure you want to cancel this booking? This action cannot be undone."
                confirmText="Cancel Booking"
                variant="destructive"
                loading={cancelBookingMutation.isPending}
                onConfirm={() => bookingToCancel && cancelBookingMutation.mutate(bookingToCancel)}
            />
        </div>
    );
}
