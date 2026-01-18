"use client";

import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Car, Users, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    // Fetch stats
    const { data: bookingStats } = useQuery({
        queryKey: ['bookingStats'],
        queryFn: async () => {
            const res = await api.get('/bookings?limit=1'); // Hack to get total
            return res.data.meta.total;
        }
    });

    const { data: vehicleStats } = useQuery({
        queryKey: ['vehicleStats'],
        queryFn: async () => {
            const res = await api.get('/vehicles');
            // Count available
            const available = res.data.filter((v: any) => v.status === 'AVAILABLE').length;
            return { total: res.data.length, available };
        }
    });

    const { data: driverStats } = useQuery({
        queryKey: ['driverStats'],
        queryFn: async () => {
            const res = await api.get('/drivers');
            const active = res.data.filter((d: any) => d.status === 'ACTIVE').length;
            return { total: res.data.length, active };
        }
    });

    if (!user) return null;

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">Welcome, {user.name}</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{bookingStats || 0}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{vehicleStats?.available || 0} / {vehicleStats?.total || 0}</div>
                        <p className="text-xs text-muted-foreground">Vehicles available now</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{driverStats?.active || 0} / {driverStats?.total || 0}</div>
                        <p className="text-xs text-muted-foreground">Drivers on duty</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Status</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">Online</div>
                        <p className="text-xs text-muted-foreground">All systems operational</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Placeholer */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">No recent bookings to display.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
