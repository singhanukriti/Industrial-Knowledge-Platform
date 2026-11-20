import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    FileText,
    Upload,
    MessageSquare,
    Search,
    BarChart2,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { to: "/",          label: "Dashboard", icon: LayoutDashboard },
    { to: "/documents", label: "Documents",  icon: FileText       },
    { to: "/upload",    label: "Upload",     icon: Upload         },
    { to: "/chat",      label: "AI Chat",    icon: MessageSquare  },
    { to: "/search",    label: "Search",     icon: Search         },
    { to: "/analytics", label: "Analytics",  icon: BarChart2      },
    { to: "/settings",  label: "Settings",   icon: Settings       },
];

export default function Sidebar() {
    return (
        <aside className="flex h-screen w-56 flex-col border-r border-border bg-card px-3 py-6">
            <p className="mb-6 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Navigation
            </p>
            <nav className="flex flex-col gap-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === "/"}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )
                        }
                    >
                        <Icon className="size-4 shrink-0" />
                        {label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
