// app/dashboard/reports/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, DollarSign, CarFront, CalendarCheck, Download, FileText, Loader2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from "@/lib/api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format, subDays, startOfMonth, startOfYear, isWithinInterval, parseISO } from "date-fns";

const COLORS = ['#0EA5E9', '#10B981', '#8B5CF6'];

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

type DashboardStats = {
    totalBookings: number;
    activeBookings: number;
    totalRevenue: number;
    chartData: { date: string; revenue: number }[];
};

type Vehicle = {
    id: string;
    brand: string;
    model: string;
    type: string;
    status: string;
};

type Booking = {
    id: string;
    vehicleType: string;
    pickupDate: string;
    totalPrice: number;
    status: string;
    assignedVehicle?: { brand: string; model: string };
};

type DateRangeOption = "7d" | "30d" | "thisMonth" | "thisYear" | "all";

const dateRangeOptions: { value: DateRangeOption; label: string }[] = [
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "thisMonth", label: "This Month" },
    { value: "thisYear", label: "This Year" },
    { value: "all", label: "All Time" },
];

const getDateRange = (option: DateRangeOption): { start: Date; end: Date } => {
    const now = new Date();
    switch (option) {
        case "7d":
            return { start: subDays(now, 7), end: now };
        case "30d":
            return { start: subDays(now, 30), end: now };
        case "thisMonth":
            return { start: startOfMonth(now), end: now };
        case "thisYear":
            return { start: startOfYear(now), end: now };
        case "all":
        default:
            return { start: new Date(2000, 0, 1), end: now };
    }
};

export default function ReportsPage() {
    const [exportingCSV, setExportingCSV] = useState(false);
    const [exportingPDF, setExportingPDF] = useState(false);
    const [dateRange, setDateRange] = useState<DateRangeOption>("30d");

    // Fetch stats from /bookings/stats (the actual available endpoint)
    const { data: stats, isLoading: loadingStats } = useQuery<DashboardStats>({
        queryKey: ["report-stats"],
        queryFn: async () => {
            const res = await api.get("/bookings/stats");
            return res.data;
        },
    });

    // Fetch vehicles for breakdown
    const { data: vehicles = [], isLoading: loadingVehicles } = useQuery<Vehicle[]>({
        queryKey: ["report-vehicles"],
        queryFn: async () => {
            const res = await api.get("/vehicles");
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        },
    });

    // Fetch bookings for vehicle breakdown
    const { data: bookings = [], isLoading: loadingBookings } = useQuery<Booking[]>({
        queryKey: ["report-bookings"],
        queryFn: async () => {
            const res = await api.get("/bookings?limit=100");
            return Array.isArray(res.data) ? res.data : (res.data?.data || []);
        },
    });

    // Filter bookings by date range
    const filteredBookings = useMemo(() => {
        const range = getDateRange(dateRange);
        return bookings.filter(b => {
            try {
                const pickupDate = parseISO(b.pickupDate);
                return isWithinInterval(pickupDate, { start: range.start, end: range.end });
            } catch {
                return false;
            }
        });
    }, [bookings, dateRange]);

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const totalBookings = filteredBookings.length;
        const activeBookings = filteredBookings.filter(b => ['PENDING', 'CONFIRMED', 'ON_TRIP'].includes(b.status)).length;
        return { totalRevenue, totalBookings, activeBookings };
    }, [filteredBookings]);

    // Filter chart data by date range
    const filteredChartData = useMemo(() => {
        if (!stats?.chartData) return [];
        const range = getDateRange(dateRange);
        return stats.chartData.filter(item => {
            try {
                const date = parseISO(item.date);
                return isWithinInterval(date, { start: range.start, end: range.end });
            } catch {
                return false;
            }
        });
    }, [stats?.chartData, dateRange]);

    // Calculate vehicle type distribution from actual vehicles
    const vehicleTypeData = vehicles.reduce((acc: { name: string; value: number }[], vehicle) => {
        const typeName = vehicle.type === 'CAR' ? 'Cars' : vehicle.type === 'MOTOR' ? 'Motorcycles' : 'Vans';
        const existing = acc.find(item => item.name === typeName);
        if (existing) {
            existing.value++;
        } else {
            acc.push({ name: typeName, value: 1 });
        }
        return acc;
    }, []);

    // Calculate bookings per vehicle from actual bookings
    const bookingsByVehicle = bookings.reduce((acc: { name: string; bookings: number }[], booking) => {
        const vehicleName = booking.assignedVehicle
            ? `${booking.assignedVehicle.brand} ${booking.assignedVehicle.model}`
            : "Unassigned";
        const existing = acc.find(item => item.name === vehicleName);
        if (existing) {
            existing.bookings++;
        } else {
            acc.push({ name: vehicleName, bookings: 1 });
        }
        return acc;
    }, []).sort((a, b) => b.bookings - a.bookings).slice(0, 5);

    // Transform chart data for monthly view
    const monthlyRevenue = stats?.chartData?.reduce((acc: { month: string; revenue: number }[], item) => {
        const date = new Date(item.date);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        const existing = acc.find(m => m.month === monthKey);
        if (existing) {
            existing.revenue += item.revenue;
        } else {
            acc.push({ month: monthKey, revenue: item.revenue });
        }
        return acc;
    }, []) || [];

    const handleExportCSV = async () => {
        setExportingCSV(true);
        try {
            const revenueCSV = monthlyRevenue.map(item => ({
                Month: item.month,
                'Revenue (IDR)': item.revenue,
            }));

            const vehicleCSV = bookingsByVehicle.map(item => ({
                Vehicle: item.name,
                Bookings: item.bookings,
            }));

            const reportData = [
                { Section: 'Revenue by Month' },
                ...revenueCSV,
                { Section: '' },
                { Section: 'Bookings by Vehicle' },
                ...vehicleCSV,
            ];

            const csv = Papa.unparse(reportData);

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `pingintrip-report-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Report exported to CSV successfully");
        } catch (error) {
            toast.error("Failed to export CSV");
            console.error(error);
        } finally {
            setExportingCSV(false);
        }
    };

    const handleExportPDF = async () => {
        setExportingPDF(true);
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            doc.setFontSize(20);
            doc.setTextColor(30, 41, 59);
            doc.text('Pingintrip Analytics Report', pageWidth / 2, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(`Generated: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, pageWidth / 2, 28, { align: 'center' });

            doc.setFontSize(14);
            doc.setTextColor(30, 41, 59);
            doc.text('Key Metrics Summary', 14, 45);

            const summaryData = [
                ['Total Revenue', formatIDR(stats?.totalRevenue || 0)],
                ['Total Bookings', String(stats?.totalBookings || 0)],
                ['Active Bookings', String(stats?.activeBookings || 0)],
                ['Total Vehicles', String(vehicles.length)],
            ];

            autoTable(doc, {
                startY: 50,
                head: [['Metric', 'Value']],
                body: summaryData,
                theme: 'striped',
                headStyles: { fillColor: [14, 165, 233] },
            });

            if (monthlyRevenue.length > 0) {
                doc.setFontSize(14);
                doc.text('Monthly Revenue', 14, (doc as any).lastAutoTable.finalY + 15);

                const revenueTableData = monthlyRevenue.map(item => [
                    item.month,
                    formatIDR(item.revenue),
                ]);

                autoTable(doc, {
                    startY: (doc as any).lastAutoTable.finalY + 20,
                    head: [['Month', 'Revenue']],
                    body: revenueTableData,
                    theme: 'striped',
                    headStyles: { fillColor: [14, 165, 233] },
                });
            }

            if (bookingsByVehicle.length > 0) {
                doc.setFontSize(14);
                doc.text('Top Vehicles by Bookings', 14, (doc as any).lastAutoTable.finalY + 15);

                const vehicleTableData = bookingsByVehicle.map(item => [
                    item.name,
                    item.bookings.toString(),
                ]);

                autoTable(doc, {
                    startY: (doc as any).lastAutoTable.finalY + 20,
                    head: [['Vehicle', 'Bookings']],
                    body: vehicleTableData,
                    theme: 'striped',
                    headStyles: { fillColor: [14, 165, 233] },
                });
            }

            const pageCount = doc.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(150);
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text('© Pingintrip - Lombok, Indonesia', 14, doc.internal.pageSize.getHeight() - 10);
                doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
            }

            doc.save(`pingintrip-report-${new Date().toISOString().split('T')[0]}.pdf`);

            toast.success("Report exported to PDF successfully");
        } catch (error) {
            toast.error("Failed to export PDF");
            console.error(error);
        } finally {
            setExportingPDF(false);
        }
    };

    const isLoading = loadingStats || loadingVehicles || loadingBookings;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-64" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-28" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
                </div>
                <div className="grid gap-4 md:grid-cols-7">
                    <Skeleton className="col-span-4 h-80" />
                    <Skeleton className="col-span-3 h-80" />
                </div>
                <Skeleton className="h-80" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Reports & Analytics</h2>
                    <p className="text-muted-foreground">Track your business performance and insights.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRangeOption)}>
                        <SelectTrigger className="w-[160px] border-border">
                            <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {dateRangeOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        className="border-border"
                        onClick={handleExportPDF}
                        disabled={exportingPDF}
                    >
                        {exportingPDF ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <FileText className="mr-2 h-4 w-4" />
                        )}
                        Export PDF
                    </Button>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleExportCSV}
                        disabled={exportingCSV}
                    >
                        {exportingCSV ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        Download CSV
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-border shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold text-foreground">{formatIDR(filteredStats.totalRevenue)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                                <CalendarCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-sm text-muted-foreground">Total Bookings</p>
                            <p className="text-2xl font-bold text-foreground">{filteredStats.totalBookings}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-sm text-muted-foreground">Active Bookings</p>
                            <p className="text-2xl font-bold text-foreground">{filteredStats.activeBookings}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                                <CarFront className="h-5 w-5 text-orange-600" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-sm text-muted-foreground">Total Vehicles</p>
                            <p className="text-2xl font-bold text-foreground">{vehicles.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-7">
                {/* Revenue Chart */}
                <Card className="col-span-4 border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-foreground">Revenue Trend</CardTitle>
                        <CardDescription>Daily revenue from bookings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {filteredChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={filteredChartData}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                                        <XAxis dataKey="date" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => format(parseISO(val), 'dd MMM')} />
                                        <YAxis className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} formatter={(val: any) => [formatIDR(val), 'Revenue']} labelFormatter={(label) => format(parseISO(label), 'dd MMM yyyy')} />
                                        <Area type="monotone" dataKey="revenue" stroke="#0EA5E9" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No revenue data for this period
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Vehicle Type Distribution */}
                <Card className="col-span-3 border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-foreground">Fleet Composition</CardTitle>
                        <CardDescription>Distribution of vehicle types in fleet.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
                            {vehicleTypeData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={vehicleTypeData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {vehicleTypeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-muted-foreground">No vehicles in fleet</div>
                            )}
                        </div>
                        {vehicleTypeData.length > 0 && (
                            <div className="flex justify-center gap-6 mt-2">
                                {vehicleTypeData.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-sm text-muted-foreground">{entry.name} ({entry.value})</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Popular Vehicles */}
            <Card className="border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-foreground">Top Vehicles by Bookings</CardTitle>
                    <CardDescription>Vehicles with the most bookings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        {bookingsByVehicle.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={bookingsByVehicle} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-border" />
                                    <XAxis type="number" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis dataKey="name" type="category" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} width={120} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                                    <Bar dataKey="bookings" fill="#0EA5E9" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                No booking data available
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
