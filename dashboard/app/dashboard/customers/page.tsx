// app/dashboard/customers/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Search, MoreHorizontal, Mail, Phone, Eye, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingFormModal } from "@/components/booking-form-modal";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { format } from "date-fns";

type Booking = {
    id: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    pickupLocation?: string;
    totalAmount: number;
    status: string;
    pickupDate: string;
    createdAt: string;
};

type Customer = {
    name: string;
    phone: string;
    email: string;
    location: string;
    bookings: number;
    totalSpent: number;
    lastBooking: string;
};

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [addCustomerOpen, setAddCustomerOpen] = useState(false);

    // Fetch bookings and derive customer data from them
    const { data: bookings = [], isLoading } = useQuery<Booking[]>({
        queryKey: ["all-bookings-for-customers"],
        queryFn: async () => {
            const res = await api.get("/bookings?limit=100");
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        },
    });

    // Derive unique customers from bookings
    const customers = useMemo(() => {
        const customerMap = new Map<string, Customer>();

        bookings.forEach(booking => {
            const key = booking.customerPhone || booking.customerName;
            if (!key) return;

            const existing = customerMap.get(key);
            if (existing) {
                existing.bookings++;
                existing.totalSpent += booking.totalAmount || 0;
                if (new Date(booking.pickupDate) > new Date(existing.lastBooking)) {
                    existing.lastBooking = booking.pickupDate;
                }
            } else {
                customerMap.set(key, {
                    name: booking.customerName,
                    phone: booking.customerPhone || '',
                    email: booking.customerEmail || '',
                    location: booking.pickupLocation || '',
                    bookings: 1,
                    totalSpent: booking.totalAmount || 0,
                    lastBooking: booking.pickupDate,
                });
            }
        });

        return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
    }, [bookings]);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

    const handleViewProfile = (customer: Customer) => {
        setSelectedCustomer(customer);
        setDetailsOpen(true);
    };

    const handleSendMessage = (customer: Customer) => {
        if (customer.email) {
            window.location.href = `mailto:${customer.email}?subject=Hello from Pingintrip`;
            toast.success("Opening email client...");
        } else {
            toast.info("No email available for this customer");
        }
    };

    const getStatusBadge = (bookings: number) => {
        if (bookings >= 5) return { label: 'VIP', style: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200" };
        if (bookings >= 2) return { label: 'Regular', style: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200" };
        return { label: 'New', style: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200" };
    };

    const stats = {
        total: customers.length,
        vip: customers.filter(c => c.bookings >= 5).length,
        regular: customers.filter(c => c.bookings >= 2 && c.bookings < 5).length,
        new: customers.filter(c => c.bookings < 2).length,
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48" />
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Customers</h2>
                    <p className="text-muted-foreground">Customer insights derived from booking history.</p>
                </div>
                <Button onClick={() => setAddCustomerOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add Customer
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-border shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Customers</p>
                            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                            <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">VIP (5+ bookings)</p>
                            <p className="text-2xl font-bold text-foreground">{stats.vip}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Regular (2-4)</p>
                            <p className="text-2xl font-bold text-foreground">{stats.regular}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">New (1 booking)</p>
                            <p className="text-2xl font-bold text-foreground">{stats.new}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Customer Table */}
            <Card className="border-border shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-foreground">All Customers</CardTitle>
                            <CardDescription>Customers derived from booking data.</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-muted border-border"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredCustomers.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border">
                                    <TableHead className="text-muted-foreground">Customer</TableHead>
                                    <TableHead className="text-muted-foreground">Contact</TableHead>
                                    <TableHead className="text-muted-foreground text-center">Bookings</TableHead>
                                    <TableHead className="text-muted-foreground text-right">Total Spent</TableHead>
                                    <TableHead className="text-muted-foreground text-center">Status</TableHead>
                                    <TableHead className="text-muted-foreground w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.map((customer, index) => {
                                    const status = getStatusBadge(customer.bookings);
                                    return (
                                        <TableRow key={index} className="border-border hover:bg-muted">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-border">
                                                        <AvatarFallback className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 font-semibold text-sm">
                                                            {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-foreground">{customer.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {customer.phone && (
                                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                            <Phone className="h-3.5 w-3.5" />
                                                            {customer.phone}
                                                        </div>
                                                    )}
                                                    {customer.email && (
                                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                            <Mail className="h-3.5 w-3.5" />
                                                            {customer.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-medium text-foreground">{customer.bookings}</TableCell>
                                            <TableCell className="text-right font-semibold text-foreground">{formatIDR(customer.totalSpent)}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={`text-xs font-medium ${status.style}`}>
                                                    {status.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => handleViewProfile(customer)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleSendMessage(customer)}>
                                                            <Mail className="mr-2 h-4 w-4" />
                                                            Send Email
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            {searchQuery ? 'No customers match your search.' : 'No customer data available yet. Customers will appear here once bookings are made.'}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Customer Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Customer Profile</DialogTitle>
                        <DialogDescription>
                            Customer information from booking history.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCustomer && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-border">
                                    <AvatarFallback className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 text-xl font-bold">
                                        {selectedCustomer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                                    <Badge className={getStatusBadge(selectedCustomer.bookings).style}>
                                        {getStatusBadge(selectedCustomer.bookings).label}
                                    </Badge>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{selectedCustomer.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{selectedCustomer.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Location</p>
                                    <p className="font-medium">{selectedCustomer.location || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Last Booking</p>
                                    <p className="font-medium">{format(new Date(selectedCustomer.lastBooking), 'dd MMM yyyy')}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                                    <p className="text-2xl font-bold">{selectedCustomer.bookings}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Spent</p>
                                    <p className="text-2xl font-bold text-blue-600">{formatIDR(selectedCustomer.totalSpent)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <BookingFormModal
                open={addCustomerOpen}
                onOpenChange={setAddCustomerOpen}
            />
        </div>
    );
}
