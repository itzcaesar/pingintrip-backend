"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

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
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

// Define Booking Type based on API response
type Booking = {
    id: string;
    customerName: string;
    phone: string;
    vehicleType: string;
    pickupDate: string;
    status: "PENDING" | "CONFIRMED" | "ON_TRIP" | "COMPLETED" | "CANCELLED";
    totalPrice: number;
    assignedVehicle?: {
        model: string;
        plateNumber: string;
    };
};

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const columns: ColumnDef<Booking>[] = [
    {
        accessorKey: "customerName",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Customer
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
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
                    <span className="font-medium">{vehicle.model}</span>
                    <span className="text-xs text-muted-foreground">{vehicle.plateNumber}</span>
                </div>
            ) : (
                <span className="text-muted-foreground italic">Unassigned</span>
            );
        }
    },
    {
        accessorKey: "pickupDate",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Pickup Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => format(new Date(row.getValue("pickupDate")), "PPP"),
    },
    {
        accessorKey: "totalPrice",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalPrice")) || 0;
            return <div className="text-right font-medium">{formatIDR(amount)}</div>
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const getVariant = (s: string) => {
                switch (s) {
                    case 'CONFIRMED': return 'secondary'; // using secondary which is usually blue/gray
                    case 'ON_TRIP': return 'default'; // dark/black
                    case 'COMPLETED': return 'default'; // emerald handled via class? No, shadcn badge variants are limited.
                    // I'll stick to basic variants and maybe add className
                    case 'PENDING': return 'outline';
                    case 'CANCELLED': return 'destructive';
                    default: return 'outline';
                }
            };

            // Custom colors matching Dashboard cards with dark mode
            let className = "";
            if (status === 'CONFIRMED') className = "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60 border-none";
            if (status === 'ON_TRIP') className = "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 border-none";
            if (status === 'PENDING') className = "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 border-none";
            if (status === 'COMPLETED') className = "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60 border-none";

            return (
                <Badge variant={status === 'CANCELLED' ? 'destructive' : 'outline'} className={className}>
                    {status}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const booking = row.original

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
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(booking.id)}
                        >
                            Copy booking ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Update status</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export default function BookingsPage() {
    // Fetch bookings
    const { data: bookings, isLoading } = useQuery<Booking[]>({
        queryKey: ["bookings-list"],
        queryFn: async () => {
            const res = await api.get("/bookings?limit=100");
            return res.data.data;
        },
    });

    if (isLoading) {
        return (
            <div className="p-8 space-y-4">
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
        </div>
    );
}
