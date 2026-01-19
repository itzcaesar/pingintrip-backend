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

const BEACH_BG = "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2500&auto=format&fit=crop";

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
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background">
            {/* Theme Toggle - Top Right */}
            <div className="absolute top-4 right-4 z-20">
                <ThemeToggle />
            </div>

            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={BEACH_BG}
                    alt="Tropical Beach"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]" />
            </div>

            <div className="z-10 w-full max-w-md px-4 animate-in fade-in zoom-in-95 duration-700">

                {/* Logo Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center gap-4 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 p-4 rounded-2xl shadow-2xl">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden shadow-inner">
                            <Image
                                src="/brand-logo.png"
                                alt="Pingintrip Logo"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <span className="text-3xl font-bold text-white tracking-tight drop-shadow-md">Pingintrip</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 text-white/70 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>Lombok, Indonesia</span>
                    </div>
                </div>

                {/* Login Card */}
                <Card className="border-0 bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-2xl ring-1 ring-white/20 dark:ring-white/10">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">Admin Access</CardTitle>
                        <CardDescription className="text-gray-200 dark:text-gray-300">
                            Enter your credentials to manage Pingintrip
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/90">Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-300" />
                                                    <Input
                                                        placeholder="admin@pingintrip.com"
                                                        {...field}
                                                        className="pl-10 h-11 bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:border-transparent transition-all hover:bg-white/15"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-300" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/90">Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-300" />
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        {...field}
                                                        className="pl-10 h-11 bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-white placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:border-transparent transition-all hover:bg-white/15"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-300" />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/30 border-none transition-all duration-300 hover:scale-[1.02]"
                                    disabled={loading}
                                >
                                    {loading ? "Authenticating..." : "Sign In to Dashboard"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <p className="mt-6 text-center text-sm text-white/60">
                    &copy; {new Date().getFullYear()} Pingintrip. All rights reserved.
                </p>
            </div>
        </div>
    );
}

