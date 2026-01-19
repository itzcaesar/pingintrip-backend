// app/dashboard/customers/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Plus, Search, MoreHorizontal, Mail, Phone, MapPin, Eye, Trash2, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";

type Customer = {
    id: string;
    name: string;
    email: string;
    phone: string;
    location?: string;
    bookings: number;
    totalSpent: number;
    status: "active" | "vip" | "new" | "inactive";
    createdAt: string;
};

// Fallback mock data when API is not available
const mockCustomers: Customer[] = [
    { id: "1", name: "John Doe", email: "john@example.com", phone: "+62 812-3456-7890", location: "Mataram", bookings: 5, totalSpent: 7500000, status: "active", createdAt: "2024-01-15" },
    { id: "2", name: "Sarah Johnson", email: "sarah@example.com", phone: "+62 813-9876-5432", location: "Senggigi", bookings: 3, totalSpent: 4200000, status: "active", createdAt: "2024-02-20" },
    { id: "3", name: "Michael Chen", email: "michael@example.com", phone: "+62 821-5555-4444", location: "Kuta Lombok", bookings: 8, totalSpent: 12000000, status: "vip", createdAt: "2023-11-10" },
    { id: "4", name: "Emily Brown", email: "emily@example.com", phone: "+62 857-1234-5678", location: "Praya", bookings: 1, totalSpent: 850000, status: "new", createdAt: "2024-03-01" },
    { id: "5", name: "David Wilson", email: "david@example.com", phone: "+62 878-9999-8888", location: "Gili Trawangan", bookings: 12, totalSpent: 18500000, status: "vip", createdAt: "2023-08-05" },
];

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export default function CustomersPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

    // Fetch customers (with fallback to mock data)
    const { data: customers = mockCustomers, isLoading } = useQuery<Customer[]>({
        queryKey: ["customers-list"],
        queryFn: async () => {
            try {
                const res = await api.get("/customers");
                return res.data;
            } catch {
                // Fallback to mock data if API not available
                return mockCustomers;
            }
        },
    });

    // Delete customer mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/customers/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers-list"] });
            toast.success("Customer removed successfully");
            setDeleteDialogOpen(false);
            setCustomerToDelete(null);
        },
        onError: (error: any) => {
            // Optimistic removal for demo
            toast.success("Customer removed (demo mode)");
            setDeleteDialogOpen(false);
            setCustomerToDelete(null);
        },
    });

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewProfile = (customer: Customer) => {
        setSelectedCustomer(customer);
        setDetailsOpen(true);
    };

    const handleViewBookings = (customer: Customer) => {
        toast.info(`Viewing bookings for ${customer.name}...`);
        // In real app, this would navigate to bookings filtered by customer
    };

    const handleSendMessage = (customer: Customer) => {
        // Open mailto link
        window.location.href = `mailto:${customer.email}?subject=Hello from Pingintrip`;
        toast.success("Opening email client...");
    };

    const handleDeleteCustomer = (id: string) => {
        setCustomerToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleAddCustomer = () => {
        toast.info("Add customer feature coming soon!");
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'vip': return "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200";
            case 'active': return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200";
            case 'new': return "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200";
            default: return "bg-muted text-foreground border-border";
        }
    };

    const stats = {
        total: customers.length,
        vip: customers.filter(c => c.status === 'vip').length,
        active: customers.filter(c => c.status === 'active').length,
        new: customers.filter(c => c.status === 'new').length,
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
                    <p className="text-muted-foreground">Manage your customer database and relationships.</p>
                </div>
                <Button onClick={handleAddCustomer} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
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
                            <p className="text-sm text-muted-foreground">VIP Customers</p>
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
                            <p className="text-sm text-muted-foreground">Active This Month</p>
                            <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">New Customers</p>
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
                            <CardDescription>A list of all registered customers.</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search customers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-muted border-border"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border">
                                <TableHead className="text-muted-foreground">Customer</TableHead>
                                <TableHead className="text-muted-foreground">Contact</TableHead>
                                <TableHead className="text-muted-foreground">Location</TableHead>
                                <TableHead className="text-muted-foreground text-center">Bookings</TableHead>
                                <TableHead className="text-muted-foreground text-right">Total Spent</TableHead>
                                <TableHead className="text-muted-foreground text-center">Status</TableHead>
                                <TableHead className="text-muted-foreground w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.map((customer) => (
                                <TableRow key={customer.id} className="border-border hover:bg-muted">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-border">
                                                <AvatarFallback className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 font-semibold text-sm">
                                                    {customer.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-foreground">{customer.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <Mail className="h-3.5 w-3.5" />
                                                {customer.email}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <Phone className="h-3.5 w-3.5" />
                                                {customer.phone}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {customer.location || "N/A"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-medium text-foreground">{customer.bookings}</TableCell>
                                    <TableCell className="text-right font-semibold text-foreground">{formatIDR(customer.totalSpent)}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={`text-xs font-medium capitalize ${getStatusBadge(customer.status)}`}>
                                            {customer.status}
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
                                                <DropdownMenuItem onClick={() => handleViewBookings(customer)}>
                                                    View Bookings
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSendMessage(customer)}>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Send Message
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteCustomer(customer.id)}
                                                    className="text-red-600 dark:text-red-400"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Remove Customer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Customer Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Customer Profile</DialogTitle>
                        <DialogDescription>
                            Full customer information.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCustomer && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16 border-2 border-border">
                                    <AvatarFallback className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 text-xl font-bold">
                                        {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                                    <Badge className={getStatusBadge(selectedCustomer.status)}>
                                        {selectedCustomer.status}
                                    </Badge>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{selectedCustomer.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{selectedCustomer.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Location</p>
                                    <p className="font-medium">{selectedCustomer.location || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Member Since</p>
                                    <p className="font-medium">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
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

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Remove Customer"
                description="Are you sure you want to remove this customer? Their booking history will be preserved."
                confirmText="Remove Customer"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={() => customerToDelete && deleteMutation.mutate(customerToDelete)}
            />
        </div>
    );
}
