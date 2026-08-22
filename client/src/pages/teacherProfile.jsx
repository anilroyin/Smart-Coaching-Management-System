import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./teacherProfile.css";


function TeacherProfile() {

    const { id } = useParams();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");


    // =====================================================
    // TEACHER
    // =====================================================

    const [teacher, setTeacher] = useState(null);


    // =====================================================
    // ASSIGNED COURSES
    // =====================================================

    const [assignedCourses, setAssignedCourses] =
        useState([]);


    // =====================================================
    // TEACHING SLOTS
    // =====================================================

    const [teachingSlots, setTeachingSlots] =
        useState([]);


    // =====================================================
    // AVAILABLE COURSES
    // =====================================================

    const [availableCourses, setAvailableCourses] =
        useState([]);


    // =====================================================
    // PAGE STATE
    // =====================================================

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =====================================================
    // ASSIGN COURSE FORM
    // =====================================================

    const [showCourseForm, setShowCourseForm] =
        useState(false);

    const [selectedCourseId, setSelectedCourseId] =
        useState("");

    const [assigningCourse, setAssigningCourse] =
        useState(false);


    // =====================================================
    // TEACHING SLOT FORM
    // =====================================================

    const [showSlotForm, setShowSlotForm] =
        useState(false);

    const [creatingSlot, setCreatingSlot] =
        useState(false);

    const [slotForm, setSlotForm] = useState({
        courseId: "",
        className: "",
        dayOfWeek: "",
        startTime: "",
        endTime: "",
        maxStudents: "15"
    });


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    // =====================================================
    // FORMAT TIME
    // =====================================================

    const formatTime = (time) => {

        if (!time) {
            return "N/A";
        }

        const [hours, minutes] =
            time.split(":");

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
                hour12: true
            }
        );
    };


    // =====================================================
    // FETCH TEACHER
    // =====================================================

    const fetchTeacher = async () => {

        const response = await fetch(
            `http://localhost:3000/api/teachers/${id}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to fetch teacher"
            );
        }

        setTeacher(data.teacher);
    };


    // =====================================================
    // FETCH ASSIGNED COURSES
    // =====================================================

    const fetchAssignedCourses = async () => {

        const response = await fetch(
            `http://localhost:3000/api/course-teachers/teacher/${id}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to fetch assigned courses"
            );
        }

        setAssignedCourses(
            data.courses || []
        );
    };


    // =====================================================
    // FETCH AVAILABLE COURSES
    // =====================================================

    const fetchAvailableCourses = async () => {

        const response = await fetch(
            "http://localhost:3000/api/courses",
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to fetch courses"
            );
        }

        const courses =
            data.courses || [];

        setAvailableCourses(
            courses.filter(
                (course) =>
                    course.status === "active"
            )
        );
    };


    // =====================================================
    // FETCH TEACHING SLOTS
    // =====================================================

    const fetchTeachingSlots = async () => {

        const response = await fetch(
            `http://localhost:3000/api/teaching-slots/teacher/${id}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to fetch teaching slots"
            );
        }

        setTeachingSlots(
            data.teachingSlots || []
        );
    };


    // =====================================================
    // LOAD ALL PROFILE DATA
    // =====================================================

    const fetchProfileData = async () => {

        try {

            setLoading(true);
            setError("");

            await Promise.all([
                fetchTeacher(),
                fetchAssignedCourses(),
                fetchTeachingSlots(),
                fetchAvailableCourses()
            ]);

        } catch (error) {

            console.error(
                "FETCH TEACHER PROFILE ERROR:",
                error
            );

            setError(
                error.message ||
                "Failed to load teacher profile"
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        fetchProfileData();

    }, [id]);


    // =====================================================
    // ASSIGN COURSE
    // =====================================================

    const handleAssignCourse = async (
        event
    ) => {

        event.preventDefault();

        if (!selectedCourseId) {

            setError(
                "Please select a course"
            );

            return;
        }


        try {

            setAssigningCourse(true);
            setError("");


            const response =
                await fetch(
                    "http://localhost:3000/api/course-teachers",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            courseId:
                                selectedCourseId,

                            teacherId:
                                id
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to assign course"
                );
            }


            // Reset form

            setSelectedCourseId("");
            setShowCourseForm(false);


            // Refresh assigned courses

            await fetchAssignedCourses();


        } catch (error) {

            console.error(
                "ASSIGN COURSE ERROR:",
                error
            );

            setError(
                error.message ||
                "Failed to assign course"
            );

        } finally {

            setAssigningCourse(false);
        }
    };


    // =====================================================
    // SLOT INPUT
    // =====================================================

    const handleSlotInputChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;


        setSlotForm(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );
    };


    // =====================================================
    // CREATE TEACHING SLOT
    // =====================================================

    const handleCreateSlot = async (
        event
    ) => {

        event.preventDefault();


        try {

            setCreatingSlot(true);
            setError("");


            if (
                !slotForm.courseId ||
                !slotForm.className ||
                !slotForm.dayOfWeek ||
                !slotForm.startTime ||
                !slotForm.endTime
            ) {

                setError(
                    "Please complete all teaching slot fields"
                );

                return;
            }


            const response =
                await fetch(
                    "http://localhost:3000/api/teaching-slots",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({

                            teacherId: id,

                            courseId:
                                slotForm.courseId,

                            className:
                                slotForm.className,

                            dayOfWeek:
                                slotForm.dayOfWeek,

                            startTime:
                                slotForm.startTime,

                            endTime:
                                slotForm.endTime,

                            maxStudents:
                                Number(
                                    slotForm.maxStudents
                                ) || 15
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to create teaching slot"
                );
            }


            // Reset slot form

            setSlotForm({
                courseId: "",
                className: "",
                dayOfWeek: "",
                startTime: "",
                endTime: "",
                maxStudents: "15"
            });


            setShowSlotForm(false);


            // Refresh slots

            await fetchTeachingSlots();


        } catch (error) {

            console.error(
                "CREATE TEACHING SLOT ERROR:",
                error
            );

            setError(
                error.message ||
                "Failed to create teaching slot"
            );

        } finally {

            setCreatingSlot(false);
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="teacher-profile-page">

                <div className="teacher-profile-loading">

                    Loading teacher profile...

                </div>

            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error && !teacher) {

        return (
            <div className="teacher-profile-page">

                <div className="teacher-profile-error">

                    <h2>
                        Unable to load teacher
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            navigate("/teachers")
                        }
                    >
                        Back to Teachers
                    </button>

                </div>

            </div>
        );
    }


    // =====================================================
    // TEACHER INFORMATION
    // =====================================================

    const teacherName =
        teacher?.user?.name ||
        "N/A";

    const teacherEmail =
        teacher?.user?.email ||
        "N/A";

    const teacherInitial =
        teacherName
            .charAt(0)
            .toUpperCase();


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="teacher-profile-page">


            {/* =================================================
                BACK
                ================================================= */}

            <div className="teacher-profile-page-header">

                <button
                    className="teacher-back-button"
                    onClick={() =>
                        navigate("/teachers")
                    }
                >
                    ← Back to Teachers
                </button>

            </div>


            {/* =================================================
                ERROR MESSAGE
                ================================================= */}

            {error && (

                <div className="teacher-profile-error-message">
                    {error}
                </div>

            )}


            {/* =================================================
                PROFILE HEADER
                ================================================= */}

            <div className="teacher-profile-header">

                <div className="teacher-photo">
                    {teacherInitial}
                </div>


                <div className="teacher-profile-main">

                    <h1>
                        {teacherName}
                    </h1>

                    <p>
                        Teacher ID:{" "}
                        <strong>
                            {teacher.teacherId}
                        </strong>
                    </p>

                </div>


                <span
                    className={
                        `teacher-profile-status ${
                            teacher.status
                        }`
                    }
                >
                    {teacher.status}
                </span>

            </div>


            {/* =================================================
                PERSONAL INFORMATION
                ================================================= */}

            <section className="teacher-profile-section">

                <div className="teacher-profile-section-header">

                    <h2>
                        Personal Information
                    </h2>

                </div>


                <div className="teacher-profile-details-grid">

                    <div className="teacher-profile-detail">

                        <span>
                            Teacher ID
                        </span>

                        <strong>
                            {teacher.teacherId}
                        </strong>

                    </div>


                    <div className="teacher-profile-detail">

                        <span>
                            Full Name
                        </span>

                        <strong>
                            {teacherName}
                        </strong>

                    </div>


                    <div className="teacher-profile-detail">

                        <span>
                            Email
                        </span>

                        <strong>
                            {teacherEmail}
                        </strong>

                    </div>


                    <div className="teacher-profile-detail">

                        <span>
                            Phone
                        </span>

                        <strong>
                            {teacher.phone ||
                                "N/A"}
                        </strong>

                    </div>


                    <div className="teacher-profile-detail">

                        <span>
                            Specialization
                        </span>

                        <strong>
                            {teacher.specialization ||
                                "N/A"}
                        </strong>

                    </div>


                    <div className="teacher-profile-detail">

                        <span>
                            Date of Birth
                        </span>

                        <strong>
                            {formatDate(
                                teacher.dateOfBirth
                            )}
                        </strong>

                    </div>


                    <div className="teacher-profile-detail">

                        <span>
                            Joining Date
                        </span>

                        <strong>
                            {formatDate(
                                teacher.joiningDate
                            )}
                        </strong>

                    </div>


                    <div className="teacher-profile-detail">

                        <span>
                            Current Status
                        </span>

                        <strong>
                            {teacher.status}
                        </strong>

                    </div>


                    <div className="teacher-profile-detail teacher-profile-detail-full">

                        <span>
                            Address
                        </span>

                        <strong>
                            {teacher.address ||
                                "N/A"}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =================================================
                ASSIGNED COURSES
                ================================================= */}

            <section className="teacher-profile-section">

                <div className="teacher-profile-section-header">

                    <div>

                        <h2>
                            Assigned Courses
                        </h2>

                        <span>
                            {assignedCourses.length}{" "}
                            {assignedCourses.length === 1
                                ? "course"
                                : "courses"}
                        </span>

                    </div>


                    <button
                        className="teacher-profile-action-button"
                        onClick={() =>
                            setShowCourseForm(
                                (previous) =>
                                    !previous
                            )
                        }
                    >
                        {showCourseForm
                            ? "Cancel"
                            : "+ Assign Course"}
                    </button>

                </div>


                {/* =============================================
                    ASSIGN COURSE FORM
                    ============================================= */}

                {showCourseForm && (

                    <form
                        className="teacher-assignment-form"
                        onSubmit={
                            handleAssignCourse
                        }
                    >

                        <div className="teacher-assignment-field">

                            <label>
                                Course
                            </label>

                            <select
                                value={
                                    selectedCourseId
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSelectedCourseId(
                                        event.target.value
                                    )
                                }
                                required
                            >

                                <option value="">
                                    Select Course
                                </option>

                                {availableCourses
                                    .filter(
                                        (course) =>
                                            !assignedCourses.some(
                                                (
                                                    assignment
                                                ) =>
                                                    assignment.course?._id ===
                                                    course._id
                                            )
                                    )
                                    .map(
                                        (course) => (

                                            <option
                                                key={
                                                    course._id
                                                }
                                                value={
                                                    course._id
                                                }
                                            >
                                                {
                                                    course.name
                                                }
                                            </option>

                                        )
                                    )}

                            </select>

                        </div>


                        <div className="teacher-assignment-actions">

                            <button
                                type="button"
                                className="teacher-assignment-cancel"
                                onClick={() => {
                                    setShowCourseForm(
                                        false
                                    );
                                    setSelectedCourseId(
                                        ""
                                    );
                                }}
                                disabled={
                                    assigningCourse
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="teacher-assignment-save"
                                disabled={
                                    assigningCourse
                                }
                            >
                                {assigningCourse
                                    ? "Assigning..."
                                    : "Assign Course"}
                            </button>

                        </div>

                    </form>

                )}


                {/* =============================================
                    COURSE LIST
                    ============================================= */}

                {assignedCourses.length === 0 ? (

                    <div className="teacher-profile-empty">

                        <p>
                            No courses assigned.
                        </p>

                    </div>

                ) : (

                    <div className="teacher-course-list">

                        {assignedCourses.map(
                            (assignment) => {

                                const course =
                                    assignment.course;

                                return (

                                    <div
                                        className="teacher-course-card"
                                        key={
                                            assignment._id
                                        }
                                    >

                                        <div>

                                            <h3>
                                                {
                                                    course?.name ||
                                                    "N/A"
                                                }
                                            </h3>

                                            <span>
                                                Monthly Fee:
                                                ₹
                                                {
                                                    course?.monthlyFee ??
                                                    0
                                                }
                                            </span>

                                        </div>

                                    </div>

                                );
                            }
                        )}

                    </div>

                )}

            </section>


            {/* =================================================
                TEACHING SCHEDULE
                ================================================= */}

            <section className="teacher-profile-section">

                <div className="teacher-profile-section-header">

                    <div>

                        <h2>
                            Teaching Schedule
                        </h2>

                        <span>
                            {teachingSlots.length}{" "}
                            {teachingSlots.length === 1
                                ? "slot"
                                : "slots"}
                        </span>

                    </div>


                    <button
                        className="teacher-profile-action-button"
                        onClick={() =>
                            setShowSlotForm(
                                (previous) =>
                                    !previous
                            )
                        }
                        disabled={
                            assignedCourses.length === 0
                        }
                    >
                        {showSlotForm
                            ? "Cancel"
                            : "+ Add Teaching Slot"}
                    </button>

                </div>


                {/* =============================================
                    ADD TEACHING SLOT FORM
                    ============================================= */}

                {showSlotForm && (

                    <form
                        className="teacher-slot-form"
                        onSubmit={
                            handleCreateSlot
                        }
                    >

                        <div className="teacher-slot-form-grid">

                            {/* Course */}

                            <div className="teacher-slot-field">

                                <label>
                                    Course
                                </label>

                                <select
                                    name="courseId"
                                    value={
                                        slotForm.courseId
                                    }
                                    onChange={
                                        handleSlotInputChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Course
                                    </option>

                                    {assignedCourses.map(
                                        (
                                            assignment
                                        ) => (

                                            <option
                                                key={
                                                    assignment.course?._id
                                                }
                                                value={
                                                    assignment.course?._id
                                                }
                                            >
                                                {
                                                    assignment.course?.name
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* Class */}

                            <div className="teacher-slot-field">

                                <label>
                                    Class
                                </label>

                                <input
                                    type="text"
                                    name="className"
                                    value={
                                        slotForm.className
                                    }
                                    onChange={
                                        handleSlotInputChange
                                    }
                                    placeholder="e.g. Class V"
                                    required
                                />

                            </div>


                            {/* Day */}

                            <div className="teacher-slot-field">

                                <label>
                                    Day
                                </label>

                                <select
                                    name="dayOfWeek"
                                    value={
                                        slotForm.dayOfWeek
                                    }
                                    onChange={
                                        handleSlotInputChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Day
                                    </option>

                                    <option value="Monday">
                                        Monday
                                    </option>

                                    <option value="Tuesday">
                                        Tuesday
                                    </option>

                                    <option value="Wednesday">
                                        Wednesday
                                    </option>

                                    <option value="Thursday">
                                        Thursday
                                    </option>

                                    <option value="Friday">
                                        Friday
                                    </option>

                                    <option value="Saturday">
                                        Saturday
                                    </option>

                                    <option value="Sunday">
                                        Sunday
                                    </option>

                                </select>

                            </div>


                            {/* Start Time */}

                            <div className="teacher-slot-field">

                                <label>
                                    Start Time
                                </label>

                                <input
                                    type="time"
                                    name="startTime"
                                    value={
                                        slotForm.startTime
                                    }
                                    onChange={
                                        handleSlotInputChange
                                    }
                                    required
                                />

                            </div>


                            {/* End Time */}

                            <div className="teacher-slot-field">

                                <label>
                                    End Time
                                </label>

                                <input
                                    type="time"
                                    name="endTime"
                                    value={
                                        slotForm.endTime
                                    }
                                    onChange={
                                        handleSlotInputChange
                                    }
                                    required
                                />

                            </div>


                            {/* Maximum Students */}

                            <div className="teacher-slot-field">

                                <label>
                                    Maximum Students
                                </label>

                                <input
                                    type="number"
                                    name="maxStudents"
                                    min="1"
                                    value={
                                        slotForm.maxStudents
                                    }
                                    onChange={
                                        handleSlotInputChange
                                    }
                                />

                            </div>

                        </div>


                        <div className="teacher-assignment-actions">

                            <button
                                type="button"
                                className="teacher-assignment-cancel"
                                onClick={() =>
                                    setShowSlotForm(
                                        false
                                    )
                                }
                                disabled={
                                    creatingSlot
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="teacher-assignment-save"
                                disabled={
                                    creatingSlot
                                }
                            >
                                {creatingSlot
                                    ? "Creating..."
                                    : "Create Slot"}
                            </button>

                        </div>

                    </form>

                )}


                {/* =============================================
                    SCHEDULE LIST
                    ============================================= */}

                {teachingSlots.length === 0 ? (

                    <div className="teacher-profile-empty">

                        <p>
                            No teaching slots assigned.
                        </p>

                    </div>

                ) : (

                    <div className="teacher-schedule-wrapper">

                        <table className="teacher-schedule-table">

                            <thead>

                                <tr>

                                    <th>
                                        Subject
                                    </th>

                                    <th>
                                        Class
                                    </th>

                                    <th>
                                        Day
                                    </th>

                                    <th>
                                        Time
                                    </th>

                                    <th>
                                        Capacity
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {teachingSlots.map(
                                    (slot) => (

                                        <tr
                                            key={
                                                slot._id
                                            }
                                        >

                                            <td>
                                                {
                                                    slot.course?.name ||
                                                    "N/A"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    slot.className ||
                                                    "N/A"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    slot.dayOfWeek ||
                                                    "N/A"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    formatTime(
                                                        slot.startTime
                                                    )
                                                }
                                                {" – "}
                                                {
                                                    formatTime(
                                                        slot.endTime
                                                    )
                                                }
                                            </td>

                                            <td>
                                                {
                                                    slot.maxStudents ??
                                                    0
                                                }
                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        `teacher-slot-status ${
                                                            slot.status
                                                        }`
                                                    }
                                                >
                                                    {
                                                        slot.status
                                                    }
                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>
    );
}


export default TeacherProfile;