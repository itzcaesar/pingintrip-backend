// app/dashboard/settings/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, User, Bell, Shield, CreditCard, Building2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        bookings: true,
        marketing: false,
    });

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings</h2>
                <p className="text-muted-foreground">Manage your account preferences and configurations.</p>
            </div>

            {/* Profile Section */}
            <Card className="border-border shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <CardTitle className="text-foreground">Profile</CardTitle>
                            <CardDescription>Your personal information and account details.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20 border-2 border-border">
                            <AvatarFallback className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 text-xl font-bold">AD</AvatarFallback>
                        </Avatar>
                        <div>
                            <Button variant="outline" size="sm" className="border-border">Change Photo</Button>
                            <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
                        </div>
                    </div>
                    <Separator className="bg-zinc-100" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-foreground">Full Name</Label>
                            <Input defaultValue="Admin User" className="bg-muted border-border" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">Email Address</Label>
                            <Input defaultValue="admin@pingintrip.com" className="bg-muted border-border" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">Phone Number</Label>
                            <Input defaultValue="+62 812-3456-7890" className="bg-muted border-border" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">Role</Label>
                            <Input defaultValue="Administrator" disabled className="bg-zinc-100 border-border text-muted-foreground" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Business Section */}
            <Card className="border-border shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                            <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <CardTitle className="text-foreground">Business Information</CardTitle>
                            <CardDescription>Your company details shown to customers.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-foreground">Business Name</Label>
                            <Input defaultValue="Pingintrip" className="bg-muted border-border" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-foreground">Business Email</Label>
                            <Input defaultValue="contact@pingintrip.com" className="bg-muted border-border" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-foreground">Address</Label>
                            <Input defaultValue="Jl. Raya Senggigi No. 123, Lombok, NTB" className="bg-muted border-border" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card className="border-border shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                            <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <CardTitle className="text-foreground">Notifications</CardTitle>
                            <CardDescription>Configure how you receive updates.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-foreground">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive updates via email.</p>
                        </div>
                        <Switch checked={notifications.email} onCheckedChange={(v: boolean) => setNotifications({ ...notifications, email: v })} />
                    </div>
                    <Separator className="bg-zinc-100" />
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-foreground">Push Notifications</p>
                            <p className="text-sm text-muted-foreground">Get notified in real-time.</p>
                        </div>
                        <Switch checked={notifications.push} onCheckedChange={(v: boolean) => setNotifications({ ...notifications, push: v })} />
                    </div>
                    <Separator className="bg-zinc-100" />
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-foreground">Booking Alerts</p>
                            <p className="text-sm text-muted-foreground">Notify on new bookings and changes.</p>
                        </div>
                        <Switch checked={notifications.bookings} onCheckedChange={(v: boolean) => setNotifications({ ...notifications, bookings: v })} />
                    </div>
                    <Separator className="bg-zinc-100" />
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-foreground">Marketing Emails</p>
                            <p className="text-sm text-muted-foreground">Receive promotional content.</p>
                        </div>
                        <Switch checked={notifications.marketing} onCheckedChange={(v: boolean) => setNotifications({ ...notifications, marketing: v })} />
                    </div>
                </CardContent>
            </Card>

            {/* Security Section */}
            <Card className="border-border shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                            <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <CardTitle className="text-foreground">Security</CardTitle>
                            <CardDescription>Protect your account and data.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-foreground">Password</p>
                            <p className="text-sm text-muted-foreground">Last changed 30 days ago.</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-border">Change Password</Button>
                    </div>
                    <Separator className="bg-zinc-100" />
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-foreground">Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">Add an extra layer of security.</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-border">Enable 2FA</Button>
                    </div>
                    <Separator className="bg-zinc-100" />
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-red-600 dark:text-red-400">Delete Account</p>
                            <p className="text-sm text-muted-foreground">Permanently remove your account and data.</p>
                        </div>
                        <Button variant="destructive" size="sm">Delete Account</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
