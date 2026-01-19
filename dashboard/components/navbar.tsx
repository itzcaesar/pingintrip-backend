// components/navbar.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    Bell,
    ChevronRight,
    Search,
    UserCircle
} from "lucide-react";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

import {
    LayoutDashboard,
    CalendarDays,
    Users,
    Car,
    Map,
    FileText,
    Settings,
} from "lucide-react";

// Static pages configuration for "Command Palette" style search
const APP_PAGES = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Bookings", href: "/dashboard/bookings", icon: CalendarDays },
    { name: "Vehicles", href: "/dashboard/vehicles", icon: Car },
    { name: "Customers", href: "/dashboard/customers", icon: Users },
    { name: "GPS Map", href: "/dashboard/map", icon: Map },
    { name: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
    { name: "Reports", href: "/dashboard/reports", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const today = new Date();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        connect,
        disconnect,
        fetchNotifications
    } = useNotifications();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{ bookings: any[], vehicles: any[] } | null>(null);
    const [matchedPages, setMatchedPages] = useState<typeof APP_PAGES>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        connect();
        fetchNotifications();
        return () => disconnect();
    }, [connect, disconnect, fetchNotifications]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        // 1. Immediate Local Search (Pages)
        if (query.length >= 1) {
            const pages = APP_PAGES.filter(page =>
                page.name.toLowerCase().includes(query.toLowerCase())
            );
            setMatchedPages(pages);
        } else {
            setMatchedPages([]);
            setSearchResults(null);
            return;
        }

        // 2. Debounced API Search (Data)
        if (query.length < 2) return; // Wait for 2 chars for API search

        setIsSearching(true);
        searchDebounceRef.current = setTimeout(async () => {
            try {
                const res = await api.get(`/search?q=${query}`);
                setSearchResults(res.data);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        }, 500);
    };

    // Simple breadcrumb logic
    const pathSegments = pathname.split('/').filter(Boolean);
    const currentPage = pathSegments.length > 1
        ? pathSegments[pathSegments.length - 1].charAt(0).toUpperCase() + pathSegments[pathSegments.length - 1].slice(1)
        : "Overview";

    return (
        <div className="flex items-center justify-between h-16 px-6 lg:px-8 bg-background border-b border-border transition-colors">
            {/* Left: Mobile Trigger & Breadcrumbs */}
            <div className="flex items-center gap-4">
                <MobileSidebar />
                <div className="hidden md:flex items-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    <span className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Dashboard</span>
                    <ChevronRight className="w-4 h-4 mx-2 text-zinc-400 dark:text-zinc-600" />
                    <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{currentPage}</span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* Date Display */}
                <div className="hidden lg:block text-sm text-zinc-500 dark:text-zinc-400 font-medium mr-4">
                    {format(today, "EEEE, MMMM do, yyyy")}
                </div>

                {/* Search Bar (Optional, Desktop) */}
                <div className="relative hidden md:block w-64 lg:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 pl-9 h-9 text-sm focus-visible:ring-blue-500"
                    />
                    {/* Search Results Dropdown */}
                    {(searchQuery.length >= 1) && (searchResults || matchedPages.length > 0) && (
                        <div className="absolute top-10 left-0 w-full bg-background border rounded-md shadow-lg z-50 p-2 max-h-96 overflow-y-auto">

                            {/* PAGES / NAVIGATION RESULTS */}
                            {matchedPages.length > 0 && (
                                <div className="mb-2">
                                    <h4 className="text-xs font-semibold text-muted-foreground px-2 py-1">PAGES</h4>
                                    {matchedPages.map((page) => (
                                        <div
                                            key={page.href}
                                            className="px-2 py-2 hover:bg-accent rounded-sm cursor-pointer text-sm flex items-center gap-2"
                                            onClick={() => {
                                                router.push(page.href);
                                                setSearchQuery("");
                                                setSearchResults(null);
                                            }}
                                        >
                                            <page.icon className="w-4 h-4 text-zinc-500" />
                                            <div className="font-medium">{page.name}</div>
                                        </div>
                                    ))}
                                    {searchResults && (searchResults.bookings.length > 0 || searchResults.vehicles.length > 0) && <DropdownMenuSeparator className="my-2" />}
                                </div>
                            )}

                            {isSearching ? (
                                <div className="p-2 text-center text-sm text-muted-foreground">Searching data...</div>
                            ) : (
                                <>
                                    {searchResults && searchResults.bookings.length === 0 && searchResults.vehicles.length === 0 && matchedPages.length === 0 && (
                                        <div className="p-2 text-center text-sm text-muted-foreground">No results found</div>
                                    )}

                                    {searchResults && searchResults.bookings.length > 0 && (
                                        <div className="mb-2">
                                            <h4 className="text-xs font-semibold text-muted-foreground px-2 py-1">BOOKINGS</h4>
                                            {searchResults.bookings.map((booking: any) => (
                                                <div
                                                    key={booking.id}
                                                    className="px-2 py-2 hover:bg-accent rounded-sm cursor-pointer text-sm"
                                                    onClick={() => {
                                                        // Navigate to bookings page (pseudo-navigation logic needs router)
                                                        // window.location.href = `/dashboard/bookings?search=${booking.id}`; // Rudimentary
                                                        setSearchQuery("");
                                                        setSearchResults(null);
                                                    }}
                                                >
                                                    <div className="font-medium">{booking.customerName}</div>
                                                    <div className="text-xs text-muted-foreground">{format(new Date(booking.pickupDate), 'MMM d')} • {booking.status}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {searchResults && searchResults.vehicles.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-muted-foreground px-2 py-1">VEHICLES</h4>
                                            {searchResults.vehicles.map((vehicle: any) => (
                                                <div
                                                    key={vehicle.id}
                                                    className="px-2 py-2 hover:bg-accent rounded-sm cursor-pointer text-sm"
                                                    onClick={() => {
                                                        // window.location.href = `/dashboard/vehicles?search=${vehicle.plateNumber}`;
                                                        setSearchQuery("");
                                                        setSearchResults(null);
                                                    }}
                                                >
                                                    <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                                                    <div className="text-xs text-muted-foreground">{vehicle.plateNumber} • {vehicle.status}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end">
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <h4 className="font-semibold text-sm">Notifications</h4>
                            {unreadCount > 0 && (
                                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-blue-600" onClick={() => markAllAsRead()}>
                                    Mark all read
                                </Button>
                            )}
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No notifications
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "px-4 py-3 border-b last:border-0 hover:bg-accent/50 cursor-pointer transition-colors",
                                            !notification.isRead && "bg-blue-50/50 dark:bg-blue-900/10"
                                        )}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                "w-2 h-2 mt-1.5 rounded-full shrink-0",
                                                notification.type === 'SUCCESS' ? "bg-emerald-500" :
                                                    notification.type === 'WARNING' ? "bg-amber-500" :
                                                        notification.type === 'ERROR' ? "bg-red-500" : "bg-blue-500"
                                            )} />
                                            <div>
                                                <p className="text-sm font-medium leading-none mb-1">{notification.title}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* User Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-700">
                                <AvatarImage src="/avatar-placeholder.png" alt="Admin" />
                                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold">AD</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">Admin User</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    admin@pingintrip.com
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            Profile Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Billing
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
