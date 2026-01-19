// components/navbar.tsx
"use client";

import { usePathname } from "next/navigation";
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

export default function Navbar() {
    const pathname = usePathname();
    const today = new Date();

    // Simple breadcrumb logic
    const pathSegments = pathname.split('/').filter(Boolean);
    const currentPage = pathSegments.length > 1
        ? pathSegments[pathSegments.length - 1].charAt(0).toUpperCase() + pathSegments[pathSegments.length - 1].slice(1)
        : "Overview";

    return (
        <div className="flex items-center justify-between h-16 px-6 lg:px-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
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
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 pl-9 h-9 text-sm focus-visible:ring-blue-500"
                    />
                </div>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
                </Button>

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
