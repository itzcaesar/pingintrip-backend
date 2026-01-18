"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    CalendarDays,
    Car,
    Users,
    Map,
    LogOut,
    MapPin
} from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Bookings",
        icon: CalendarDays,
        href: "/dashboard/bookings",
        color: "text-violet-500",
    },
    {
        label: "Vehicles",
        icon: Car,
        href: "/dashboard/vehicles",
        color: "text-pink-700",
    },
    {
        label: "Drivers",
        icon: Users,
        href: "/dashboard/drivers",
        color: "text-orange-700",
    },
    {
        label: "Live Map",
        icon: Map,
        href: "/dashboard/map",
        color: "text-emerald-500",
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-2 mb-10 mt-2">
                    <div className="relative w-10 h-10 mr-3">
                        <Image
                            src="/brand-logo.png"
                            alt="Pingintrip"
                            fill
                            className="object-contain rounded-lg"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-primary">
                        Pingintrip
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition",
                                pathname === route.href
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", pathname === route.href ? "text-primary" : "text-muted-foreground")} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
