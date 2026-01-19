import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex font-sans">
            {/* 1. Fixed Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden md:block transition-colors">
                <Sidebar />
            </aside>

            {/* 2. Main Content Area */}
            <div className="flex-1 flex flex-col md:pl-64 min-h-screen transition-all duration-300">
                {/* 3. Sticky Navbar */}
                <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
                    <Navbar />
                </header>

                {/* 4. Page Content */}
                <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
