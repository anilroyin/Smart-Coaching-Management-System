import {
    NavLink,
    Outlet,
    useNavigate
} from "react-router-dom";

import "./dashboardLayout.css";


function DashboardLayout() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );


    // =====================================================
    // USER ROLE
    // =====================================================

    const role = user?.role;


    // =====================================================
    // ADMIN PERMISSION
    //
    // Super Admin gets full access.
    //
    // Admin permissions are stored as an object:
    //
    // permissions: {
    //     students: true,
    //     teachers: true,
    //     teacherPayments: true,
    //     studentFees: true,
    //     settings: false,
    //     ...
    // }
    // =====================================================

    const hasPermission = (permission) => {

        if (role === "super_admin") {
            return true;
        }

        if (role !== "admin") {
            return false;
        }

        return user?.permissions?.[permission] === true;
    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };


    // =====================================================
    // NAV LINK CLASS
    // =====================================================

    const navClass = ({ isActive }) =>
        isActive
            ? "dashboard-nav-link active"
            : "dashboard-nav-link";


    return (

        <div className="dashboard-layout">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="dashboard-sidebar">


                {/* =================================================
                    LOGO
                ================================================= */}

                <div className="dashboard-sidebar-logo">

                    <h1>
                        SCMS
                    </h1>

                    <p>
                        Smart Coaching
                    </p>

                </div>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <nav className="dashboard-navigation">


                    {/* =================================================
                        DASHBOARD
                        
                        Available to every role.
                    ================================================= */}

                    <NavLink
                        to="/dashboard"
                        className={navClass}
                    >
                        Dashboard
                    </NavLink>


                    {/* =================================================
                        ADMIN / SUPER ADMIN
                    ================================================= */}

                    {(role === "super_admin" ||
                        role === "admin") && (

                        <>


                            {/* =================================================
                                STUDENTS
                            ================================================= */}

                            {hasPermission("students") && (

                                <NavLink
                                    to="/students"
                                    className={navClass}
                                >
                                    Students
                                </NavLink>

                            )}


                            {/* =================================================
                                TEACHERS
                            ================================================= */}

                            {hasPermission("teachers") && (

                                <NavLink
                                    to="/teachers"
                                    className={navClass}
                                >
                                    Teachers
                                </NavLink>

                            )}


                            {/* =================================================
                                TEACHER PAYMENTS
                                
                                Admin/Super Admin:
                                Manage teacher payments.
                            ================================================= */}

                            {hasPermission(
                                "teacherPayments"
                            ) && (

                                <NavLink
                                    to="/teacher-payments"
                                    className={navClass}
                                >
                                    Teacher Payments
                                </NavLink>

                            )}


                            {/* =================================================
                                STUDENT FEES
                                
                                Admin/Super Admin:
                                Manage student fees.
                            ================================================= */}

                            {hasPermission(
                                "studentFees"
                            ) && (

                                <NavLink
                                    to="/student-fees"
                                    className={navClass}
                                >
                                    Student Fees
                                </NavLink>

                            )}


                            {/* =================================================
                                CREATE NOTIFICATION
                                
                                Super Admin only.
                                
                                This is deliberately NOT controlled
                                by the normal Admin permission system.
                            ================================================= */}

                            {role === "super_admin" && (

                                <NavLink
                                    to="/notifications/create"
                                    className={navClass}
                                >
                                    Create Notification
                                </NavLink>

                            )}


                            {/* =================================================
                                SETTINGS
                            ================================================= */}

                            {hasPermission(
                                "settings"
                            ) && (

                                <NavLink
                                    to="/settings"
                                    className={navClass}
                                >
                                    Settings
                                </NavLink>

                            )}

                        </>

                    )}


                    {/* =================================================
                        TEACHER
                    ================================================= */}

                    {role === "teacher" && (

                        <>

                            {/* My Profile */}

                            <NavLink
                                to="/profile"
                                className={navClass}
                            >
                                My Profile
                            </NavLink>


                            {/* Own Payments */}

                            <NavLink
                                to="/teacher-payments"
                                className={navClass}
                            >
                                Payments
                            </NavLink>

                        </>

                    )}


                    {/* =================================================
                        STUDENT
                    ================================================= */}

                    {role === "student" && (

                        <>

                            {/* My Profile */}

                            <NavLink
                                to="/profile"
                                className={navClass}
                            >
                                My Profile
                            </NavLink>


                            {/* Own Fees */}

                            <NavLink
                                to="/student-fees"
                                className={navClass}
                            >
                                Fees
                            </NavLink>

                        </>

                    )}

                </nav>


                {/* =================================================
                    LOGOUT
                ================================================= */}

                <button
                    type="button"
                    className="dashboard-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </aside>


            {/* =================================================
                MAIN AREA
            ================================================= */}

            <div className="dashboard-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="dashboard-header">


                    {/* System title */}

                    <div className="dashboard-header-title">

                        <h2>
                            Smart Coaching Management System
                        </h2>

                    </div>


                    {/* User area */}

                    <div className="dashboard-header-user">


                        {/* =================================================
                            NOTIFICATION BELL
                            
                            Super Admin creates notifications,
                            so Super Admin does not receive
                            the normal notification bell.
                            
                            Admin / Teacher / Student receive it.
                        ================================================= */}

                        {role !== "super_admin" && (

                            <button
                                type="button"
                                className="dashboard-notification"
                                aria-label="Notifications"
                                title="Notifications"
                            >

                                <span
                                    className="dashboard-notification-icon"
                                    aria-hidden="true"
                                >
                                    🔔
                                </span>

                            </button>

                        )}


                        {/* =================================================
                            USER NAME
                        ================================================= */}

                        <span className="dashboard-user-name">

                            {user?.name || "User"}

                        </span>

                    </div>

                </header>


                {/* =================================================
                    PAGE CONTENT
                ================================================= */}

                <main className="dashboard-content">

                    <Outlet />

                </main>

            </div>

        </div>

    );
}


export default DashboardLayout;