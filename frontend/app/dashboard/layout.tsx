import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full relative bg-muted/40">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-sidebar">
                <Sidebar />
            </div>
            <main className="md:pl-72 h-full flex flex-col">
                <Navbar />
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
