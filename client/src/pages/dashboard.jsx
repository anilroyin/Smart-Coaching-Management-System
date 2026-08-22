import { useEffect, useState } from "react";
import "./dashboard.css";

function Dashboard() {
    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const token = localStorage.getItem("token");

    const isSuperAdmin = user?.role === "super_admin";
    const permissions = user?.permissions || {};

    const hasPermission = (permission) => {
        return (
            isSuperAdmin ||
            permissions[permission] === true
        );
    };


    // ========================================
    // FORMAT TIME
    // Converts 17:30 → 5:30 PM
    // ========================================

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

        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Kolkata"
            }
        );
    };


    // ========================================
    // DASHBOARD STATE
    // ========================================

    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        courses: 0,
        enrollments: 0
    });

    const [todaySchedule, setTodaySchedule] = useState([]);

    const [loading, setLoading] = useState(true);
    const [scheduleLoading, setScheduleLoading] = useState(true);


    // ========================================
    // GET COUNT FROM API RESPONSE
    // ========================================

    const getCount = (data, type) => {
        if (typeof data.count === "number") {
            return data.count;
        }

        if (Array.isArray(data[type])) {
            return data[type].length;
        }

        return 0;
    };


    // ========================================
    // LOAD DASHBOARD STATISTICS
    // ========================================

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const requests = [];


                // Students
                if (hasPermission("students")) {
                    requests.push(
                        fetch(
                            "http://localhost:3000/api/students",
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        ).then(async (response) => ({
                            type: "students",
                            data: await response.json()
                        }))
                    );
                }


                // Teachers
                if (hasPermission("teachers")) {
                    requests.push(
                        fetch(
                            "http://localhost:3000/api/teachers",
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        ).then(async (response) => ({
                            type: "teachers",
                            data: await response.json()
                        }))
                    );
                }


                // Courses
                if (hasPermission("courses")) {
                    requests.push(
                        fetch(
                            "http://localhost:3000/api/courses",
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        ).then(async (response) => ({
                            type: "courses",
                            data: await response.json()
                        }))
                    );
                }


                // Enrollments
                if (hasPermission("enrollments")) {
                    requests.push(
                        fetch(
                            "http://localhost:3000/api/enrollments",
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        ).then(async (response) => ({
                            type: "enrollments",
                            data: await response.json()
                        }))
                    );
                }


                const results = await Promise.all(
                    requests
                );


                const newStats = {
                    students: 0,
                    teachers: 0,
                    courses: 0,
                    enrollments: 0
                };


                results.forEach((result) => {
                    newStats[result.type] =
                        getCount(
                            result.data,
                            result.type
                        );
                });


                setStats(newStats);

            } catch (error) {
                console.error(
                    "Failed to load dashboard data:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };


        fetchDashboardData();

    }, []);


    // ========================================
    // LOAD TODAY'S TEACHING SCHEDULE
    // ========================================

    useEffect(() => {
        const fetchTodaySchedule = async () => {

            if (!hasPermission("teachingSlots")) {
                setScheduleLoading(false);
                return;
            }


            try {
                const response = await fetch(
                    "http://localhost:3000/api/teaching-slots",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );


                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch teaching schedule"
                    );
                }


                const data = await response.json();


                // Current day in Indian time
                const today =
                    new Date().toLocaleDateString(
                        "en-IN",
                        {
                            weekday: "long",
                            timeZone: "Asia/Kolkata"
                        }
                    );


                // Get today's active slots
                const todaySlots =
                    (data.teachingSlots || [])
                        .filter(
                            (slot) =>
                                slot.dayOfWeek === today &&
                                slot.status === "active"
                        )
                        .sort((a, b) =>
                            a.startTime.localeCompare(
                                b.startTime
                            )
                        );


                setTodaySchedule(todaySlots);

            } catch (error) {
                console.error(
                    "Failed to load today's schedule:",
                    error
                );
            } finally {
                setScheduleLoading(false);
            }
        };


        fetchTodaySchedule();

    }, []);


    // ========================================
    // RENDER
    // ========================================

    return (
        <div className="dashboard">


            {/* ========================================
                DASHBOARD HEADER
            ======================================== */}

            <div className="dashboard-header">

                <div>

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

            </div>


            {/* ========================================
                STATISTICS
            ======================================== */}

            <div className="dashboard-stats">


                {hasPermission("students") && (
                    <div className="stat-card">

                        <div className="stat-card-label">
                            Students
                        </div>

                        <div className="stat-card-value">
                            {loading
                                ? "—"
                                : stats.students}
                        </div>

                    </div>
                )}


                {hasPermission("teachers") && (
                    <div className="stat-card">

                        <div className="stat-card-label">
                            Teachers
                        </div>

                        <div className="stat-card-value">
                            {loading
                                ? "—"
                                : stats.teachers}
                        </div>

                    </div>
                )}


                {hasPermission("courses") && (
                    <div className="stat-card">

                        <div className="stat-card-label">
                            Courses
                        </div>

                        <div className="stat-card-value">
                            {loading
                                ? "—"
                                : stats.courses}
                        </div>

                    </div>
                )}


                {hasPermission("enrollments") && (
                    <div className="stat-card">

                        <div className="stat-card-label">
                            Enrollments
                        </div>

                        <div className="stat-card-value">
                            {loading
                                ? "—"
                                : stats.enrollments}
                        </div>

                    </div>
                )}

            </div>


            {/* ========================================
                DASHBOARD SECTIONS
            ======================================== */}

            <div className="dashboard-grid">


                {/* ========================================
                    TODAY'S SCHEDULE
                ======================================== */}

                {hasPermission("teachingSlots") && (

                    <section className="dashboard-section">


                        <div className="section-header">

                            <h2>
                                Today's Schedule
                            </h2>

                            <span>
                                {new Date().toLocaleDateString(
                                    "en-IN",
                                    {
                                        weekday: "long",
                                        timeZone: "Asia/Kolkata"
                                    }
                                )}
                            </span>

                        </div>


                        {scheduleLoading ? (

                            <div className="empty-state">

                                <p>
                                    Loading schedule...
                                </p>

                            </div>

                        ) : todaySchedule.length === 0 ? (

                            <div className="empty-state">

                                <p>
                                    No classes scheduled
                                    for today.
                                </p>

                            </div>

                        ) : (

                          <div className="schedule-list">

    {/* ========================================
        SCHEDULE COLUMN HEADERS
    ======================================== */}

    <div className="schedule-header">

        <span>Time</span>

        <span>Subject</span>

        <span>Class</span>

        <span>Teacher</span>

        <span>Students</span>

    </div>


    {/* ========================================
        SCHEDULE ROWS
    ======================================== */}

    {todaySchedule.map(
        (slot) => (

            <div
                className="schedule-item"
                key={slot._id}
            >

                {/* TIME */}

                <div className="schedule-time">

                    <strong>
                        {formatTime(
                            slot.startTime
                        )}
                    </strong>

                </div>


                {/* SUBJECT */}

                <div className="schedule-subject">

                    <strong>
                        {
                            slot.course
                                ?.name ||
                            "N/A"
                        }
                    </strong>

                </div>


                {/* CLASS */}

                <div className="schedule-class">

                    <strong>
                        {
                            slot.className ||
                            "N/A"
                        }
                    </strong>

                </div>


                {/* TEACHER */}

                <div className="schedule-teacher">

                    <strong>
                        {
                            slot.teacher
                                ?.user
                                ?.name ||
                            "N/A"
                        }
                    </strong>

                </div>


                {/* STUDENTS */}

                <div className="schedule-capacity">

                    <strong>
                        {
                            slot.enrolledStudents ??
                            0
                        }
                        {" / "}
                        {
                            slot.maxStudents
                        }
                    </strong>

                </div>

            </div>

        )
    )}

</div>

                        )}

                    </section>

                )}


                {/* ========================================
                    RECENT ACTIVITY
                ======================================== */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <h2>
                            Recent Activity
                        </h2>

                        <span>
                            Coming soon
                        </span>

                    </div>

                    <div className="empty-state">

                        <p>
                            Recent SCMS activity
                            will appear here.
                        </p>

                    </div>

                </section>

            </div>

        </div>
    );
}

export default Dashboard;