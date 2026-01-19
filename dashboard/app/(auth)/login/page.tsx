"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/auth-store";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, MapPin } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const response = await api.post("/auth/login", values);
            const { user, accessToken } = response.data;

            setAuth(user, accessToken);
            toast.success(`Welcome back, ${user.name}!`);
            router.push("/dashboard");
        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 401) {
                toast.error("Invalid email or password");
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex bg-background">
            {/* Theme Toggle - Top Right */}
            <div className="absolute top-4 right-4 z-20">
                <ThemeToggle />
            </div>

            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/10 p-2">
                            <Image
                                src="/brand-logo.png"
                                alt="Pingintrip Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-4xl font-bold tracking-tight">Pingintrip</span>
                    </div>

                    <div className="flex items-center gap-2 text-blue-100 mb-8">
                        <MapPin className="h-5 w-5" />
                        <span className="text-lg">Lombok, Indonesia</span>
                    </div>

                    <p className="text-xl text-blue-100 text-center max-w-md leading-relaxed">
                        Your complete travel management solution for vehicle rentals, bookings, and fleet operations.
                    </p>

                    <div className="mt-12 grid grid-cols-3 gap-8 text-center">
                        <div>
                            <p className="text-3xl font-bold">100+</p>
                            <p className="text-blue-200 text-sm">Vehicles</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">5K+</p>
                            <p className="text-blue-200 text-sm">Bookings</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">24/7</p>
                            <p className="text-blue-200 text-sm">Support</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="relative w-10 h-10">
                                <Image
                                    src="/brand-logo.png"
                                    alt="Pingintrip Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <span className="text-2xl font-bold text-foreground">Pingintrip</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                            <MapPin className="h-4 w-4" />
                            <span>Lombok, Indonesia</span>
                        </div>
                    </div>

                    {/* Login Card */}
                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                            <CardDescription>
                                Sign in to access your admin dashboard
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                        <Input
                                                            placeholder="admin@pingintrip.com"
                                                            {...field}
                                                            className="pl-10 h-11"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                        <Input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            {...field}
                                                            className="pl-10 h-11"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                        disabled={loading}
                                    >
                                        {loading ? "Signing in..." : "Sign In"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Pingintrip. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}


