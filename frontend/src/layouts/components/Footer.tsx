export default function Footer() {
    return (
        <footer className="border-t border-border bg-card px-6 py-3 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Industrial Knowledge Platform
        </footer>
    );
}
