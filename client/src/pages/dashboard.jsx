import { useEffect, useMemo, useState } from "react";
import "./dashboard.css";

const API = "http://localhost:3000/api";


// =====================================================
// HELPERS
// =====================================================

const getUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
};


const getToken = () => {
    return localStorage.getItem("token");
};


const fetchData = async (url, token) => {

    const response = await fetch(`${API}${url}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch data"
        );
    }

    return data;
};


const getToday = () => {
    return new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        timeZone: "Asia/Kolkata"
    });
};


const formatTime = (time) => {

    if (!time) {
        return "N/A";
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(
        Number(hours),
        Number(minutes),
        0,
        0
    );

    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
};


const getCount = (data, key) => {

    if (typeof data?.count === "number") {
        return data.count;
    }

    if (Array.isArray(data?.[key])) {
        return data[key].length;
    }

    return 0;
};


// =====================================================
// STAT CARD
// =====================================================

function StatCard({ label, value }) {

    return (
        <div className="stat-card">

            <div className="stat-card-label">
                {label}
            </div>

            <div className="stat-card-value">
                {value}
            </div>

        </div>
    );
}


// =====================================================
// EMPTY STATE
// =====================================================

function EmptyState({ message }) {

    return (
        <div className="empty-state">
            <p>
                {message}
            </p>
        </div>
    );
}


// =====================================================
// SCHEDULE TABLE
// =====================================================

function ScheduleTable({
    slots,
    columns,
    emptyMessage
}) {

    if (!slots.length) {
        return (
            <EmptyState
                message={
                    emptyMessage ||
                    "No classes scheduled."
                }
            />
        );
    }


    return (

        <div className="schedule-list">

            {/* Header */}

            <div
                className="schedule-header"
                style={{
                    gridTemplateColumns:
                        columns.grid
                }}
            >

                {columns.headers.map(
                    (header) => (
                        <span key={header}>
                            {header}
                        </span>
                    )
                )}

            </div>


            {/* Rows */}

            {slots.map((slot) => (

                <div
                    className="schedule-item"
                    style={{
                        gridTemplateColumns:
                            columns.grid
                    }}
                    key={slot._id}
                >

                    {columns.render(slot)}

                </div>

            ))}

        </div>
    );
}


// =====================================================
// DASHBOARD
// =====================================================

function Dashboard() {

    const user = getUser();
    const token = getToken();

    const role = user?.role;


    const isSuperAdmin =
        role === "super_admin";

    const isAdmin =
        role === "admin";

    const isTeacher =
        role === "teacher";

    const isStudent =
        role === "student";


    // =================================================
    // PERMISSIONS
    //
    // Permissions are stored as an object:
    //
    // {
    //     students: true,
    //     teachers: true,
    //     courses: false,
    //     teachingSlots: true
    // }
    //
    // =================================================

    const hasPermission = (permission) => {

        if (isSuperAdmin) {
            return true;
        }

        if (!isAdmin) {
            return false;
        }

        return user?.permissions?.[permission] === true;
    };


    // =================================================
    // ADMIN STATE
    // =================================================

    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        courses: 0,
        enrollments: 0
    });

    const [adminLoading, setAdminLoading] =
        useState(false);


    const [todaySchedule, setTodaySchedule] =
        useState([]);

    const [scheduleLoading, setScheduleLoading] =
        useState(false);


    // =================================================
    // TEACHER STATE
    // =================================================

    const [teacherSlots, setTeacherSlots] =
        useState([]);

    const [teacherLoading, setTeacherLoading] =
        useState(false);

    const [teacherError, setTeacherError] =
        useState("");


    // =================================================
    // ADMIN / SUPER ADMIN DATA
    // =================================================

    useEffect(() => {

        if (!isAdmin && !isSuperAdmin) {
            return;
        }


        const loadAdminData = async () => {

            setAdminLoading(true);

            try {

                const resources = [
                    {
                        key: "students",
                        url: "/students"
                    },
                    {
                        key: "teachers",
                        url: "/teachers"
                    },
                    {
                        key: "courses",
                        url: "/courses"
                    },
                    {
                        key: "enrollments",
                        url: "/enrollments"
                    }
                ];


                const permittedResources =
                    resources.filter(
                        ({ key }) =>
                            hasPermission(key)
                    );


                const results =
                    await Promise.all(
                        permittedResources.map(
                            async ({ key, url }) => {

                                try {

                                    const data =
                                        await fetchData(
                                            url,
                                            token
                                        );

                                    return {
                                        key,
                                        data
                                    };

                                } catch (error) {

                                    console.error(
                                        `Failed to load ${key}:`,
                                        error
                                    );

                                    return {
                                        key,
                                        data: null
                                    };
                                }
                            }
                        )
                    );


                const newStats = {
                    students: 0,
                    teachers: 0,
                    courses: 0,
                    enrollments: 0
                };


                results.forEach(
                    ({ key, data }) => {

                        newStats[key] =
                            getCount(
                                data,
                                key
                            );
                    }
                );


                setStats(newStats);

            } catch (error) {

                console.error(
                    "ADMIN DASHBOARD ERROR:",
                    error
                );

            } finally {

                setAdminLoading(false);
            }
        };


        loadAdminData();

    }, [isAdmin, isSuperAdmin, token]);


    // =================================================
    // ADMIN / SUPER ADMIN TODAY'S SCHEDULE
    // =================================================

    useEffect(() => {

        if (!isAdmin && !isSuperAdmin) {
            return;
        }


        if (!hasPermission("teachingSlots")) {
            return;
        }


        const loadSchedule = async () => {

            setScheduleLoading(true);

            try {

                const data =
                    await fetchData(
                        "/teaching-slots",
                        token
                    );


                const today = getToday();


                const slots =
                    (data.teachingSlots || [])
                        .filter(
                            (slot) =>
                                slot.dayOfWeek ===
                                    today &&
                                slot.status ===
                                    "active"
                        )
                        .sort(
                            (a, b) =>
                                a.startTime.localeCompare(
                                    b.startTime
                                )
                        );


                setTodaySchedule(slots);

            } catch (error) {

                console.error(
                    "ADMIN SCHEDULE ERROR:",
                    error
                );

            } finally {

                setScheduleLoading(false);
            }
        };


        loadSchedule();

    }, [isAdmin, isSuperAdmin, token]);


    // =================================================
    // TEACHER DATA
    // =================================================

    useEffect(() => {

        if (!isTeacher) {
            return;
        }


        const loadTeacherData = async () => {

            setTeacherLoading(true);
            setTeacherError("");


            try {

                const data =
                    await fetchData(
                        "/teaching-slots/me",
                        token
                    );


                setTeacherSlots(
                    data.teachingSlots || []
                );

            } catch (error) {

                console.error(
                    "TEACHER DASHBOARD ERROR:",
                    error
                );

                setTeacherError(
                    error.message
                );

            } finally {

                setTeacherLoading(false);
            }
        };


        loadTeacherData();

    }, [isTeacher, token]);


    // =================================================
    // TEACHER TODAY'S CLASSES
    // =================================================

    const teacherTodaySchedule =
        useMemo(() => {

            const today = getToday();

            return teacherSlots
                .filter(
                    (slot) =>
                        slot.dayOfWeek ===
                            today &&
                        slot.status ===
                            "active"
                )
                .sort(
                    (a, b) =>
                        a.startTime.localeCompare(
                            b.startTime
                        )
                );

        }, [teacherSlots]);


    // =================================================
    // TEACHER TODAY COLUMNS
    // =================================================

    const teacherTodayColumns = {

        grid:
            "68px minmax(100px, 1fr) 60px 110px",

        headers: [
            "Time",
            "Subject",
            "Class",
            "Students"
        ],

        render: (slot) => (

            <>

                <div className="schedule-time">
                    <strong>
                        {formatTime(
                            slot.startTime
                        )}
                    </strong>
                </div>


                <div className="schedule-subject">
                    <strong>
                        {slot.course?.name ||
                            "N/A"}
                    </strong>
                </div>


                <div className="schedule-class">
                    <strong>
                        {slot.className ||
                            "N/A"}
                    </strong>
                </div>


                <div className="schedule-capacity">
                    <strong>
                        {slot.enrolledStudents ??
                            0}
                        {" / "}
                        {slot.maxStudents}
                    </strong>
                </div>

            </>

        )
    };


    // =================================================
    // TEACHER WEEKLY COLUMNS
    // =================================================

    const teacherWeeklyColumns = {

        grid:
            "85px minmax(100px, 1fr) 60px 130px",

        headers: [
            "Day",
            "Subject",
            "Class",
            "Time"
        ],

        render: (slot) => (

            <>

                <div className="schedule-time">
                    <strong>
                        {slot.dayOfWeek ||
                            "N/A"}
                    </strong>
                </div>


                <div className="schedule-subject">
                    <strong>
                        {slot.course?.name ||
                            "N/A"}
                    </strong>
                </div>


                <div className="schedule-class">
                    <strong>
                        {slot.className ||
                            "N/A"}
                    </strong>
                </div>


                <div className="schedule-capacity">
                    <strong>
                        {formatTime(
                            slot.startTime
                        )}
                        {" - "}
                        {formatTime(
                            slot.endTime
                        )}
                    </strong>
                </div>

            </>

        )
    };


    // =================================================
    // ADMIN SCHEDULE COLUMNS
    // =================================================

    const adminColumns = {

        grid:
            "68px minmax(100px, 1fr) 45px 90px 55px",

        headers: [
            "Time",
            "Subject",
            "Class",
            "Teacher",
            "Students"
        ],

        render: (slot) => (

            <>

                <div className="schedule-time">
                    <strong>
                        {formatTime(
                            slot.startTime
                        )}
                    </strong>
                </div>


                <div className="schedule-subject">
                    <strong>
                        {slot.course?.name ||
                            "N/A"}
                    </strong>
                </div>


                <div className="schedule-class">
                    <strong>
                        {slot.className ||
                            "N/A"}
                    </strong>
                </div>


                <div className="schedule-teacher">
                    <strong>
                        {slot.teacher?.user?.name ||
                            "N/A"}
                    </strong>
                </div>


                <div className="schedule-capacity">
                    <strong>
                        {slot.enrolledStudents ??
                            0}
                        {" / "}
                        {slot.maxStudents}
                    </strong>
                </div>

            </>

        )
    };


    // =================================================
    // TEACHER DASHBOARD
    // =================================================

    if (isTeacher) {

        return (

            <div className="dashboard">

                <div className="dashboard-header">

                    <h1>
                        Teacher Dashboard
                    </h1>

                    <p>
                        Welcome back,{" "}
                        <strong>
                            {user?.name ||
                                "Teacher"}
                        </strong>
                    </p>

                </div>


                {/* Statistics */}

                <div className="dashboard-stats">

                    <StatCard
                        label="My Classes"
                        value={
                            teacherLoading
                                ? "—"
                                : teacherSlots.length
                        }
                    />

                    <StatCard
                        label="Today's Classes"
                        value={
                            teacherLoading
                                ? "—"
                                : teacherTodaySchedule.length
                        }
                    />

                </div>


                {/* Content */}

                <div className="dashboard-grid">


                    {/* Today's Classes */}

                    <section className="dashboard-section">

                        <div className="section-header">

                            <h2>
                                Today's Classes
                            </h2>

                            <span>
                                {getToday()}
                            </span>

                        </div>


                        {teacherLoading ? (

                            <EmptyState
                                message="Loading schedule..."
                            />

                        ) : teacherError ? (

                            <EmptyState
                                message={teacherError}
                            />

                        ) : (

                            <ScheduleTable
                                slots={
                                    teacherTodaySchedule
                                }
                                columns={
                                    teacherTodayColumns
                                }
                                emptyMessage={
                                    "No classes scheduled for today."
                                }
                            />

                        )}

                    </section>


                    {/* Weekly Schedule */}

                    <section className="dashboard-section">

                        <div className="section-header">

                            <h2>
                                My Teaching Schedule
                            </h2>

                            <span>
                                {teacherSlots.length}{" "}
                                {teacherSlots.length === 1
                                    ? "class"
                                    : "classes"}
                            </span>

                        </div>


                        {teacherLoading ? (

                            <EmptyState
                                message="Loading schedule..."
                            />

                        ) : (

                            <ScheduleTable
                                slots={
                                    teacherSlots
                                }
                                columns={
                                    teacherWeeklyColumns
                                }
                                emptyMessage={
                                    "No teaching slots assigned."
                                }
                            />

                        )}

                    </section>

                </div>

            </div>
        );
    }


    // =================================================
    // STUDENT DASHBOARD
    // =================================================

    if (isStudent) {

        return (

            <div className="dashboard">

                <div className="dashboard-header">

                    <h1>
                        Student Dashboard
                    </h1>

                    <p>
                        Welcome back,{" "}
                        <strong>
                            {user?.name ||
                                "Student"}
                        </strong>
                    </p>

                </div>


                <div className="dashboard-stats">

                    <StatCard
                        label="My Classes"
                        value="—"
                    />

                    <StatCard
                        label="Today's Classes"
                        value="—"
                    />

                    <StatCard
                        label="Fee Status"
                        value="—"
                    />

                </div>


                <div className="dashboard-grid">


                    <section className="dashboard-section">

                        <div className="section-header">

                            <h2>
                                My Classes
                            </h2>

                        </div>

                        <EmptyState
                            message={
                                "Your enrolled classes will appear here."
                            }
                        />

                    </section>


                    <section className="dashboard-section">

                        <div className="section-header">

                            <h2>
                                Today's Classes
                            </h2>

                        </div>

                        <EmptyState
                            message={
                                "Your class schedule will appear here."
                            }
                        />

                    </section>

                </div>

            </div>
        );
    }


    // =================================================
    // ADMIN / SUPER ADMIN DASHBOARD
    // =================================================

    return (

        <div className="dashboard">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="dashboard-header">

                <h1>
                    SCMS Dashboard
                </h1>

                <p>
                    Welcome back,{" "}
                    <strong>
                        {user?.name || "Admin"}
                    </strong>
                </p>

            </div>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="dashboard-stats">


                {hasPermission("students") && (

                    <StatCard
                        label="Students"
                        value={
                            adminLoading
                                ? "—"
                                : stats.students
                        }
                    />

                )}


                {hasPermission("teachers") && (

                    <StatCard
                        label="Teachers"
                        value={
                            adminLoading
                                ? "—"
                                : stats.teachers
                        }
                    />

                )}


                {hasPermission("courses") && (

                    <StatCard
                        label="Courses"
                        value={
                            adminLoading
                                ? "—"
                                : stats.courses
                        }
                    />

                )}


                {hasPermission("enrollments") && (

                    <StatCard
                        label="Enrollments"
                        value={
                            adminLoading
                                ? "—"
                                : stats.enrollments
                        }
                    />

                )}

            </div>


            {/* =================================================
                DASHBOARD CONTENT
            ================================================= */}

            <div className="dashboard-grid">


                {/* Today's Schedule */}

                {hasPermission("teachingSlots") && (

                    <section className="dashboard-section">

                        <div className="section-header">

                            <h2>
                                Today's Schedule
                            </h2>

                            <span>
                                {getToday()}
                            </span>

                        </div>


                        {scheduleLoading ? (

                            <EmptyState
                                message="Loading schedule..."
                            />

                        ) : (

                            <ScheduleTable
                                slots={
                                    todaySchedule
                                }
                                columns={
                                    adminColumns
                                }
                                emptyMessage={
                                    "No classes scheduled for today."
                                }
                            />

                        )}

                    </section>

                )}


                {/* Recent Activity */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <h2>
                            Recent Activity
                        </h2>

                        <span>
                            Coming soon
                        </span>

                    </div>


                    <EmptyState
                        message={
                            "Recent SCMS activity will appear here."
                        }
                    />

                </section>

            </div>

        </div>
    );
}


export default Dashboard;