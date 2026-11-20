import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Content from "./components/Content";
import Footer from "./components/Footer";

export default function MainLayout() {
    return (
        <div className="flex h-screen flex-col">
            <Topbar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Content>
                        <Outlet />
                    </Content>
                    <Footer />
                </div>
            </div>
        </div>
    );
}
