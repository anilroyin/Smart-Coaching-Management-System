import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./studentProfile.css";

function StudentProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const [student, setStudent] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [payments, setPayments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                year: "numeric",
                timeZone: "Asia/Kolkata"
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


    // =====================================================
    // FORMAT PAYMENT MONTH
    // =====================================================

    const formatPaymentMonth = (month, year) => {
        if (!month || !year) {
            return "N/A";
        }

        const date = new Date(
            Number(year),
            Number(month) - 1,
            1
        );

        return date.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );
    };


    // =====================================================
    // LOAD STUDENT PROFILE
    // =====================================================

    useEffect(() => {
        const fetchStudentProfile = async () => {
            try {
                setLoading(true);
                setError("");

                // ---------------------------------------------
                // Fetch student
                // ---------------------------------------------

                const studentResponse = await fetch(
                    `http://localhost:3000/api/students/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!studentResponse.ok) {
                    throw new Error(
                        "Failed to fetch student"
                    );
                }

                const studentData =
                    await studentResponse.json();

                setStudent(studentData.student);


                // ---------------------------------------------
                // Fetch enrollments
                // ---------------------------------------------

                const enrollmentResponse = await fetch(
                    "http://localhost:3000/api/enrollments",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!enrollmentResponse.ok) {
                    throw new Error(
                        "Failed to fetch enrollments"
                    );
                }

                const enrollmentData =
                    await enrollmentResponse.json();

                const studentEnrollments =
                    (enrollmentData.enrollments || [])
                        .filter(
                            (enrollment) =>
                                enrollment.student?._id === id
                        );

                setEnrollments(
                    studentEnrollments
                );


                // ---------------------------------------------
                // Fetch payments
                // ---------------------------------------------

                const paymentResponse = await fetch(
                    `http://localhost:3000/api/payments/student/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!paymentResponse.ok) {
                    throw new Error(
                        "Failed to fetch payments"
                    );
                }

                const paymentData =
                    await paymentResponse.json();

                setPayments(
                    paymentData.payments || []
                );

            } catch (error) {

                console.error(
                    "FAILED TO LOAD STUDENT PROFILE:",
                    error
                );

                setError(
                    "Failed to load student profile."
                );

            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchStudentProfile();
        }

    }, [id, token]);


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="student-profile-page">

                <div className="profile-loading">
                    Loading student profile...
                </div>

            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error || !student) {
        return (
            <div className="student-profile-page">

                <div className="profile-error">

                    <h2>
                        Student not found
                    </h2>

                    <p>
                        {error ||
                            "Unable to load student information."}
                    </p>

                    <button
                        onClick={() =>
                            navigate("/students")
                        }
                    >
                        Back to Students
                    </button>

                </div>

            </div>
        );
    }


    const studentName =
        student.user?.name || "N/A";

    const email =
        student.user?.email || "N/A";


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="student-profile-page">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="profile-page-header">

                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/students")
                    }
                >
                    ← Back to Students
                </button>

            </div>


            {/* =================================================
                PROFILE HEADER
            ================================================= */}

            <div className="student-profile-header">

                <div className="student-photo">

                    <span>
                        {studentName
                            .charAt(0)
                            .toUpperCase()}
                    </span>

                </div>


                <div className="student-profile-main">

                    <h1>
                        {studentName}
                    </h1>

                    <p>
                        Student ID:{" "}
                        <strong>
                            {student.studentId}
                        </strong>
                    </p>

                </div>


                <div
                    className={`student-status ${student.status}`}
                >
                    {student.status}
                </div>

            </div>


            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <section className="profile-section">

                <div className="profile-section-header">

                    <h2>
                        Personal Information
                    </h2>

                </div>


                <div className="profile-details-grid">

                    <div className="profile-detail">

                        <span>
                            Student ID
                        </span>

                        <strong>
                            {student.studentId}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Full Name
                        </span>

                        <strong>
                            {studentName}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Email
                        </span>

                        <strong>
                            {email}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Phone
                        </span>

                        <strong>
                            {student.guardianPhone ||
                                "N/A"}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Date of Birth
                        </span>

                        <strong>
                            {formatDate(
                                student.dateOfBirth
                            )}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Current Status
                        </span>

                        <strong>
                            {student.status}
                        </strong>

                    </div>


                    <div className="profile-detail profile-detail-full">

                        <span>
                            Address
                        </span>

                        <strong>
                            {student.address ||
                                "N/A"}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =================================================
                GUARDIAN INFORMATION
            ================================================= */}

            <section className="profile-section">

                <div className="profile-section-header">

                    <h2>
                        Guardian Information
                    </h2>

                </div>


                <div className="profile-details-grid">

                    <div className="profile-detail">

                        <span>
                            Guardian Name
                        </span>

                        <strong>
                            {student.guardianName ||
                                "N/A"}
                        </strong>

                    </div>


                    <div className="profile-detail">

                        <span>
                            Phone
                        </span>

                        <strong>
                            {student.guardianPhone ||
                                "N/A"}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =================================================
                COURSES & ENROLLMENTS
            ================================================= */}

            <section className="profile-section">

                <div className="profile-section-header">

                    <h2>
                        Courses & Enrollments
                    </h2>

                </div>


                {enrollments.length === 0 ? (

                    <div className="profile-empty">
                        No enrollment found.
                    </div>

                ) : (

                    <div className="enrollment-list">

                        {enrollments.map(
                            (enrollment) => {

                                const slot =
                                    enrollment.teachingSlot;

                                const teacherName =
                                    enrollment.teacher
                                        ?.user
                                        ?.name ||
                                    "N/A";

                                return (

                                    <div
                                        className="enrollment-card"
                                        key={enrollment._id}
                                    >

                                        <div className="enrollment-main">

                                            <h3>
                                                {
                                                    enrollment
                                                        .course
                                                        ?.name ||
                                                    "Course"
                                                }
                                            </h3>

                                            <span
                                                className={`enrollment-status ${enrollment.status}`}
                                            >
                                                {
                                                    enrollment.status
                                                }
                                            </span>

                                        </div>


                                        <div className="enrollment-details">

                                            <div>

                                                <span>
                                                    Class
                                                </span>

                                                <strong>
                                                    {
                                                        slot
                                                            ?.className ||
                                                        "N/A"
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Teacher
                                                </span>

                                                <strong>
                                                    {teacherName}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Day
                                                </span>

                                                <strong>
                                                    {
                                                        slot
                                                            ?.dayOfWeek ||
                                                        "N/A"
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Time
                                                </span>

                                                <strong>

                                                    {slot
                                                        ? `${formatTime(
                                                              slot.startTime
                                                          )} - ${formatTime(
                                                              slot.endTime
                                                          )}`
                                                        : "N/A"}

                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Monthly Fee
                                                </span>

                                                <strong>
                                                    ₹
                                                    {Number(
                                                        enrollment.monthlyFee ||
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Start Date
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        enrollment.startDate
                                                    )}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>

                                );
                            }
                        )}

                    </div>

                )}

            </section>


            {/* =================================================
                PAYMENTS
            ================================================= */}

            <section className="profile-section">

                <div className="profile-section-header">

                    <h2>
                        Payment History
                    </h2>

                </div>


                {payments.length === 0 ? (

                    <div className="profile-empty">
                        No payment records found.
                    </div>

                ) : (

                    <div className="payment-table-wrapper">

                        <table className="payment-table">

                            <thead>

                                <tr>

                                    <th>
                                        Month
                                    </th>

                                    <th>
                                        Course
                                    </th>

                                    <th>
                                        Amount
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Paid On
                                    </th>

                                    <th>
                                        Method
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {payments.map(
                                    (payment) => (

                                        <tr
                                            key={
                                                payment._id
                                            }
                                        >

                                            <td>
                                                {formatPaymentMonth(
                                                    payment.month,
                                                    payment.year
                                                )}
                                            </td>

                                            <td>
                                                {
                                                    payment
                                                        .enrollment
                                                        ?.course
                                                        ?.name ||
                                                    "N/A"
                                                }
                                            </td>

                                            <td>
                                                ₹
                                                {Number(
                                                    payment.amount ||
                                                        0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </td>

                                            <td>

                                                <span
                                                    className={`payment-status ${payment.status}`}
                                                >
                                                    {
                                                        payment.status
                                                    }
                                                </span>

                                            </td>

                                            <td>
                                                {payment.paidAt
                                                    ? formatDate(
                                                          payment.paidAt
                                                      )
                                                    : "—"}
                                            </td>

                                            <td>
                                                {
                                                    payment.paymentMethod ||
                                                    "—"
                                                }
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

export default StudentProfile;