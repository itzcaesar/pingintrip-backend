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
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
            <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative w-48 h-16 mb-2">
                    <Image
                        src="/brand-logo.png"
                        alt="Pingintrip Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                <CardHeader>
                    <CardTitle className="text-center">Sign In</CardTitle>
                    <CardDescription className="text-center">
                        Secure access for administrators
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
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="admin@pingintrip.com" {...field} className="h-10" />
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
                                            <Input type="password" placeholder="••••••••" {...field} className="h-10" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full h-10 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 transition-all font-medium text-white" disabled={loading}>
                                {loading ? "Authenticating..." : "Access Dashboard"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Pingintrip. All rights reserved.
            </p>
        </div>
    );
}
