import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
    ThemeContext,
    THEME_STORAGE_KEY,
    type Theme,
} from "./theme-context";

function getInitialTheme(): Theme {
    if (typeof window === "undefined") return "system";
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
    return "system";
}

function systemPrefersDark(): boolean {
    return typeof window !== "undefined"
        && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme: Theme) {
    const isDark = theme === "dark" || (theme === "system" && systemPrefersDark());
    document.documentElement.classList.toggle("dark", isDark);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        applyTheme(theme);

        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => {
            if (theme === "system") applyTheme("system");
        };
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, [theme]);

    const setTheme = useCallback((next: Theme) => {
        setThemeState(next);
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
            // ignore storage failures (e.g. private mode)
        }
    }, []);

    const toggle = useCallback(() => {
        setThemeState((prev) => {
            const isDark = prev === "dark" || (prev === "system" && systemPrefersDark());
            const next: Theme = isDark ? "light" : "dark";
            try {
                window.localStorage.setItem(THEME_STORAGE_KEY, next);
            } catch {
                // ignore
            }
            return next;
        });
    }, []);

    return (
        <ThemeContext.Provider value={{
            theme,
            resolvedTheme: theme === "dark" || (theme === "system" && systemPrefersDark())
                ? "dark"
                : "light",
            setTheme,
            toggle,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}
