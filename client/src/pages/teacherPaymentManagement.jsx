import { useEffect, useState } from "react";
import "./teacherPaymentManagement.css";

const API = "http://localhost:3000/api";

const MONTHS = [
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
];


function TeacherPaymentManagement() {

    const token =
        localStorage.getItem("token");


    // =====================================================
    // STATE
    // =====================================================

    const [teachers, setTeachers] =
        useState([]);

    const [payments, setPayments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // Generate payment form

    const [teacherId, setTeacherId] =
        useState("");

    const [month, setMonth] =
        useState(new Date().getMonth() + 1);

    const [year, setYear] =
        useState(new Date().getFullYear());

    const [generating, setGenerating] =
        useState(false);


    // Edit payment

    const [editingPayment, setEditingPayment] =
        useState(null);

    const [editStatus, setEditStatus] =
        useState("due");

    const [editPaidOn, setEditPaidOn] =
        useState("");

    const [editMethod, setEditMethod] =
        useState("");


    const [saving, setSaving] =
        useState(false);


    // =====================================================
    // FETCH TEACHERS
    // =====================================================

    const loadTeachers = async () => {

        try {

            const response =
                await fetch(
                    `${API}/teachers`,
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
                    "Failed to fetch teachers"
                );
            }


            setTeachers(
                data.teachers || []
            );

        } catch (error) {

            console.error(
                "TEACHERS ERROR:",
                error
            );

            setError(
                error.message
            );
        }
    };


    // =====================================================
    // FETCH PAYMENTS
    // =====================================================

    const loadPayments = async () => {

        try {

            setLoading(true);
            setError("");


            const response =
                await fetch(
                    `${API}/teacher-payments`,
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
                    "Failed to fetch teacher payments"
                );
            }


            setPayments(
                data.payments || []
            );

        } catch (error) {

            console.error(
                "TEACHER PAYMENTS ERROR:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        const loadData = async () => {

            await Promise.all([
                loadTeachers(),
                loadPayments()
            ]);

        };


        loadData();

    }, []);


    // =====================================================
    // GENERATE PAYMENT
    // =====================================================

    const handleGenerate = async (event) => {

        event.preventDefault();


        if (!teacherId) {

            setError(
                "Please select a teacher."
            );

            return;
        }


        try {

            setGenerating(true);
            setError("");


            const response =
                await fetch(
                    `${API}/teacher-payments/generate`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            teacherId,
                            month:
                                Number(month),
                            year:
                                Number(year)
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to generate payment"
                );
            }


            setTeacherId("");


            await loadPayments();


        } catch (error) {

            console.error(
                "GENERATE PAYMENT ERROR:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setGenerating(false);
        }
    };


    // =====================================================
    // OPEN EDIT
    // =====================================================

    const handleEdit = (payment) => {

        setEditingPayment(payment);

        setEditStatus(
            payment.status || "due"
        );

        setEditPaidOn(
            payment.paidOn
                ? payment.paidOn.slice(0, 10)
                : ""
        );

        setEditMethod(
            payment.method || ""
        );

        setError("");
    };


    // =====================================================
    // CLOSE EDIT
    // =====================================================

    const closeEdit = () => {

        setEditingPayment(null);

        setEditStatus("due");
        setEditPaidOn("");
        setEditMethod("");
    };


    // =====================================================
    // UPDATE PAYMENT
    // =====================================================

    const handleUpdate = async (event) => {

        event.preventDefault();


        if (!editingPayment) {
            return;
        }


        try {

            setSaving(true);
            setError("");


            const response =
                await fetch(
                    `${API}/teacher-payments/${editingPayment._id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            status:
                                editStatus,

                            paidOn:
                                editStatus === "paid"
                                    ? editPaidOn || null
                                    : null,

                            method:
                                editStatus === "paid"
                                    ? editMethod || null
                                    : null
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update payment"
                );
            }


            closeEdit();

            await loadPayments();


        } catch (error) {

            console.error(
                "UPDATE PAYMENT ERROR:",
                error
            );

            setError(
                error.message
            );

        } finally {

            setSaving(false);
        }
    };


    // =====================================================
    // FORMAT MONTH
    // =====================================================

    const formatMonth = (
        paymentMonth,
        paymentYear
    ) => {

        if (
            !paymentMonth ||
            !paymentYear
        ) {
            return "—";
        }

        return `${MONTHS[paymentMonth - 1]} ${paymentYear}`;
    };


    // =====================================================
    // FORMAT CURRENCY
    // =====================================================

    const formatAmount = (amount) => {

        return Number(
            amount || 0
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="teacher-payment-management">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="teacher-payment-management-header">

                <div>

                    <h1>
                        Teacher Payments
                    </h1>

                    <p>
                        Manage monthly teacher payments.
                    </p>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="teacher-payment-management-error">
                    {error}
                </div>

            )}


            {/* =================================================
                GENERATE PAYMENT
            ================================================= */}

            <section className="teacher-payment-management-card">

                <div className="teacher-payment-management-card-header">

                    <div>

                        <h2>
                            Generate Teacher Payment
                        </h2>

                        <p>
                            Generate the monthly payment
                            from applicable student fees.
                        </p>

                    </div>

                </div>


                <form
                    className="teacher-payment-generate-form"
                    onSubmit={handleGenerate}
                >


                    {/* Teacher */}

                    <div className="teacher-payment-field">

                        <label htmlFor="teacher">
                            Teacher
                        </label>

                        <select
                            id="teacher"
                            value={teacherId}
                            onChange={(event) =>
                                setTeacherId(
                                    event.target.value
                                )
                            }
                        >

                            <option value="">
                                Select teacher
                            </option>

                            {teachers.map(
                                (teacher) => (

                                    <option
                                        key={
                                            teacher._id
                                        }
                                        value={
                                            teacher._id
                                        }
                                    >
                                        {teacher.user?.name ||
                                            teacher.name ||
                                            "Teacher"}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* Month */}

                    <div className="teacher-payment-field">

                        <label htmlFor="month">
                            Month
                        </label>

                        <select
                            id="month"
                            value={month}
                            onChange={(event) =>
                                setMonth(
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                        >

                            {MONTHS.map(
                                (monthName, index) => (

                                    <option
                                        key={monthName}
                                        value={index + 1}
                                    >
                                        {monthName}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* Year */}

                    <div className="teacher-payment-field">

                        <label htmlFor="year">
                            Year
                        </label>

                        <input
                            id="year"
                            type="number"
                            min="2000"
                            value={year}
                            onChange={(event) =>
                                setYear(
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                        />

                    </div>


                    {/* Generate */}

                    <button
                        type="submit"
                        className="teacher-payment-primary-button"
                        disabled={
                            generating ||
                            teachers.length === 0
                        }
                    >
                        {generating
                            ? "Generating..."
                            : "Generate Payment"}
                    </button>

                </form>

            </section>


            {/* =================================================
                PAYMENT HISTORY
            ================================================= */}

            <section className="teacher-payment-management-card">

                <div className="teacher-payment-management-card-header">

                    <div>

                        <h2>
                            Payment Records
                        </h2>

                        <p>
                            View and manage generated
                            teacher payments.
                        </p>

                    </div>

                </div>


                {loading ? (

                    <div className="teacher-payment-empty">
                        Loading teacher payments...
                    </div>

                ) : payments.length === 0 ? (

                    <div className="teacher-payment-empty">
                        No teacher payment records found.
                    </div>

                ) : (

                    <div className="teacher-payment-table-wrapper">

                        <table className="teacher-payment-table">

                            <thead>

                                <tr>

                                    <th>
                                        Teacher
                                    </th>

                                    <th>
                                        Month
                                    </th>

                                    <th>
                                        Total Fees
                                    </th>

                                    <th>
                                        Commission
                                    </th>

                                    <th>
                                        Teacher Payment
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

                                    <th>
                                        Action
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
                                                <strong>
                                                    {payment.teacher?.user?.name ||
                                                        "—"}
                                                </strong>
                                            </td>


                                            <td>
                                                {formatMonth(
                                                    payment.month,
                                                    payment.year
                                                )}
                                            </td>


                                            <td>
                                                ₹
                                                {formatAmount(
                                                    payment.totalFees
                                                )}
                                            </td>


                                            <td>
                                                ₹
                                                {formatAmount(
                                                    payment.commissionAmount
                                                )}
                                                <small>
                                                    {" "}
                                                    (
                                                    {payment.commissionPercent ??
                                                        0}
                                                    %)
                                                </small>
                                            </td>


                                            <td className="teacher-payment-amount">
                                                ₹
                                                {formatAmount(
                                                    payment.teacherPayment
                                                )}
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        `teacher-payment-status ${payment.status}`
                                                    }
                                                >
                                                    {payment.status ===
                                                    "paid"
                                                        ? "Paid"
                                                        : "Due"}
                                                </span>

                                            </td>


                                            <td>
                                                {formatDate(
                                                    payment.paidOn
                                                )}
                                            </td>


                                            <td>
                                                {payment.method ||
                                                    "—"}
                                            </td>


                                            <td>

                                                <button
                                                    type="button"
                                                    className="teacher-payment-edit-button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            payment
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =================================================
                EDIT PAYMENT MODAL
            ================================================= */}

            {editingPayment && (

                <div className="teacher-payment-modal-backdrop">

                    <div className="teacher-payment-modal">

                        <div className="teacher-payment-modal-header">

                            <div>

                                <h2>
                                    Update Payment
                                </h2>

                                <p>
                                    {editingPayment.teacher?.user?.name ||
                                        "Teacher"}
                                    {" — "}
                                    {formatMonth(
                                        editingPayment.month,
                                        editingPayment.year
                                    )}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="teacher-payment-modal-close"
                                onClick={closeEdit}
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>


                        <form
                            onSubmit={handleUpdate}
                            className="teacher-payment-edit-form"
                        >


                            {/* Status */}

                            <div className="teacher-payment-field">

                                <label htmlFor="edit-status">
                                    Status
                                </label>

                                <select
                                    id="edit-status"
                                    value={editStatus}
                                    onChange={(event) =>
                                        setEditStatus(
                                            event.target.value
                                        )
                                    }
                                >

                                    <option value="due">
                                        Due
                                    </option>

                                    <option value="paid">
                                        Paid
                                    </option>

                                </select>

                            </div>


                            {/* Paid On */}

                            {editStatus === "paid" && (

                                <>

                                    <div className="teacher-payment-field">

                                        <label htmlFor="edit-paid-on">
                                            Paid On
                                        </label>

                                        <input
                                            id="edit-paid-on"
                                            type="date"
                                            value={editPaidOn}
                                            onChange={(event) =>
                                                setEditPaidOn(
                                                    event.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    {/* Method */}

                                    <div className="teacher-payment-field">

                                        <label htmlFor="edit-method">
                                            Payment Method
                                        </label>

                                        <select
                                            id="edit-method"
                                            value={editMethod}
                                            onChange={(event) =>
                                                setEditMethod(
                                                    event.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Select method
                                            </option>

                                            <option value="cash">
                                                Cash
                                            </option>

                                            <option value="upi">
                                                UPI
                                            </option>

                                            <option value="bank_transfer">
                                                Bank Transfer
                                            </option>

                                        </select>

                                    </div>

                                </>

                            )}


                            {/* Actions */}

                            <div className="teacher-payment-modal-actions">

                                <button
                                    type="button"
                                    className="teacher-payment-cancel-button"
                                    onClick={closeEdit}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="teacher-payment-primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}


export default TeacherPaymentManagement;