import { useEffect, useMemo, useState } from "react";
import "./studentFeeManagement.css";

const API = "http://localhost:3000/api";

const ACADEMIC_MONTHS = [
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" },
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" }
];


// =====================================================
// HELPERS
// =====================================================

const getAcademicYear = () => {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    return month >= 4 ? year : year - 1;
};


const getCurrentAcademicMonths = () => {
    const currentMonth =
        new Date().getMonth() + 1;

    return ACADEMIC_MONTHS.filter((month) => {

        if (currentMonth >= 4) {
            return (
                month.value >= 4 &&
                month.value <= currentMonth
            );
        }

        return (
            month.value >= 4 ||
            month.value <= currentMonth
        );

    });
};


const getMonthName = (month) =>
    ACADEMIC_MONTHS.find(
        (item) => item.value === Number(month)
    )?.name || "";


const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;


const getStudentName = (student) =>
    student?.user?.name || "Unknown Student";


const getCourseName = (enrollment) =>
    enrollment?.course?.name || "Unknown Course";


const getTeacherName = (enrollment) =>
    enrollment?.teacher?.user?.name || "—";


const emptySummary = {
    totalFee: 0,
    collected: 0,
    due: 0,
    paidStudents: 0,
    unpaidStudents: 0
};


// =====================================================
// COMPONENT
// =====================================================

function StudentFeeManagement() {

    const token =
        localStorage.getItem("token");


    // =================================================
    // STATE
    // =================================================

    const [enrollments, setEnrollments] =
        useState([]);

    const [fees, setFees] =
        useState([]);

    const [students, setStudents] =
        useState([]);

    const [selectedStudent, setSelectedStudent] =
        useState(null);

    const [selectedEnrollment, setSelectedEnrollment] =
        useState(null);

    const [search, setSearch] =
        useState("");

    const [selectedMonth, setSelectedMonth] =
        useState(new Date().getMonth() + 1);

    const [selectedYear, setSelectedYear] =
        useState(getAcademicYear());

    const [loading, setLoading] =
        useState(true);

    const [loadingStudent, setLoadingStudent] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");


    // =================================================
    // CLOSE MODAL
    // =================================================

    const closeModal = () => {
        setSelectedEnrollment(null);
    };


    // =================================================
    // API HELPER
    // =================================================

    const apiRequest = async (
        url,
        options = {}
    ) => {

        const response = await fetch(
            url,
            {
                ...options,
                headers: {
                    ...(options.headers || {}),
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
                "Something went wrong"
            );
        }

        return data;
    };


    // =================================================
    // FIND FEE
    // =================================================

    const findFee = (
        enrollmentId,
        month = selectedMonth,
        year = selectedYear
    ) => {

        return fees.find(
            (fee) =>
                fee.enrollment?._id?.toString() ===
                    enrollmentId?.toString() &&
                Number(fee.month) === Number(month) &&
                Number(fee.year) === Number(year)
        );

    };


    // =================================================
    // FEE STATUS
    // =================================================

    const getFeeStatus = (enrollmentId) => {

        const fee =
            findFee(enrollmentId);

        return fee?.status === "paid"
            ? "paid"
            : "due";
    };


    // =================================================
    // LOAD MAIN DATA
    // =================================================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                enrollmentData,
                feeData
            ] = await Promise.all([

                apiRequest(
                    `${API}/enrollments`
                ),

                apiRequest(
                    `${API}/student-fees?month=${selectedMonth}&year=${selectedYear}`
                )

            ]);


            const activeEnrollments =
                (
                    enrollmentData.enrollments ||
                    []
                ).filter(
                    (enrollment) =>
                        enrollment.status ===
                        "active"
                );


            setEnrollments(
                activeEnrollments
            );

            setFees(
                feeData.fees || []
            );


            const studentMap =
                new Map();


            activeEnrollments.forEach(
                (enrollment) => {

                    const student =
                        enrollment.student;

                    if (!student?._id)
                        return;

                    studentMap.set(
                        student._id.toString(),
                        student
                    );

                }
            );


            setStudents(
                [...studentMap.values()]
            );

        } catch (error) {

            console.error(
                "STUDENT FEE LOAD ERROR:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadData();

    }, [
        selectedMonth,
        selectedYear
    ]);


    // =================================================
    // SEARCH RESULTS
    // =================================================

    const searchResults =
        useMemo(() => {

            const value =
                search.trim().toLowerCase();

            if (
                !value ||
                selectedStudent
            ) {
                return [];
            }


            return students
                .filter((student) => {

                    const name =
                        getStudentName(
                            student
                        ).toLowerCase();

                    const studentId =
                        String(
                            student.studentId || ""
                        ).toLowerCase();

                    return (
                        name.includes(value) ||
                        studentId.includes(value)
                    );

                })
                .slice(0, 10);

        }, [
            search,
            students,
            selectedStudent
        ]);


    // =================================================
    // MONTHLY SUMMARY
    // =================================================

    const summary =
        useMemo(() => {

            const studentStatus =
                new Map();

            let totalFee = 0;
            let collected = 0;
            let due = 0;


            enrollments.forEach(
                (enrollment) => {

                    const student =
                        enrollment.student;

                    if (!student?._id)
                        return;


                    const studentId =
                        student._id.toString();


                    const amount =
                        Number(
                            enrollment.monthlyFee ||
                            enrollment.course?.monthlyFee ||
                            0
                        );


                    totalFee += amount;


                    const fee =
                        findFee(
                            enrollment._id
                        );


                    const paid =
                        fee?.status === "paid";


                    if (paid) {
                        collected += amount;
                    } else {
                        due += amount;
                    }


                    if (
                        !studentStatus.has(
                            studentId
                        )
                    ) {
                        studentStatus.set(
                            studentId,
                            true
                        );
                    }


                    if (!paid) {
                        studentStatus.set(
                            studentId,
                            false
                        );
                    }

                }
            );


            let paidStudents = 0;
            let unpaidStudents = 0;


            studentStatus.forEach(
                (paid) => {

                    if (paid) {
                        paidStudents++;
                    } else {
                        unpaidStudents++;
                    }

                }
            );


            return {
                totalFee,
                collected,
                due,
                paidStudents,
                unpaidStudents
            };

        }, [
            enrollments,
            fees,
            selectedMonth,
            selectedYear
        ]);


    // =================================================
    // SELECT STUDENT
    // =================================================

    const selectStudent = async (student) => {

        try {

            setSelectedStudent(
                student
            );

            setSearch(
                student.studentId ||
                getStudentName(student)
            );

            setLoadingStudent(true);
            setError("");


            const data =
                await apiRequest(
                    `${API}/student-fees/student/${student._id}`
                );


            setFees(
                data.fees || []
            );

        } catch (error) {

            console.error(
                "LOAD STUDENT FEES ERROR:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setLoadingStudent(false);

        }
    };


    // =================================================
    // STUDENT ENROLLMENTS
    // =================================================

    const studentEnrollments =
        useMemo(() => {

            if (!selectedStudent)
                return [];

            return enrollments.filter(
                (enrollment) =>
                    enrollment.student?._id?.toString() ===
                    selectedStudent._id?.toString()
            );

        }, [
            enrollments,
            selectedStudent
        ]);


    // =================================================
    // RECORD FEE
    // =================================================

    const recordFee = async () => {

        if (!selectedEnrollment)
            return;


        try {

            setSaving(true);
            setError("");


            const existingFee =
                findFee(
                    selectedEnrollment._id
                );


            // Extra protection against
            // duplicate payment.

            if (
                existingFee?.status ===
                "paid"
            ) {
                closeModal();
                return;
            }


            const amount =
                Number(
                    selectedEnrollment.monthlyFee ||
                    selectedEnrollment.course?.monthlyFee ||
                    0
                );


            await apiRequest(
                `${API}/student-fees`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            enrollmentId:
                                selectedEnrollment._id,

                            month:
                                selectedMonth,

                            year:
                                selectedYear,

                            amount,

                            status:
                                "paid",

                            paidAt:
                                new Date().toISOString()

                        })
                }
            );


            closeModal();

            await loadData();


            if (selectedStudent) {

                const data =
                    await apiRequest(
                        `${API}/student-fees/student/${selectedStudent._id}`
                    );

                setFees(
                    data.fees || []
                );

            }

        } catch (error) {

            console.error(
                "RECORD FEE ERROR:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setSaving(false);

        }
    };


    // =================================================
    // OPEN RECORD MODAL
    // =================================================

    const openRecordFee =
        (enrollment) => {

            setSelectedEnrollment(
                enrollment
            );

        };


    // =================================================
    // CLEAR STUDENT
    // =================================================

    const clearStudent = () => {

        setSelectedStudent(null);
        setSearch("");
        setFees([]);
        closeModal();

        loadData();

    };


    // =================================================
    // MONTH DATA
    // =================================================

    const availableMonths =
        getCurrentAcademicMonths();


    const currentMonthName =
        getMonthName(
            selectedMonth
        );


    const years = [
        selectedYear - 1,
        selectedYear,
        selectedYear + 1
    ];


    // =================================================
    // RECENT PAID FEES
    // =================================================

    const recentPaidFees =
        fees
            .filter(
                (fee) =>
                    fee.status === "paid"
            )
            .slice(0, 10);


    // =================================================
    // RENDER
    // =================================================

    return (

        <div className="student-fee-management-page">


            {/* =============================================
                HEADER
            ============================================= */}

            <div className="student-fee-management-header">

                <div>

                    <h1>
                        Student Fees
                    </h1>

                    <p>
                        Manage course-wise
                        student fee collection.
                    </p>

                </div>

            </div>


            {/* =============================================
                MONTH SELECTOR
            ============================================= */}

            <div className="student-fee-month-bar">

                <div>

                    <label>
                        Fee Month
                    </label>

                    <select
                        value={selectedMonth}
                        onChange={(event) =>
                            setSelectedMonth(
                                Number(
                                    event.target.value
                                )
                            )
                        }
                    >

                        {availableMonths.map(
                            (month) => (

                                <option
                                    key={month.value}
                                    value={month.value}
                                >
                                    {month.name}
                                </option>

                            )
                        )}

                    </select>

                </div>


                <div>

                    <label>
                        Academic Year
                    </label>

                    <select
                        value={selectedYear}
                        onChange={(event) =>
                            setSelectedYear(
                                Number(
                                    event.target.value
                                )
                            )
                        }
                    >

                        {years.map(
                            (year) => (

                                <option
                                    key={year}
                                    value={year}
                                >
                                    {year}-
                                    {String(
                                        year + 1
                                    ).slice(-2)}
                                </option>

                            )
                        )}

                    </select>

                </div>

            </div>


            {/* =============================================
                SUMMARY
            ============================================= */}

            <div className="student-fee-summary">

                <div className="student-fee-summary-card">

                    <span>
                        Total Fee
                    </span>

                    <small>
                        {currentMonthName}
                    </small>

                    <strong>
                        {
                            formatCurrency(
                                summary.totalFee
                            )
                        }
                    </strong>

                </div>


                <div className="student-fee-summary-card">

                    <span>
                        Collected Fee
                    </span>

                    <strong>
                        {
                            formatCurrency(
                                summary.collected
                            )
                        }
                    </strong>

                </div>


                <div className="student-fee-summary-card">

                    <span>
                        Due Fee
                    </span>

                    <strong>
                        {
                            formatCurrency(
                                summary.due
                            )
                        }
                    </strong>

                </div>


                <div className="student-fee-summary-card">

                    <span>
                        Student Paid
                    </span>

                    <strong>
                        {
                            summary.paidStudents
                        }
                    </strong>

                </div>


                <div className="student-fee-summary-card">

                    <span>
                        Student Unpaid
                    </span>

                    <strong>
                        {
                            summary.unpaidStudents
                        }
                    </strong>

                </div>

            </div>


            {/* =============================================
                MAIN
            ============================================= */}

            <div className="student-fee-content">


                {/* =========================================
                    RECORD A FEE
                ========================================= */}

                <div className="student-fee-card">

                    <div className="student-fee-section-header">

                        <div>

                            <h2>
                                Record a Fee
                            </h2>

                            <span>
                                {currentMonthName}{" "}
                                {selectedYear}
                            </span>

                        </div>

                    </div>


                    <div className="student-fee-search-box">

                        <label>
                            Search Student
                        </label>

                        <input
                            type="text"
                            value={search}
                            placeholder="Search by Student ID or Name"
                            onChange={(event) => {

                                setSearch(
                                    event.target.value
                                );

                                if (
                                    selectedStudent
                                ) {

                                    setSelectedStudent(
                                        null
                                    );

                                    setFees([]);

                                }

                            }}
                        />


                        {!selectedStudent &&
                            search.trim() && (

                            <div className="student-fee-search-results">

                                {loading ? (

                                    <div>
                                        Searching...
                                    </div>

                                ) : searchResults.length === 0 ? (

                                    <div>
                                        No student found.
                                    </div>

                                ) : (

                                    searchResults.map(
                                        (student) => (

                                            <button
                                                type="button"
                                                key={
                                                    student._id
                                                }
                                                className="student-fee-student-result"
                                                onClick={() =>
                                                    selectStudent(
                                                        student
                                                    )
                                                }
                                            >

                                                <strong>
                                                    {
                                                        getStudentName(
                                                            student
                                                        )
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        student.studentId
                                                    }
                                                </span>

                                            </button>

                                        )
                                    )

                                )}

                            </div>

                        )}

                    </div>


                    {/* Selected student */}

                    {selectedStudent && (

                        <div className="student-fee-selected-student">

                            <div>

                                <strong>
                                    {
                                        getStudentName(
                                            selectedStudent
                                        )
                                    }
                                </strong>

                                <span>
                                    ID:{" "}
                                    {
                                        selectedStudent.studentId
                                    }
                                </span>

                            </div>

                            <button
                                type="button"
                                className="student-fee-reset-button"
                                onClick={
                                    clearStudent
                                }
                            >
                                Change
                            </button>

                        </div>

                    )}


                    {/* Course / month / status */}

                    {selectedStudent && (

                        <div className="student-fee-record-form">


                            <div>

                                <label>
                                    Course
                                </label>

                                <select
                                    value={
                                        selectedEnrollment?._id ||
                                        ""
                                    }
                                    onChange={(event) => {

                                        const enrollment =
                                            studentEnrollments.find(
                                                (item) =>
                                                    item._id ===
                                                    event.target.value
                                            );

                                        setSelectedEnrollment(
                                            enrollment ||
                                            null
                                        );

                                    }}
                                >

                                    <option value="">
                                        Select Course
                                    </option>

                                    {studentEnrollments.map(
                                        (enrollment) => (

                                            <option
                                                key={
                                                    enrollment._id
                                                }
                                                value={
                                                    enrollment._id
                                                }
                                            >
                                                {
                                                    getCourseName(
                                                        enrollment
                                                    )
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            <div>

                                <label>
                                    Month
                                </label>

                                <select
                                    value={
                                        selectedMonth
                                    }
                                    onChange={(event) =>
                                        setSelectedMonth(
                                            Number(
                                                event.target.value
                                            )
                                        )
                                    }
                                >

                                    {availableMonths.map(
                                        (month) => (

                                            <option
                                                key={
                                                    month.value
                                                }
                                                value={
                                                    month.value
                                                }
                                            >
                                                {
                                                    month.name
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {selectedEnrollment && (

                                <div className="student-fee-record-status">

                                    <label>
                                        Status
                                    </label>

                                    <span
                                        className={
                                            `student-fee-status ${
                                                getFeeStatus(
                                                    selectedEnrollment._id
                                                )
                                            }`
                                        }
                                    >
                                        {
                                            getFeeStatus(
                                                selectedEnrollment._id
                                            ) === "paid"
                                                ? "Paid"
                                                : "Due"
                                        }
                                    </span>

                                </div>

                            )}


                            {selectedEnrollment && (

                                <button
                                    type="button"
                                    className="student-fee-pay-button"
                                    onClick={() =>
                                        openRecordFee(
                                            selectedEnrollment
                                        )
                                    }
                                >
                                    Record Fee
                                </button>

                            )}

                        </div>

                    )}

                </div>


                {/* =========================================
                    RECENT PAID
                ========================================= */}

                <div className="student-fee-card">

                    <div className="student-fee-section-header">

                        <div>

                            <h2>
                                Recent Paid Fees
                            </h2>

                            <span>
                                Latest payments
                            </span>

                        </div>

                    </div>


                    {loading ? (

                        <div className="student-fee-empty">
                            Loading...
                        </div>

                    ) : recentPaidFees.length === 0 ? (

                        <div className="student-fee-empty">
                            No paid fees found.
                        </div>

                    ) : (

                        <div className="student-fee-table-wrapper">

                            <table className="student-fee-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Course
                                        </th>

                                        <th>
                                            Month
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {recentPaidFees.map(
                                        (fee) => (

                                            <tr
                                                key={
                                                    fee._id
                                                }
                                            >

                                                <td>
                                                    {
                                                        getStudentName(
                                                            fee.student
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        fee.student
                                                            ?.studentId
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        getCourseName(
                                                            fee.enrollment
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        getMonthName(
                                                            fee.month
                                                        )
                                                    }{" "}
                                                    {
                                                        fee.year
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        formatCurrency(
                                                            fee.amount
                                                        )
                                                    }
                                                </td>

                                                <td>

                                                    <span className="student-fee-status paid">
                                                        Paid
                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>


            {/* =============================================
                MODAL
            ============================================= */}

            {selectedEnrollment && (

                <div
                    className="student-fee-modal-overlay"
                    onClick={
                        closeModal
                    }
                >

                    <div
                        className="student-fee-payment-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {findFee(
                            selectedEnrollment._id
                        )?.status === "paid" ? (

                            <>

                                <div className="student-fee-modal-header">

                                    <div>

                                        <h2>
                                            Fee Already Paid
                                        </h2>

                                        <p>
                                            {
                                                getStudentName(
                                                    selectedStudent
                                                )
                                            }
                                        </p>

                                    </div>

                                    <button
                                        type="button"
                                        className="student-fee-close-button"
                                        onClick={
                                            closeModal
                                        }
                                    >
                                        ×
                                    </button>

                                </div>


                                <div className="student-fee-payment-message">

                                    <p>

                                        The fee for{" "}

                                        <strong>
                                            {
                                                getCourseName(
                                                    selectedEnrollment
                                                )
                                            }
                                        </strong>

                                        {" — "}

                                        <strong>
                                            {
                                                currentMonthName
                                            }{" "}
                                            {
                                                selectedYear
                                            }
                                        </strong>

                                        {" "}has already been
                                        recorded as paid.

                                    </p>

                                </div>


                                <div className="student-fee-payment-actions">

                                    <button
                                        type="button"
                                        className="student-fee-confirm-button"
                                        onClick={
                                            closeModal
                                        }
                                    >
                                        OK
                                    </button>

                                </div>

                            </>

                        ) : (

                            <>

                                <div className="student-fee-modal-header">

                                    <div>

                                        <h2>
                                            Record Fee
                                        </h2>

                                        <p>
                                            {
                                                getStudentName(
                                                    selectedStudent
                                                )
                                            }
                                            {" · "}
                                            {
                                                getCourseName(
                                                    selectedEnrollment
                                                )
                                            }
                                        </p>

                                    </div>

                                    <button
                                        type="button"
                                        className="student-fee-close-button"
                                        onClick={
                                            closeModal
                                        }
                                    >
                                        ×
                                    </button>

                                </div>


                                <div className="student-fee-payment-amount">

                                    <span>
                                        Fee Amount
                                    </span>

                                    <strong>
                                        {
                                            formatCurrency(
                                                selectedEnrollment.monthlyFee ||
                                                selectedEnrollment.course?.monthlyFee
                                            )
                                        }
                                    </strong>

                                </div>


                                <div className="student-fee-payment-message">

                                    <p>
                                        Are you sure?
                                    </p>

                                    <p>
                                        Did you receive the
                                        full fee from the
                                        student?
                                    </p>

                                </div>


                                <div className="student-fee-payment-actions">

                                    <button
                                        type="button"
                                        className="student-fee-cancel-button"
                                        onClick={
                                            closeModal
                                        }
                                    >
                                        No, Cancel
                                    </button>

                                    <button
                                        type="button"
                                        className="student-fee-confirm-button"
                                        disabled={
                                            saving
                                        }
                                        onClick={
                                            recordFee
                                        }
                                    >
                                        {
                                            saving
                                                ? "Recording..."
                                                : "Yes, Record"
                                        }
                                    </button>

                                </div>

                            </>

                        )}

                    </div>

                </div>

            )}

        </div>

    );
}

export default StudentFeeManagement;