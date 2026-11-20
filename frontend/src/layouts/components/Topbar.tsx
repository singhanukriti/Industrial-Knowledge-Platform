import { Search, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export default function Topbar() {
    const { resolvedTheme, toggle } = useTheme();

    return (
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
            <span className="text-base font-semibold tracking-tight">
                Industrial Knowledge Platform
            </span>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" aria-label="Search">
                    <Search className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Toggle dark mode"
                    onClick={toggle}
                >
                    {resolvedTheme === "dark"
                        ? <Sun className="size-4" />
                        : <Moon className="size-4" />}
                </Button>
                <Button variant="ghost" size="icon" aria-label="User menu">
                    <User className="size-4" />
                </Button>
            </div>
        </header>
    );
}
