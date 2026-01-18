import { MapPin } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center">
                    <div className="bg-primary p-3 rounded-full mb-4">
                        <MapPin className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Pingintrip Dashboard</h1>
                    <p className="text-muted-foreground text-sm mt-2">Manage your fleet and bookings</p>
                </div>
                {children}
            </div>
        </div>
    );
}
