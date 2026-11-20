import { useNavigate } from "react-router-dom";
import { Upload, MessageSquare, Search, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
    { title: "Upload PDF", icon: Upload,       path: "/upload"    },
    { title: "AI Chat",    icon: MessageSquare, path: "/chat"      },
    { title: "Search",     icon: Search,        path: "/search"    },
    { title: "Analytics",  icon: BarChart3,     path: "/analytics" },
];

export default function QuickActions() {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Button
                            key={action.title}
                            variant="outline"
                            className="h-24 rounded-2xl justify-start gap-4 text-lg"
                            onClick={() => navigate(action.path)}
                        >
                            <Icon size={28} />
                            {action.title}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
