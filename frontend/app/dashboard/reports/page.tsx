// app/dashboard/reports/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, CarFront, Users, CalendarCheck, Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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

// Mock data for charts
const revenueData = [
    { month: 'Jan', revenue: 12500000 },
    { month: 'Feb', revenue: 15800000 },
    { month: 'Mar', revenue: 14200000 },
    { month: 'Apr', revenue: 18900000 },
    { month: 'May', revenue: 22100000 },
    { month: 'Jun', revenue: 19500000 },
];

const bookingsByVehicle = [
    { name: 'Toyota Avanza', bookings: 45 },
    { name: 'Innova Zenix', bookings: 38 },
    { name: 'Honda PCX', bookings: 32 },
    { name: 'Suzuki Jimny', bookings: 28 },
    { name: 'NMAX Turbo', bookings: 22 },
];

const vehicleTypeData = [
    { name: 'Cars', value: 65 },
    { name: 'Motorcycles', value: 25 },
    { name: 'Vans', value: 10 },
];

const COLORS = ['#0EA5E9', '#10B981', '#8B5CF6'];

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

export default function ReportsPage() {
    const [exportingCSV, setExportingCSV] = useState(false);
    const [exportingPDF, setExportingPDF] = useState(false);

    const handleExportCSV = async () => {
        setExportingCSV(true);
        try {
            // Prepare data for CSV
            const revenueCSV = revenueData.map(item => ({
                Month: item.month,
                'Revenue (IDR)': item.revenue,
            }));

            const vehicleCSV = bookingsByVehicle.map(item => ({
                Vehicle: item.name,
                Bookings: item.bookings,
            }));

            // Create combined report data
            const reportData = [
                { Section: 'Revenue by Month' },
                ...revenueCSV,
                { Section: '' },
                { Section: 'Bookings by Vehicle' },
                ...vehicleCSV,
            ];

            // Generate CSV
            const csv = Papa.unparse(reportData);

            // Download file
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

            // Title
            doc.setFontSize(20);
            doc.setTextColor(30, 41, 59);
            doc.text('Pingintrip Analytics Report', pageWidth / 2, 20, { align: 'center' });

            // Date
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(`Generated: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, pageWidth / 2, 28, { align: 'center' });

            // Summary Stats
            doc.setFontSize(14);
            doc.setTextColor(30, 41, 59);
            doc.text('Key Metrics Summary', 14, 45);

            const summaryData = [
                ['Total Revenue', 'Rp 103,200,000', '+12.5%'],
                ['Total Bookings', '187', '+8.3%'],
                ['New Customers', '42', '+15.2%'],
                ['Fleet Utilization', '78%', '-2.1%'],
            ];

            autoTable(doc, {
                startY: 50,
                head: [['Metric', 'Value', 'Change']],
                body: summaryData,
                theme: 'striped',
                headStyles: { fillColor: [14, 165, 233] },
            });

            // Revenue Table
            doc.setFontSize(14);
            doc.text('Monthly Revenue', 14, (doc as any).lastAutoTable.finalY + 15);

            const revenueTableData = revenueData.map(item => [
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

            // Top Vehicles Table
            doc.setFontSize(14);
            doc.text('Top Performing Vehicles', 14, (doc as any).lastAutoTable.finalY + 15);

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

            // Footer
            const pageCount = doc.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(150);
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text('© Pingintrip - Lombok, Indonesia', 14, doc.internal.pageSize.getHeight() - 10);
                doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
            }

            // Save PDF
            doc.save(`pingintrip-report-${new Date().toISOString().split('T')[0]}.pdf`);

            toast.success("Report exported to PDF successfully");
        } catch (error) {
            toast.error("Failed to export PDF");
            console.error(error);
        } finally {
            setExportingPDF(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Reports & Analytics</h2>
                    <p className="text-muted-foreground">Track your business performance and insights.</p>
                </div>
                <div className="flex gap-2">
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
                            <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                +12.5%
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold text-foreground">Rp 103.2jt</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                                <CalendarCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                +8.3%
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-sm text-muted-foreground">Total Bookings</p>
                            <p className="text-2xl font-bold text-foreground">187</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                +15.2%
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-sm text-muted-foreground">New Customers</p>
                            <p className="text-2xl font-bold text-foreground">42</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                                <CarFront className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="flex items-center text-red-600 dark:text-red-400 text-sm font-medium">
                                <TrendingDown className="h-4 w-4 mr-1" />
                                -2.1%
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="text-sm text-muted-foreground">Fleet Utilization</p>
                            <p className="text-2xl font-bold text-foreground">78%</p>
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
                        <CardDescription>Monthly revenue over the past 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                                    <XAxis dataKey="month" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} formatter={(val: any) => [formatIDR(val), 'Revenue']} />
                                    <Area type="monotone" dataKey="revenue" stroke="#0EA5E9" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Vehicle Type Distribution */}
                <Card className="col-span-3 border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-foreground">Bookings by Type</CardTitle>
                        <CardDescription>Distribution of vehicle type rentals.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
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
                        </div>
                        <div className="flex justify-center gap-6 mt-2">
                            {vehicleTypeData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                    <span className="text-sm text-muted-foreground">{entry.name} ({entry.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Popular Vehicles */}
            <Card className="border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-foreground">Top Performing Vehicles</CardTitle>
                    <CardDescription>Vehicles with the most bookings this period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bookingsByVehicle} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-border" />
                                <XAxis type="number" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} width={120} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                                <Bar dataKey="bookings" fill="#0EA5E9" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
