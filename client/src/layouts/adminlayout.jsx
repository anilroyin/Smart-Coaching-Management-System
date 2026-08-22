import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./adminlayout.css";

function AdminLayout() {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const isSuperAdmin = user?.role === "super_admin";
    const permissions = user?.permissions || {};

    const hasPermission = (permission) => {
        return isSuperAdmin || permissions[permission] === true;
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };

    return (
        <div className="admin-layout">

            {/* Sidebar */}
            <aside className="sidebar">

                <div className="sidebar-header">
                    <h2>SCMS</h2>
                    <p>Smart Coaching</p>
                </div>

                <nav className="sidebar-nav">

                    {/* Dashboard - everyone can access */}
                    <NavLink to="/dashboard">
                        Dashboard
                    </NavLink>

                    {/* Students */}
                    {hasPermission("students") && (
                        <NavLink to="/students">
                            Students
                        </NavLink>
                    )}

                    {/* Teachers */}
                    {hasPermission("teachers") && (
                        <NavLink to="/teachers">
                            Teachers
                        </NavLink>
                    )}

                    {/* Courses */}
                    {hasPermission("courses") && (
                        <NavLink to="/courses">
                            Courses
                        </NavLink>
                    )}

                    {/* Teaching Schedule */}
                    {hasPermission("teachingSlots") && (
                        <NavLink to="/teaching-schedule">
                            Teaching Schedule
                        </NavLink>
                    )}

                    {/* Enrollments */}
                    {hasPermission("enrollments") && (
                        <NavLink to="/enrollments">
                            Enrollments
                        </NavLink>
                    )}

                    {/* Fees */}
                    {hasPermission("fees") && (
                        <NavLink to="/fees">
                            Fees
                        </NavLink>
                    )}

                    {/* Settings */}
                    {hasPermission("settings") && (
                        <NavLink to="/settings">
                            Settings
                        </NavLink>
                    )}

                </nav>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </aside>

            {/* Main Area */}
            <div className="admin-main">

                {/* Topbar */}
                <header className="topbar">

                    <div>
                        <h3>Smart Coaching Management System</h3>
                    </div>

                    <div className="admin-user">
                        <span>
                            {user?.name || "Admin"}
                        </span>
                    </div>

                </header>

                {/* Page Content */}
                <main className="page-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default AdminLayout;