// app/dashboard/customers/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Plus, Search, MoreHorizontal, Mail, Phone, MapPin } from "lucide-react";
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

// Mock customer data
const customers = [
    { id: "1", name: "John Doe", email: "john@example.com", phone: "+62 812-3456-7890", location: "Mataram", bookings: 5, totalSpent: 7500000, status: "active" },
    { id: "2", name: "Sarah Johnson", email: "sarah@example.com", phone: "+62 813-9876-5432", location: "Senggigi", bookings: 3, totalSpent: 4200000, status: "active" },
    { id: "3", name: "Michael Chen", email: "michael@example.com", phone: "+62 821-5555-4444", location: "Kuta Lombok", bookings: 8, totalSpent: 12000000, status: "vip" },
    { id: "4", name: "Emily Brown", email: "emily@example.com", phone: "+62 857-1234-5678", location: "Praya", bookings: 1, totalSpent: 850000, status: "new" },
    { id: "5", name: "David Wilson", email: "david@example.com", phone: "+62 878-9999-8888", location: "Gili Trawangan", bookings: 12, totalSpent: 18500000, status: "vip" },
];

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'vip': return "bg-amber-50 dark:bg-amber-900/30 text-amber-700 border-amber-200";
            case 'active': return "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 border-emerald-200";
            case 'new': return "bg-blue-50 dark:bg-blue-900/30 text-blue-700 border-blue-200";
            default: return "bg-muted text-foreground border-border";
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Customers</h2>
                    <p className="text-muted-foreground">Manage your customer database and relationships.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
                            <p className="text-2xl font-bold text-foreground">{customers.length}</p>
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
                            <p className="text-2xl font-bold text-foreground">{customers.filter(c => c.status === 'vip').length}</p>
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
                            <p className="text-2xl font-bold text-foreground">{customers.filter(c => c.status === 'active').length}</p>
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
                            <p className="text-2xl font-bold text-foreground">{customers.filter(c => c.status === 'new').length}</p>
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
                                            {customer.location}
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
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-muted-foreground">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                <DropdownMenuItem>View Bookings</DropdownMenuItem>
                                                <DropdownMenuItem>Send Message</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600 dark:text-red-400">Remove Customer</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
