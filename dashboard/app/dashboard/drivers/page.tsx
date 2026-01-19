"use client";

import { useQuery } from "@tanstack/react-query";
import { User, Phone, MapPin, MoreVertical, ShieldCheck } from "lucide-react";

import api from "@/lib/api";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Driver = {
    id: string;
    name: string;
    phone: string;
    role: "DRIVER" | "GUIDE" | "BOTH";
    status: "ACTIVE" | "OFF";
    notes?: string;
};

export default function DriversPage() {
    const { data: drivers, isLoading } = useQuery<Driver[]>({
        queryKey: ["drivers-list"],
        queryFn: async () => {
            const res = await api.get("/drivers?limit=100");
            return res.data.data;
        },
    });

    if (isLoading) {
        return (
            <div className="p-8 space-y-8">
                <Skeleton className="h-10 w-48" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[200px]" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Drivers & Guides</h2>
                    <p className="text-muted-foreground mt-2">Manage your team and assignments.</p>
                </div>
                <Button>Add Driver</Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {drivers?.map((driver) => (
                    <Card key={driver.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} />
                                <AvatarFallback>{driver.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <CardTitle className="text-base">{driver.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                    <Phone className="h-3 w-3" />
                                    {driver.phone}
                                </CardDescription>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                                    <DropdownMenuItem>View Performance</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant={driver.status === 'ACTIVE' ? 'default' : 'secondary'} className={driver.status === 'ACTIVE' ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                    {driver.status}
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" />
                                    {driver.role}
                                </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-orange-500" />
                                    <span>Current Location: <span className="font-medium text-slate-700">Depot (Idle)</span></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
