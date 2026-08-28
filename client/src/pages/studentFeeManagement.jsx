import { useEffect, useMemo, useState } from "react";
import "./studentFeeManagement.css";

const API = "http://localhost:3000/api";

function StudentFeeManagement() {

    const token = localStorage.getItem("token");

    const [fees, setFees] = useState([]);

    const [summary, setSummary] = useState({
        totalFees: 0,
        totalCollected: 0,
        totalDue: 0,
        paidCount: 0,
        dueCount: 0
    });

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [month, setMonth] = useState("");

    const [year, setYear] = useState("");

    const [status, setStatus] = useState("");

    const [course, setCourse] = useState("");

    const [teacher, setTeacher] = useState("");

    const [selectedStudent, setSelectedStudent] = useState(null);

    const [selectedFee, setSelectedFee] = useState(null);

    const [paymentForm, setPaymentForm] = useState({
        paidAt: new Date().toISOString().split("T")[0],
        paymentMethod: "cash",
        transactionId: "",
        notes: ""
    });

    const [updatingId, setUpdatingId] = useState(null);


    // =====================================================
    // LOAD FEES
    // =====================================================

    const loadFees = async () => {

        try {

            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            if (month)
                params.append("month", month);

            if (year)
                params.append("year", year);

            if (status)
                params.append("status", status);

            const query = params.toString();

            const response = await fetch(
                `${API}/student-fees${query ? `?${query}` : ""}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch student fees"
                );
            }

            setFees(data.fees || []);

            setSummary(
                data.summary || {
                    totalFees: 0,
                    totalCollected: 0,
                    totalDue: 0,
                    paidCount: 0,
                    dueCount: 0
                }
            );

        } catch (error) {

            console.error(
                "STUDENT FEES ERROR:",
                error
            );

            setError(error.message);

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {
        loadFees();
    }, [month, year, status]);


    // =====================================================
    // FORMATTERS
    // =====================================================

    const formatCurrency = (amount) => {

        return `₹${Number(
            amount || 0
        ).toLocaleString("en-IN")}`;

    };


    const formatDate = (date) => {

        if (!date)
            return "—";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    const formatMonth = (feeMonth, feeYear) => {

        if (!feeMonth || !feeYear)
            return "—";

        const date = new Date(
            Number(feeYear),
            Number(feeMonth) - 1,
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
    // GET DETAILS
    // =====================================================

    const getStudentName = (fee) =>
        fee.student?.user?.name || "—";


    const getStudentId = (fee) =>
        fee.student?.studentId || "—";


    const getCourseName = (fee) =>
        fee.enrollment?.course?.name || "—";


    const getTeacherName = (fee) =>
        fee.enrollment?.teacher?.user?.name || "—";


    // =====================================================
    // COURSE / TEACHER OPTIONS
    // =====================================================

    const courseOptions = useMemo(() => {

        const courses = new Set();

        fees.forEach((fee) => {

            const name =
                fee.enrollment?.course?.name;

            if (name)
                courses.add(name);

        });

        return [...courses].sort();

    }, [fees]);


    const teacherOptions = useMemo(() => {

        const teachers = new Set();

        fees.forEach((fee) => {

            const name =
                fee.enrollment
                    ?.teacher
                    ?.user
                    ?.name;

            if (name)
                teachers.add(name);

        });

        return [...teachers].sort();

    }, [fees]);


    // =====================================================
    // STUDENT GROUPING
    // =====================================================

    const students = useMemo(() => {

        const map = new Map();

        fees.forEach((fee) => {

            const studentId =
                fee.student?._id;

            if (!studentId)
                return;

            if (!map.has(studentId)) {

                map.set(studentId, {
                    id: studentId,
                    name: getStudentName(fee),
                    studentId: getStudentId(fee),
                    course: getCourseName(fee),
                    teacher: getTeacherName(fee),
                    fees: []
                });

            }

            map.get(studentId).fees.push(fee);

        });


        return [...map.values()];

    }, [fees]);


    // =====================================================
    // FILTER STUDENTS
    // =====================================================

    const filteredStudents = useMemo(() => {

        const value =
            search.trim().toLowerCase();

        return students.filter((student) => {

            const matchesSearch =
                !value ||
                student.name
                    .toLowerCase()
                    .includes(value) ||
                student.studentId
                    .toLowerCase()
                    .includes(value);

            const matchesCourse =
                !course ||
                student.fees.some(
                    fee =>
                        getCourseName(fee) === course
                );

            const matchesTeacher =
                !teacher ||
                student.fees.some(
                    fee =>
                        getTeacherName(fee) === teacher
                );

            return (
                matchesSearch &&
                matchesCourse &&
                matchesTeacher
            );

        });

    }, [
        students,
        search,
        course,
        teacher
    ]);


    // =====================================================
    // STUDENT SUMMARY
    // =====================================================

    const getStudentSummary = (student) => {

        const total =
            student.fees.reduce(
                (sum, fee) =>
                    sum + Number(fee.amount || 0),
                0
            );

        const due =
            student.fees
                .filter(
                    fee => fee.status === "due"
                )
                .reduce(
                    (sum, fee) =>
                        sum + Number(fee.amount || 0),
                    0
                );

        const paid =
            student.fees
                .filter(
                    fee => fee.status === "paid"
                )
                .reduce(
                    (sum, fee) =>
                        sum + Number(fee.amount || 0),
                    0
                );

        return {
            total,
            paid,
            due
        };

    };


    // =====================================================
    // OPEN STUDENT
    // =====================================================

    const openStudent = (student) => {

        setSelectedStudent(student);

    };


    // =====================================================
    // OPEN PAYMENT FORM
    // =====================================================

    const openPayment = (fee) => {

        setSelectedFee(fee);

        setPaymentForm({
            paidAt:
                new Date()
                    .toISOString()
                    .split("T")[0],

            paymentMethod:
                "cash",

            transactionId:
                "",

            notes:
                ""
        });

    };


    // =====================================================
    // RECORD PAYMENT
    // =====================================================

    const recordPayment = async () => {

        if (!selectedFee)
            return;

        try {

            setUpdatingId(
                selectedFee._id
            );

            setError("");

            const response =
                await fetch(
                    `${API}/student-fees/${selectedFee._id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            status: "paid",

                            paidAt:
                                paymentForm.paidAt,

                            paymentMethod:
                                paymentForm.paymentMethod,

                            transactionId:
                                paymentForm.transactionId,

                            notes:
                                paymentForm.notes
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to record payment"
                );

            }


            setSelectedFee(null);

            await loadFees();


        } catch (error) {

            console.error(
                "RECORD PAYMENT ERROR:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setUpdatingId(null);

        }

    };


    // =====================================================
    // RESET FILTERS
    // =====================================================

    const resetFilters = () => {

        setSearch("");
        setMonth("");
        setYear("");
        setStatus("");
        setCourse("");
        setTeacher("");

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="student-fee-management-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="student-fee-management-header">

                <div>

                    <h1>
                        Student Fees
                    </h1>

                    <p>
                        Manage student fees and record payments.
                    </p>

                </div>

            </div>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="student-fee-summary">

                <div className="student-fee-summary-card">

                    <span>Total Fees</span>

                    <strong>
                        {formatCurrency(
                            summary.totalFees
                        )}
                    </strong>

                </div>


                <div className="student-fee-summary-card">

                    <span>Collected</span>

                    <strong>
                        {formatCurrency(
                            summary.totalCollected
                        )}
                    </strong>

                </div>


                <div className="student-fee-summary-card">

                    <span>Due</span>

                    <strong>
                        {formatCurrency(
                            summary.totalDue
                        )}
                    </strong>

                </div>


                <div className="student-fee-summary-card">

                    <span>Paid Records</span>

                    <strong>
                        {summary.paidCount}
                    </strong>

                </div>


                <div className="student-fee-summary-card">

                    <span>Due Records</span>

                    <strong>
                        {summary.dueCount}
                    </strong>

                </div>

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="student-fee-filters">

                <div className="student-fee-filter-group search-group">

                    <label>
                        Search Student
                    </label>

                    <input
                        type="text"
                        placeholder="Name or Student ID"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="student-fee-filter-group">

                    <label>
                        Month
                    </label>

                    <select
                        value={month}
                        onChange={(event) =>
                            setMonth(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All Months
                        </option>

                        {[
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December"
                        ].map(
                            (name, index) => (

                                <option
                                    key={index + 1}
                                    value={index + 1}
                                >
                                    {name}
                                </option>

                            )
                        )}

                    </select>

                </div>


                <div className="student-fee-filter-group">

                    <label>
                        Year
                    </label>

                    <input
                        type="number"
                        placeholder="Year"
                        value={year}
                        onChange={(event) =>
                            setYear(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="student-fee-filter-group">

                    <label>
                        Status
                    </label>

                    <select
                        value={status}
                        onChange={(event) =>
                            setStatus(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All Status
                        </option>

                        <option value="paid">
                            Paid
                        </option>

                        <option value="due">
                            Due
                        </option>

                    </select>

                </div>


                <div className="student-fee-filter-group">

                    <label>
                        Course
                    </label>

                    <select
                        value={course}
                        onChange={(event) =>
                            setCourse(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All Courses
                        </option>

                        {courseOptions.map(
                            (item) => (

                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>

                            )
                        )}

                    </select>

                </div>


                <div className="student-fee-filter-group">

                    <label>
                        Teacher
                    </label>

                    <select
                        value={teacher}
                        onChange={(event) =>
                            setTeacher(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            All Teachers
                        </option>

                        {teacherOptions.map(
                            (item) => (

                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>

                            )
                        )}

                    </select>

                </div>


                <button
                    type="button"
                    className="student-fee-reset-button"
                    onClick={resetFilters}
                >
                    Reset
                </button>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="student-fee-error">

                    {error}

                </div>

            )}


            {/* =================================================
                STUDENT LIST
            ================================================= */}

            <div className="student-fee-card">

                <div className="student-fee-section-header">

                    <div>

                        <h2>
                            Students
                        </h2>

                        <span>
                            {filteredStudents.length} students
                        </span>

                    </div>

                </div>


                {loading ? (

                    <div className="student-fee-empty">
                        Loading student fees...
                    </div>

                ) : filteredStudents.length === 0 ? (

                    <div className="student-fee-empty">
                        No students found.
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
                                        Student ID
                                    </th>

                                    <th>
                                        Course
                                    </th>

                                    <th>
                                        Teacher
                                    </th>

                                    <th>
                                        Total Fees
                                    </th>

                                    <th>
                                        Collected
                                    </th>

                                    <th>
                                        Due
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredStudents.map(
                                    (student) => {

                                        const studentSummary =
                                            getStudentSummary(
                                                student
                                            );

                                        return (

                                            <tr
                                                key={
                                                    student.id
                                                }
                                            >

                                                <td>

                                                    <strong>
                                                        {student.name}
                                                    </strong>

                                                </td>


                                                <td>
                                                    {student.studentId}
                                                </td>


                                                <td>
                                                    {student.course}
                                                </td>


                                                <td>
                                                    {student.teacher}
                                                </td>


                                                <td>
                                                    {formatCurrency(
                                                        studentSummary.total
                                                    )}
                                                </td>


                                                <td className="student-fee-collected">

                                                    {formatCurrency(
                                                        studentSummary.paid
                                                    )}

                                                </td>


                                                <td className="student-fee-due">

                                                    {formatCurrency(
                                                        studentSummary.due
                                                    )}

                                                </td>


                                                <td>

                                                    <button
                                                        type="button"
                                                        className="student-fee-view-button"
                                                        onClick={() =>
                                                            openStudent(
                                                                student
                                                            )
                                                        }
                                                    >
                                                        View Fees
                                                    </button>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================================
                STUDENT FEE HISTORY MODAL
            ================================================= */}

            {selectedStudent && (

                <div
                    className="student-fee-modal-overlay"
                    onClick={() =>
                        setSelectedStudent(null)
                    }
                >

                    <div
                        className="student-fee-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="student-fee-modal-header">

                            <div>

                                <h2>
                                    {selectedStudent.name}
                                </h2>

                                <p>
                                    {selectedStudent.studentId}
                                </p>

                            </div>

                            <button
                                type="button"
                                className="student-fee-close-button"
                                onClick={() =>
                                    setSelectedStudent(null)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="student-fee-modal-info">

                            <span>
                                Course:
                                <strong>
                                    {selectedStudent.course}
                                </strong>
                            </span>

                            <span>
                                Teacher:
                                <strong>
                                    {selectedStudent.teacher}
                                </strong>
                            </span>

                        </div>


                        <div className="student-fee-history">

                            <h3>
                                Fee History
                            </h3>


                            {selectedStudent.fees
                                .sort(
                                    (a, b) =>
                                        new Date(
                                            b.year,
                                            b.month - 1
                                        ) -
                                        new Date(
                                            a.year,
                                            a.month - 1
                                        )
                                )
                                .map((fee) => (

                                    <div
                                        className="student-fee-history-row"
                                        key={fee._id}
                                    >

                                        <div>

                                            <strong>
                                                {formatMonth(
                                                    fee.month,
                                                    fee.year
                                                )}
                                            </strong>

                                            <small>
                                                {fee.enrollment
                                                    ?.course
                                                    ?.name ||
                                                    "—"}
                                            </small>

                                        </div>


                                        <strong>
                                            {formatCurrency(
                                                fee.amount
                                            )}
                                        </strong>


                                        <span
                                            className={
                                                `student-fee-status ${fee.status}`
                                            }
                                        >
                                            {fee.status === "paid"
                                                ? "Paid"
                                                : "Due"}
                                        </span>


                                        <div className="student-fee-history-action">

                                            {fee.status ===
                                            "due" ? (

                                                <button
                                                    type="button"
                                                    className="student-fee-pay-button"
                                                    onClick={() =>
                                                        openPayment(
                                                            fee
                                                        )
                                                    }
                                                >
                                                    Record Payment
                                                </button>

                                            ) : (

                                                <small>
                                                    Paid on{" "}
                                                    {formatDate(
                                                        fee.paidAt
                                                    )}
                                                </small>

                                            )}

                                        </div>

                                    </div>

                                ))}

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                PAYMENT MODAL
            ================================================= */}

            {selectedFee && (

                <div
                    className="student-fee-modal-overlay"
                    onClick={() =>
                        setSelectedFee(null)
                    }
                >

                    <div
                        className="student-fee-payment-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="student-fee-modal-header">

                            <div>

                                <h2>
                                    Record Payment
                                </h2>

                                <p>
                                    {getStudentName(
                                        selectedFee
                                    )}{" "}
                                    ·{" "}
                                    {formatMonth(
                                        selectedFee.month,
                                        selectedFee.year
                                    )}
                                </p>

                            </div>

                            <button
                                type="button"
                                className="student-fee-close-button"
                                onClick={() =>
                                    setSelectedFee(null)
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
                                {formatCurrency(
                                    selectedFee.amount
                                )}
                            </strong>

                        </div>


                        <div className="student-fee-payment-form">

                            <div>

                                <label>
                                    Payment Date
                                </label>

                                <input
                                    type="date"
                                    value={
                                        paymentForm.paidAt
                                    }
                                    onChange={(event) =>
                                        setPaymentForm({
                                            ...paymentForm,
                                            paidAt:
                                                event.target.value
                                        })
                                    }
                                />

                            </div>


                            <div>

                                <label>
                                    Payment Method
                                </label>

                                <select
                                    value={
                                        paymentForm.paymentMethod
                                    }
                                    onChange={(event) =>
                                        setPaymentForm({
                                            ...paymentForm,
                                            paymentMethod:
                                                event.target.value
                                        })
                                    }
                                >

                                    <option value="cash">
                                        Cash
                                    </option>

                                    <option value="upi">
                                        UPI
                                    </option>

                                    <option value="bank_transfer">
                                        Bank Transfer
                                    </option>

                                    <option value="card">
                                        Card
                                    </option>

                                    <option value="other">
                                        Other
                                    </option>

                                </select>

                            </div>


                            <div>

                                <label>
                                    Transaction ID
                                </label>

                                <input
                                    type="text"
                                    placeholder="Optional"
                                    value={
                                        paymentForm.transactionId
                                    }
                                    onChange={(event) =>
                                        setPaymentForm({
                                            ...paymentForm,
                                            transactionId:
                                                event.target.value
                                        })
                                    }
                                />

                            </div>


                            <div>

                                <label>
                                    Notes
                                </label>

                                <textarea
                                    rows="3"
                                    placeholder="Optional"
                                    value={
                                        paymentForm.notes
                                    }
                                    onChange={(event) =>
                                        setPaymentForm({
                                            ...paymentForm,
                                            notes:
                                                event.target.value
                                        })
                                    }
                                />

                            </div>

                        </div>


                        <div className="student-fee-payment-actions">

                            <button
                                type="button"
                                className="student-fee-cancel-button"
                                onClick={() =>
                                    setSelectedFee(null)
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="student-fee-confirm-button"
                                disabled={
                                    updatingId ===
                                    selectedFee._id
                                }
                                onClick={
                                    recordPayment
                                }
                            >

                                {updatingId ===
                                selectedFee._id
                                    ? "Saving..."
                                    : "Mark as Paid"}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default StudentFeeManagement;