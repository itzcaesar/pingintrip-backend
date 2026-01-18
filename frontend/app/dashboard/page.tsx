"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Users,
    CalendarDays,
    Car,
    Activity,
    TrendingUp,
    CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth-store";

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

    // Fetch active vehicles separately (or could be merged)
    const { data: vehicleStats } = useQuery({
        queryKey: ["vehicle-stats"],
        queryFn: async () => {
            const res = await api.get("/vehicles/available");
            // Assuming the API returns a list, calculate length
            // Or if it returns object { available: N }
            // Let's assume list for now based on older code or endpoint 'available' usually returns list
            return Array.isArray(res.data) ? { available: res.data.length } : res.data;
        }
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (isLoading) {
        return <div className="p-8 space-y-8">
            <div className="flex gap-4"><Skeleton className="h-10 w-48" /></div>
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
            <Skeleton className="h-[400px] w-full" />
        </div>;
    }

    return (
        <motion.div
            className="p-8 space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">Dashboard</h2>
                    <p className="text-muted-foreground mt-1">Hello, {user?.name}. Here's what's happening nicely.</p>
                </div>
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium text-slate-600">System Live</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <motion.div variants={itemVariants}>
                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                            <CreditCard className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-800">{stats ? formatIDR(stats.totalRevenue) : "Rp 0"}</div>
                            <p className="text-xs text-muted-foreground mt-1">+12.5% from last month</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-emerald-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
                            <CalendarDays className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-800">{stats?.activeBookings || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Trips currently ongoing</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Available Vehicles</CardTitle>
                            <Car className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-800">{vehicleStats?.available || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Ready for dispatch</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
                            <Activity className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-800">{stats?.totalBookings || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">All time volume</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <motion.div className="col-span-4" variants={itemVariants}>
                    <Card className="h-full hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-emerald-500" />
                                Revenue Overview (30 Days)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats?.chartData || []}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#6b7280"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => {
                                                const d = new Date(val);
                                                return `${d.getDate()}/${d.getMonth() + 1}`;
                                            }}
                                        />
                                        <YAxis
                                            stroke="#6b7280"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}M`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                            formatter={(val: any) => [formatIDR(val), 'Revenue']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div className="col-span-3" variants={itemVariants}>
                    <Card className="h-full hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {/* Placeholder for recent activity feed */}
                                {[1, 2, 3, 4, 5].map((_, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className={`h-9 w-9 rounded-full flex items-center justify-center ${i % 2 === 0 ? 'bg-blue-100 text-blue-500' : 'bg-orange-100 text-orange-500'}`}>
                                            {i % 2 === 0 ? <CreditCard className="h-5 w-5" /> : <Car className="h-5 w-5" />}
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{i % 2 === 0 ? 'New Booking Confirmed' : 'Vehicle Returned'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {i === 0 ? 'Just now' : `${i * 2} hours ago`}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-sm">
                                            {i % 2 === 0 ? '+Rp 1.5jt' : 'Available'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
