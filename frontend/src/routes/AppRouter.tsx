import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import DashboardPage  from "@/pages/Dashboard/DashboardPage";
import UploadPage     from "@/pages/Upload/UploadPage";
import DocumentsPage  from "@/pages/Documents/DocumentsPage";
import ChatPage       from "@/pages/Chat/ChatPage";
import SearchPage     from "@/pages/Search/SearchPage";
import AnalyticsPage  from "@/pages/Analytics/AnalyticsPage";
import SettingsPage   from "@/pages/Settings/SettingsPage";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/"          element={<DashboardPage />}  />
                    <Route path="/documents" element={<DocumentsPage />}  />
                    <Route path="/upload"    element={<UploadPage />}     />
                    <Route path="/chat"      element={<ChatPage />}       />
                    <Route path="/search"    element={<SearchPage />}     />
                    <Route path="/analytics" element={<AnalyticsPage />}  />
                    <Route path="/settings"  element={<SettingsPage />}   />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
