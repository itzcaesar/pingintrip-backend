// app/dashboard/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import {
    Users,
    CalendarCheck,
    CarFront,
    Activity,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight
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
import { Button } from "@/components/ui/button";

interface DashboardStats {
    totalBookings: number;
    activeBookings: number;
    totalRevenue: number;
    chartData: { date: string; revenue: number }[];
}

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export default function DashboardPage() {
    const user = useAuthStore((state) => state.user);

    // Fetch stats
    const { data: stats, isLoading } = useQuery<DashboardStats>({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const res = await api.get("/bookings/stats");
            return res.data;
        },
    });

    const { data: vehicleStats } = useQuery({
        queryKey: ["vehicle-stats"],
        queryFn: async () => {
            const res = await api.get("/vehicles/available");
            return Array.isArray(res.data) ? { available: res.data.length } : res.data;
        }
    });

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

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
                <p className="text-muted-foreground">Welcome back, {user?.name}. Here's what's happening today.</p>
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
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center mt-1 font-medium">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +12.5% from last month
                        </p>
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
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.chartData || []}>
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
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Sales / Activity */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest system events and bookings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <div key={i} className="flex items-center">
                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center border ${i % 2 === 0 ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' : 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400'}`}>
                                        {i % 2 === 0 ? <CreditCard className="h-4 w-4" /> : <CarFront className="h-4 w-4" />}
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none text-foreground">{i % 2 === 0 ? 'Booking #TRP-8821 Confirmed' : 'Vehicle DK 8812 Returned'}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {i === 0 ? 'Just now' : `${i * 2} hours ago`} • {i % 2 === 0 ? 'John Doe' : 'Staff'}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-sm text-foreground">
                                        {i % 2 === 0 ? '+Rp 1.5jt' : 'Avail'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

