// app/dashboard/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import {
    CalendarCheck,
    CarFront,
    Activity,
    CreditCard,
} from "lucide-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth-store";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
    totalBookings: number;
    activeBookings: number;
    totalRevenue: number;
    chartData: { date: string; revenue: number }[];
}

type Booking = {
    id: string;
    customerName: string;
    vehicleType: string;
    pickupDate: string;
    status: string;
    totalAmount: number;
    createdAt: string;
};

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user);

    // Fetch stats from /bookings/stats
    const { data: stats, isLoading: loadingStats } = useQuery<DashboardStats>({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const res = await api.get("/bookings/stats");
            return res.data;
        },
    });

    // Fetch available vehicles
    const { data: vehicleStats, isLoading: loadingVehicles } = useQuery({
        queryKey: ["vehicle-stats"],
        queryFn: async () => {
            const res = await api.get("/vehicles/available");
            return Array.isArray(res.data) ? { available: res.data.length } : res.data;
        }
    });

    // Fetch recent bookings for activity feed
    const { data: recentBookings = [], isLoading: loadingRecent } = useQuery<Booking[]>({
        queryKey: ["recent-bookings"],
        queryFn: async () => {
            const res = await api.get("/bookings?limit=5");
            const data = res.data;
            return Array.isArray(data) ? data : (data?.data || []);
        },
    });

    const isLoading = loadingStats || loadingVehicles || loadingRecent;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                </div>
                <div className="grid gap-4 md:grid-cols-7">
                    <Skeleton className="col-span-4 h-[400px] rounded-xl" />
                    <Skeleton className="col-span-3 h-[400px] rounded-xl" />
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'CONFIRMED': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
            case 'COMPLETED': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
            case 'PENDING': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
            case 'CANCELLED': return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300';
            default: return 'bg-muted text-foreground';
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
                <p className="text-muted-foreground">Welcome back, {user?.name || 'Admin'}. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{stats ? formatIDR(stats.totalRevenue) : "Rp 0"}</div>
                        <p className="text-xs text-muted-foreground mt-1">From all bookings</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{stats?.activeBookings || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Trips currently ongoing</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Available Fleet</CardTitle>
                        <CarFront className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{vehicleStats?.available || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Vehicles ready for dispatch</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{stats?.totalBookings || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Lifetime booking volume</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                {/* Revenue Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Daily revenue performance for the last 30 days.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px] w-full">
                            {stats?.chartData && stats.chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.chartData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                                        <XAxis
                                            dataKey="date"
                                            className="text-muted-foreground"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => {
                                                const d = new Date(val);
                                                return `${d.getDate()}/${d.getMonth() + 1}`;
                                            }}
                                            dy={10}
                                        />
                                        <YAxis
                                            className="text-muted-foreground"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}M`}
                                            dx={-10}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                color: 'hsl(var(--foreground))'
                                            }}
                                            itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                                            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                                            formatter={(val: any) => [formatIDR(val), 'Revenue']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#0EA5E9"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No revenue data available yet
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Bookings */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>Latest booking activity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentBookings.length > 0 ? (
                            <div className="space-y-4">
                                {recentBookings.map((booking) => (
                                    <div key={booking.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full flex items-center justify-center border bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                                                <CreditCard className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium leading-none text-foreground">{booking.customerName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {booking.vehicleType} • {format(new Date(booking.pickupDate), 'dd MMM yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={`text-xs ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No recent bookings
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
