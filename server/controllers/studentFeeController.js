import mongoose from "mongoose";

import Payment from "../models/studentFee.js";
import Enrollment from "../models/enrollment.js";
import Student from "../models/student.js";


// =====================================================
// CREATE PAYMENT
// =====================================================

export const createPayment = async (req, res) => {
    try {
        const {
            enrollmentId,
            month,
            year,
            amount,
            status,
            paidAt,
            paymentMethod,
            transactionId,
            notes
        } = req.body;


        // -------------------------------------------------
        // Validate enrollment ID
        // -------------------------------------------------

        if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
            return res.status(400).json({
                message: "Invalid enrollment ID"
            });
        }


        // -------------------------------------------------
        // Validate month
        // -------------------------------------------------

        if (
            typeof month !== "number" ||
            month < 1 ||
            month > 12
        ) {
            return res.status(400).json({
                message: "Invalid payment month"
            });
        }


        // -------------------------------------------------
        // Validate year
        // -------------------------------------------------

        if (
            typeof year !== "number" ||
            year < 2000
        ) {
            return res.status(400).json({
                message: "Invalid payment year"
            });
        }


        // -------------------------------------------------
        // Check enrollment
        // -------------------------------------------------

        const enrollment =
            await Enrollment.findById(enrollmentId);

        if (!enrollment) {
            return res.status(404).json({
                message: "Enrollment not found"
            });
        }


        // -------------------------------------------------
        // Check student
        // -------------------------------------------------

        const student =
            await Student.findById(
                enrollment.student
            );

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }


        // -------------------------------------------------
        // Determine payment amount
        //
        // If admin provides an amount, use it.
        // Otherwise use the enrollment monthly fee.
        // -------------------------------------------------

        const paymentAmount =
            amount !== undefined
                ? amount
                : enrollment.monthlyFee;


        if (
            typeof paymentAmount !== "number" ||
            paymentAmount < 0
        ) {
            return res.status(400).json({
                message: "Invalid payment amount"
            });
        }


        // -------------------------------------------------
        // Prevent duplicate monthly payment
        // -------------------------------------------------

        const existingPayment =
            await Payment.findOne({
                enrollment: enrollmentId,
                month,
                year
            });

        if (existingPayment) {
            return res.status(409).json({
                message:
                    "Payment record already exists for this month"
            });
        }


        // -------------------------------------------------
        // Determine status
        // -------------------------------------------------

        const paymentStatus =
            status || "paid";


        if (
            !["paid", "due"].includes(
                paymentStatus
            )
        ) {
            return res.status(400).json({
                message: "Invalid payment status"
            });
        }


        // -------------------------------------------------
        // Paid date
        // -------------------------------------------------

        let paymentDate;

        if (paymentStatus === "paid") {
            paymentDate =
                paidAt
                    ? new Date(paidAt)
                    : new Date();
        }


        // -------------------------------------------------
        // Create payment
        // -------------------------------------------------

        const payment =
            await Payment.create({
                enrollment: enrollmentId,

                student: enrollment.student,

                month,

                year,

                amount: paymentAmount,

                status: paymentStatus,

                paidAt: paymentDate,

                paymentMethod,

                transactionId,

                notes
            });


        // -------------------------------------------------
        // Populate response
        // -------------------------------------------------

        const populatedPayment =
            await Payment.findById(
                payment._id
            )
                .populate({
                    path: "student",
                    populate: {
                        path: "user",
                        select: "name email"
                    }
                })
                .populate({
                    path: "enrollment",
                    populate: [
                        {
                            path: "course",
                            select:
                                "name monthlyFee"
                        },
                        {
                            path: "teacher",
                            populate: {
                                path: "user",
                                select:
                                    "name email"
                            }
                        },
                        {
                            path: "teachingSlot"
                        }
                    ]
                });


        res.status(201).json({
            message:
                "Payment created successfully",

            payment: populatedPayment
        });

    } catch (error) {

        console.error(
            "CREATE PAYMENT ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to create payment"
        });
    }
};


// =====================================================
// GET PAYMENTS BY STUDENT
// =====================================================

export const getPaymentsByStudent = async (
    req,
    res
) => {
    try {
        const { studentId } = req.params;


        // -------------------------------------------------
        // Validate student ID
        // -------------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(
                studentId
            )
        ) {
            return res.status(400).json({
                message: "Invalid student ID"
            });
        }


        // -------------------------------------------------
        // Check student
        // -------------------------------------------------

        const student =
            await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }


        // -------------------------------------------------
        // Get all payments
        // -------------------------------------------------

        const payments =
            await Payment.find({
                student: studentId
            })
                .populate({
                    path: "enrollment",
                    populate: [
                        {
                            path: "course",
                            select:
                                "name monthlyFee"
                        },
                        {
                            path: "teacher",
                            populate: {
                                path: "user",
                                select:
                                    "name email"
                            }
                        },
                        {
                            path: "teachingSlot"
                        }
                    ]
                })
                .sort({
                    year: -1,
                    month: -1
                });


        res.status(200).json({
            message:
                "Student payments fetched successfully",

            count: payments.length,

            payments
        });

    } catch (error) {

        console.error(
            "GET STUDENT PAYMENTS ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch student payments"
        });
    }
};


// =====================================================
// GET PAYMENTS BY ENROLLMENT
// =====================================================

export const getPaymentsByEnrollment = async (
    req,
    res
) => {
    try {
        const { enrollmentId } = req.params;


        // -------------------------------------------------
        // Validate enrollment ID
        // -------------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(
                enrollmentId
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid enrollment ID"
            });
        }


        // -------------------------------------------------
        // Check enrollment
        // -------------------------------------------------

        const enrollment =
            await Enrollment.findById(
                enrollmentId
            );

        if (!enrollment) {
            return res.status(404).json({
                message:
                    "Enrollment not found"
            });
        }


        // -------------------------------------------------
        // Get payments
        // -------------------------------------------------

        const payments =
            await Payment.find({
                enrollment: enrollmentId
            })
                .sort({
                    year: -1,
                    month: -1
                });


        res.status(200).json({
            message:
                "Enrollment payments fetched successfully",

            count: payments.length,

            payments
        });

    } catch (error) {

        console.error(
            "GET ENROLLMENT PAYMENTS ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch enrollment payments"
        });
    }
};


// =====================================================
// UPDATE PAYMENT
// =====================================================

export const updatePayment = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const {
            status,
            paidAt,
            paymentMethod,
            transactionId,
            notes
        } = req.body;


        // -------------------------------------------------
        // Validate payment ID
        // -------------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                message:
                    "Invalid payment ID"
            });
        }


        // -------------------------------------------------
        // Find payment
        // -------------------------------------------------

        const payment =
            await Payment.findById(id);

        if (!payment) {
            return res.status(404).json({
                message:
                    "Payment not found"
            });
        }


        // -------------------------------------------------
        // Update allowed fields
        // -------------------------------------------------

        if (status !== undefined) {

            if (
                !["paid", "due"].includes(
                    status
                )
            ) {
                return res.status(400).json({
                    message:
                        "Invalid payment status"
                });
            }

            payment.status = status;
        }


        if (paidAt !== undefined) {
            payment.paidAt =
                paidAt
                    ? new Date(paidAt)
                    : undefined;
        }


        if (
            paymentMethod !== undefined
        ) {
            payment.paymentMethod =
                paymentMethod;
        }


        if (
            transactionId !== undefined
        ) {
            payment.transactionId =
                transactionId;
        }


        if (notes !== undefined) {
            payment.notes = notes;
        }


        // -------------------------------------------------
        // Automatically set paid date when marking paid
        // -------------------------------------------------

        if (
            payment.status === "paid" &&
            !payment.paidAt
        ) {
            payment.paidAt = new Date();
        }


        // -------------------------------------------------
        // Remove paid date when marked due
        // -------------------------------------------------

        if (
            payment.status === "due"
        ) {
            payment.paidAt = undefined;
        }


        await payment.save();


        // -------------------------------------------------
        // Return updated payment
        // -------------------------------------------------

        const updatedPayment =
            await Payment.findById(id)
                .populate({
                    path: "student",
                    populate: {
                        path: "user",
                        select:
                            "name email"
                    }
                })
                .populate({
                    path: "enrollment",
                    populate: [
                        {
                            path: "course",
                            select:
                                "name monthlyFee"
                        },
                        {
                            path: "teacher",
                            populate: {
                                path: "user",
                                select:
                                    "name email"
                            }
                        },
                        {
                            path: "teachingSlot"
                        }
                    ]
                });


        res.status(200).json({
            message:
                "Payment updated successfully",

            payment: updatedPayment
        });

    } catch (error) {

        console.error(
            "UPDATE PAYMENT ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update payment"
        });
    }
};