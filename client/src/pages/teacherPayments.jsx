import { useEffect, useState } from "react";
import "./teacherPayments.css";

const API = "http://localhost:3000/api";

function TeacherPayments() {

    const token =
        localStorage.getItem("token");

    const [payments, setPayments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const loadPayments = async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await fetch(
                        `${API}/teacher-payments/my`,
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
                        "Failed to fetch payments"
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


        loadPayments();

    }, [token]);


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


    const formatMonth = (
        month,
        year
    ) => {

        if (!month || !year) {
            return "—";
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


    return (

        <div className="teacher-payments-page">


            <div className="teacher-payments-header">

                <div>

                    <h1>
                        Payments
                    </h1>

                    <p>
                        View your payment history.
                    </p>

                </div>

            </div>


            {loading && (

                <div className="teacher-payments-card">

                    <div className="teacher-payments-empty">

                        Loading payments...

                    </div>

                </div>

            )}


            {!loading &&
                error && (

                    <div className="teacher-payments-card">

                        <div className="teacher-payments-empty">

                            {error}

                        </div>

                    </div>

                )}


            {!loading &&
                !error &&
                payments.length === 0 && (

                    <div className="teacher-payments-card">

                        <div className="teacher-payments-empty">

                            No payment records found.

                        </div>

                    </div>

                )}


            {!loading &&
                !error &&
                payments.length > 0 && (

                    <div className="teacher-payments-card">

                        <div className="teacher-payments-table">

                            <div className="teacher-payments-row teacher-payments-header-row">

                                <span>
                                    Month
                                </span>

                                <span>
                                    Amount
                                </span>

                                <span>
                                    Payment Date
                                </span>

                                <span>
                                    Method
                                </span>

                                <span>
                                    Status
                                </span>

                            </div>


                            {payments.map(
                                (payment) => (

                                    <div
                                        className="teacher-payments-row"
                                        key={
                                            payment._id
                                        }
                                    >

                                        <span>
                                            {formatMonth(
                                                payment.month,
                                                payment.year
                                            )}
                                        </span>


                                        <span className="payment-amount">
                                            ₹
                                            {payment.amount ??
                                                0}
                                        </span>


                                        <span>
                                            {formatDate(
                                                payment.paidAt
                                            )}
                                        </span>


                                        <span>
                                            {payment.paymentMethod ||
                                                "—"}
                                        </span>


                                        <span>

                                            <span
                                                className={
                                                    `payment-status ${payment.status}`
                                                }
                                            >
                                                {payment.status ===
                                                "paid"
                                                    ? "Paid"
                                                    : "Due"}
                                            </span>

                                        </span>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                )}

        </div>

    );

}

export default TeacherPayments;