// components/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    CalendarCheck,
    CarFront,
    Users,
    CalendarDays,
    BarChart3,
    Settings,
    LogOut
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
    },
    {
        label: "Bookings",
        icon: CalendarCheck,
        href: "/dashboard/bookings",
    },
    {
        label: "Vehicles",
        icon: CarFront,
        href: "/dashboard/vehicles",
    },
    {
        label: "Customers",
        icon: Users,
        href: "/dashboard/customers",
    },
    {
        label: "Calendar",
        icon: CalendarDays,
        href: "/dashboard/calendar",
    },
    {
        label: "Reports",
        icon: BarChart3,
        href: "/dashboard/reports",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-colors">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8">
                        <Image
                            src="/brand-logo.png"
                            alt="Pingintrip"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="font-bold text-xl text-zinc-900 dark:text-zinc-100 tracking-tight">Pingintrip</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col gap-1 py-4 overflow-y-auto">
                {routes.map((route) => {
                    const isActive = pathname === route.href;
                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors relative",
                                isActive
                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
                            )}
                            <route.icon className={cn("w-5 h-5", isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 dark:text-zinc-500")} />
                            {route.label}
                        </Link>
                    )
                })}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 gap-3 px-2"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}

