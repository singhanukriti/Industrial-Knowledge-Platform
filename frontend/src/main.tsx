import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./index.css";
import AppQueryProvider from "./providers/QueryProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <AppQueryProvider>
            <ThemeProvider>
                <App />
            </ThemeProvider>
        </AppQueryProvider>
    </React.StrictMode>
);
