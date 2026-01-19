// app/dashboard/calendar/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, CarFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { format } from "date-fns";

type Booking = {
    id: string;
    customerName: string;
    vehicleType: string;
    pickupDate: string;
    dropoffDate?: string;
    status: "PENDING" | "CONFIRMED" | "ON_TRIP" | "COMPLETED" | "CANCELLED";
    assignedVehicle?: {
        brand: string;
        model: string;
    };
};

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Fetch bookings from API
    const { data: bookings = [], isLoading } = useQuery<Booking[]>({
        queryKey: ["calendar-bookings", year, month],
        queryFn: async () => {
            const res = await api.get(`/bookings?limit=100`);
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            return data;
        },
    });

    // Transform bookings to calendar events
    const bookingEvents = useMemo(() => {
        return bookings.map(booking => {
            const pickupDate = new Date(booking.pickupDate);
            return {
                id: booking.id,
                date: pickupDate.getDate(),
                month: pickupDate.getMonth(),
                year: pickupDate.getFullYear(),
                title: booking.assignedVehicle
                    ? `${booking.assignedVehicle.brand} ${booking.assignedVehicle.model}`
                    : booking.vehicleType,
                customer: booking.customerName,
                time: format(pickupDate, "HH:mm"),
                status: booking.status.toLowerCase(),
            };
        });
    }, [bookings]);

    // Filter events for current month
    const currentMonthEvents = bookingEvents.filter(
        e => e.month === month && e.year === year
    );

    // Generate calendar days
    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null); // Empty cells before first day
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day);
    }

    const getEventsForDay = (day: number) => currentMonthEvents.filter(e => e.date === day);
    const today = new Date().getDate();
    const isToday = (day: number) => day === today && month === new Date().getMonth() && year === new Date().getFullYear();

    // Stats
    const confirmedCount = currentMonthEvents.filter(e => e.status === 'confirmed').length;
    const pendingCount = currentMonthEvents.filter(e => e.status === 'pending').length;
    const uniqueVehicles = new Set(currentMonthEvents.map(e => e.title)).size;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-40" />
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
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Booking Calendar</h2>
                    <p className="text-muted-foreground">View and manage your rental schedule.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold text-foreground min-w-[180px] text-center">{monthName}</span>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">This Month</p>
                            <p className="text-2xl font-bold text-foreground">{currentMonthEvents.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                            <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Confirmed</p>
                            <p className="text-2xl font-bold text-foreground">{confirmedCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                            <CalendarDays className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                            <CarFront className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Vehicles Booked</p>
                            <p className="text-2xl font-bold text-foreground">{uniqueVehicles}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Calendar Grid */}
            <Card>
                <CardContent className="p-4">
                    {/* Days of Week Header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {daysOfWeek.map(day => (
                            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, idx) => {
                            const events = day ? getEventsForDay(day) : [];
                            return (
                                <div
                                    key={idx}
                                    className={`min-h-[100px] p-2 border rounded-lg transition-colors ${day ? 'bg-card hover:bg-muted cursor-pointer border-border' : 'bg-muted/50 border-transparent'
                                        } ${isToday(day as number) ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-background' : ''}`}
                                >
                                    {day && (
                                        <>
                                            <span className={`text-sm font-medium ${isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>
                                                {day}
                                            </span>
                                            <div className="mt-1 space-y-1">
                                                {events.slice(0, 2).map(event => (
                                                    <div
                                                        key={event.id}
                                                        className={`text-xs p-1 rounded truncate ${event.status === 'confirmed'
                                                            ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                            : 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                                            }`}
                                                    >
                                                        {event.title}
                                                    </div>
                                                ))}
                                                {events.length > 2 && (
                                                    <span className="text-xs text-muted-foreground">+{events.length - 2} more</span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming Bookings List */}
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Bookings</CardTitle>
                    <CardDescription>Scheduled rentals for this month.</CardDescription>
                </CardHeader>
                <CardContent>
                    {currentMonthEvents.length > 0 ? (
                        <div className="space-y-3">
                            {currentMonthEvents.map(event => (
                                <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center justify-center w-10 h-10 bg-card rounded-lg border border-border text-sm font-bold text-foreground">
                                            {event.date}
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{event.title}</p>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span>{event.customer}</span>
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'} className={`text-xs ${event.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'}`}>
                                        {event.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No bookings scheduled for this month.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
