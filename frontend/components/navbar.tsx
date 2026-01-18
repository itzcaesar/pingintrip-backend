import { MobileSidebar } from "@/components/mobile-sidebar";

export const Navbar = () => {
    return (
        <div className="flex items-center p-4 md:hidden border-b bg-background shadow-sm">
            <MobileSidebar />
            <div className="ml-auto flex items-center gap-x-2">
                <span className="text-sm font-semibold text-foreground">Pingintrip Dashboard</span>
            </div>
        </div>
    );
}

// Note: On desktop, the sidebar is fixed left, so we might want a top-right User Navbar?
// For now, I only show this on mobile (md:hidden) to handle the Menu trigger.
// Desktops usually have Sidebar for nav.
