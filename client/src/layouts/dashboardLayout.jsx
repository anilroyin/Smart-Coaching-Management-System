import {
    NavLink,
    Outlet,
    useNavigate
} from "react-router-dom";

import {
    useEffect,
    useRef,
    useState
} from "react";

import "./dashboardLayout.css";


const API_URL = "http://localhost:3000/api/notifications";


function DashboardLayout() {

    const navigate = useNavigate();
    const notificationRef = useRef(null);

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const role = user?.role;

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] =
        useState(false);
    const [loadingNotifications, setLoadingNotifications] =
        useState(false);


    // =====================================================
    // ADMIN PERMISSION
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
    // NAVIGATION CLASS
    // =====================================================

    const navClass = ({ isActive }) =>
        isActive
            ? "dashboard-nav-link active"
            : "dashboard-nav-link";


    // =====================================================
    // FETCH USER NOTIFICATIONS
    // =====================================================

    const fetchNotifications = async () => {

        try {

            setLoadingNotifications(true);

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/my`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to load notifications"
                );
            }

            setNotifications(
                data.notifications || []
            );

        } catch (error) {

            console.error(
                "NOTIFICATION ERROR:",
                error
            );

        } finally {

            setLoadingNotifications(false);
        }
    };


    // =====================================================
    // LOAD NOTIFICATIONS WHEN USER LOGS IN
    // =====================================================

    useEffect(() => {

        if (role === "super_admin") {
            return;
        }

        fetchNotifications();

    }, [role]);


    // =====================================================
    // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    // =====================================================

    useEffect(() => {

        const handleOutsideClick = (event) => {

            if (
                notificationRef.current &&
                !notificationRef.current.contains(
                    event.target
                )
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

        };

    }, []);


    // =====================================================
    // MARK NOTIFICATIONS AS READ
    // =====================================================

    const markNotificationsAsRead = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/read`,
                {
                    method: "PUT",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to mark notifications as read"
                );
            }

            setNotifications(previous =>
                previous.map(notification => ({
                    ...notification,
                    isRead: true
                }))
            );

        } catch (error) {

            console.error(
                "MARK NOTIFICATIONS READ ERROR:",
                error
            );
        }
    };


    // =====================================================
    // BELL CLICK
    // =====================================================

    const handleNotificationClick = async () => {

        const willOpen = !showNotifications;

        setShowNotifications(willOpen);

        if (!willOpen) {
            return;
        }

        await fetchNotifications();

        await markNotificationsAsRead();
    };


    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatNotificationDate = (date) => {

        if (!date) {
            return "";
        }

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };


    // =====================================================
    // UNREAD COUNT
    // =====================================================

    const unreadCount = notifications.filter(
        notification => !notification.isRead
    ).length;


    return (

        <div className="dashboard-layout">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="dashboard-sidebar">

                <div className="dashboard-sidebar-logo">

                    <h1>
                        SCMS
                    </h1>

                    <p>
                        Smart Coaching
                    </p>

                </div>


                <nav className="dashboard-navigation">

                    <NavLink
                        to="/dashboard"
                        className={navClass}
                    >
                        Dashboard
                    </NavLink>


                    {/* ADMIN / SUPER ADMIN */}

                    {(role === "super_admin" ||
                        role === "admin") && (

                        <>

                            {hasPermission("students") && (

                                <NavLink
                                    to="/students"
                                    className={navClass}
                                >
                                    Students
                                </NavLink>

                            )}


                            {hasPermission("teachers") && (

                                <NavLink
                                    to="/teachers"
                                    className={navClass}
                                >
                                    Teachers
                                </NavLink>

                            )}


                            {role === "super_admin" && (

                                <NavLink
                                    to="/admin/teacher-payments"
                                    className={navClass}
                                >
                                    Teacher Payments
                                </NavLink>

                            )}


                            {hasPermission("studentFees") && (

                                <NavLink
                                    to="/admin/student-fees"
                                    className={navClass}
                                >
                                    Student Fees
                                </NavLink>

                            )}


                            {role === "super_admin" && (

                                <NavLink
                                    to="/notifications/create"
                                    className={navClass}
                                >
                                    Create Notification
                                </NavLink>

                            )}


                            {hasPermission("settings") && (

                                <NavLink
                                    to="/admin/settings"
                                    className={navClass}
                                >
                                    Settings
                                </NavLink>

                            )}

                        </>

                    )}


                    {/* TEACHER */}

                    {role === "teacher" && (

                        <>

                            <NavLink
                                to="/teacher/my-profile"
                                className={navClass}
                            >
                                My Profile
                            </NavLink>

                            <NavLink
                                to="/teacher/my-payments"
                                className={navClass}
                            >
                                My Payments
                            </NavLink>

                        </>

                    )}


                    {/* STUDENT */}

                    {role === "student" && (

                        <>

                            <NavLink
                                to="/student/my-profile"
                                className={navClass}
                            >
                                My Profile
                            </NavLink>

                            <NavLink
                                to="/student/my-fees"
                                className={navClass}
                            >
                                My Fees
                            </NavLink>

                        </>

                    )}

                </nav>


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

                <header className="dashboard-header">

                    <div className="dashboard-header-title">

                        <h2>
                            Smart Coaching Management System
                        </h2>

                    </div>


                    <div className="dashboard-header-user">

                        {/* NOTIFICATIONS */}

                        {role !== "super_admin" && (

                            <div
                                className="dashboard-notification-wrapper"
                                ref={notificationRef}
                            >

                                <button
                                    type="button"
                                    className="dashboard-notification"
                                    aria-label="Notifications"
                                    title="Notifications"
                                    onClick={
                                        handleNotificationClick
                                    }
                                >

                                    <span
                                        className="dashboard-notification-icon"
                                        aria-hidden="true"
                                    >
                                        🔔
                                    </span>


                                    {unreadCount > 0 && (

                                        <span className="notification-count">

                                            {unreadCount > 99
                                                ? "99+"
                                                : unreadCount}

                                        </span>

                                    )}

                                </button>


                                {/* NOTIFICATION DROPDOWN */}

                                {showNotifications && (

                                    <div className="notification-dropdown">

                                        <div className="notification-dropdown-header">

                                            <h3>
                                                Notifications
                                            </h3>

                                            <span>
                                                {notifications.length}
                                            </span>

                                        </div>


                                        {loadingNotifications ? (

                                            <div className="notification-dropdown-empty">
                                                Loading...
                                            </div>

                                        ) : notifications.length === 0 ? (

                                            <div className="notification-dropdown-empty">
                                                No notifications yet.
                                            </div>

                                        ) : (

                                            <div className="notification-dropdown-list">

                                                {notifications
                                                    .slice(0, 10)
                                                    .map(
                                                        notification => (

                                                            <div
                                                                className={
                                                                    notification.isRead
                                                                        ? "notification-dropdown-item"
                                                                        : "notification-dropdown-item unread"
                                                                }
                                                                key={
                                                                    notification._id
                                                                }
                                                            >

                                                                <h4>
                                                                    {
                                                                        notification.title
                                                                    }
                                                                </h4>

                                                                <p>
                                                                    {
                                                                        notification.message
                                                                    }
                                                                </p>

                                                                <small>
                                                                    {
                                                                        formatNotificationDate(
                                                                            notification.createdAt
                                                                        )
                                                                    }
                                                                </small>

                                                            </div>

                                                        )
                                                    )}

                                            </div>

                                        )}

                                    </div>

                                )}

                            </div>

                        )}


                        <span className="dashboard-user-name">

                            {user?.name || "User"}

                        </span>

                    </div>

                </header>


                {/* PAGE CONTENT */}

                <main className="dashboard-content">

                    <Outlet />

                </main>

            </div>

        </div>

    );
}


export default DashboardLayout;