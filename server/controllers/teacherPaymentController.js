import mongoose from "mongoose";

import TeacherPayment from "../models/teacherPayment.js";
import StudentFee from "../models/studentFee.js";
import Enrollment from "../models/enrollment.js";
import Teacher from "../models/teacher.js";
import Settings from "../models/settings.js";


// =====================================================
// GENERATE TEACHER PAYMENT
// Admin only
// =====================================================

export const generateTeacherPayment = async (req, res) => {
    try {
        const {
            teacherId,
            month,
            year
        } = req.body;


        // -------------------------------------------------
        // Validate teacher ID
        // -------------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(
                teacherId
            )
        ) {
            return res.status(400).json({
                message: "Invalid teacher ID"
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
        // Check teacher
        // -------------------------------------------------

        const teacher =
            await Teacher.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }


        // -------------------------------------------------
        // Prevent duplicate teacher payment
        // -------------------------------------------------

        const existingPayment =
            await TeacherPayment.findOne({
                teacher: teacherId,
                month,
                year
            });

        if (existingPayment) {
            return res.status(409).json({
                message:
                    "Teacher payment already exists for this month"
            });
        }


        // -------------------------------------------------
        // Get settings
        // -------------------------------------------------

        let settings =
            await Settings.findOne();

        if (!settings) {
            settings =
                await Settings.create({});
        }


        const commissionPercent =
            settings.feesCommissionPercent;


        // -------------------------------------------------
        // Find enrollments belonging to this teacher
        // -------------------------------------------------

        const enrollments =
            await Enrollment.find({
                teacher: teacherId
            }).select("_id");


        if (enrollments.length === 0) {
            return res.status(400).json({
                message:
                    "No enrollments found for this teacher"
            });
        }


        const enrollmentIds =
            enrollments.map(
                enrollment => enrollment._id
            );


        // -------------------------------------------------
        // Find monthly student-fee records
        // -------------------------------------------------

        const studentFees =
            await StudentFee.find({
                enrollment: {
                    $in: enrollmentIds
                },

                month,

                year
            });


        // -------------------------------------------------
        // No applicable fees
        // -------------------------------------------------

        if (studentFees.length === 0) {
            return res.status(400).json({
                message:
                    "No applicable student fees found for this month"
            });
        }


        // -------------------------------------------------
        // Calculate total applicable fees
        // -------------------------------------------------

        const totalFees =
            studentFees.reduce(
                (total, fee) =>
                    total + fee.amount,
                0
            );


        if (totalFees <= 0) {
            return res.status(400).json({
                message:
                    "No applicable fees found for this month"
            });
        }


        // -------------------------------------------------
        // Calculate commission
        // -------------------------------------------------

        const commissionAmount =
            Number(
                (
                    totalFees *
                    commissionPercent /
                    100
                ).toFixed(2)
            );


        // -------------------------------------------------
        // Calculate teacher payment
        // -------------------------------------------------

        const teacherPaymentAmount =
            Number(
                (
                    totalFees -
                    commissionAmount
                ).toFixed(2)
            );


        // -------------------------------------------------
        // Create teacher payment
        // -------------------------------------------------

        const teacherPayment =
            await TeacherPayment.create({

                teacher: teacherId,

                year,

                month,

                totalFees,

                commissionPercent,

                commissionAmount,

                teacherPayment:
                    teacherPaymentAmount,

                status: "due"
            });


        // -------------------------------------------------
        // Return populated payment
        // -------------------------------------------------

        const populatedPayment =
            await TeacherPayment.findById(
                teacherPayment._id
            )
                .populate({
                    path: "teacher",
                    populate: {
                        path: "user",
                        select: "name email"
                    }
                });


        res.status(201).json({
            message:
                "Teacher payment generated successfully",

            teacherPayment:
                populatedPayment
        });

    } catch (error) {

        console.error(
            "GENERATE TEACHER PAYMENT ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to generate teacher payment"
        });
    }
};


// =====================================================
// GET ALL TEACHER PAYMENTS
// Admin only
// =====================================================

export const getTeacherPayments = async (
    req,
    res
) => {
    try {

        const {
            teacherId,
            year,
            month,
            status
        } = req.query;


        const filter = {};


        // -------------------------------------------------
        // Optional teacher filter
        // -------------------------------------------------

        if (teacherId) {

            if (
                !mongoose.Types.ObjectId.isValid(
                    teacherId
                )
            ) {
                return res.status(400).json({
                    message:
                        "Invalid teacher ID"
                });
            }

            filter.teacher = teacherId;
        }


        // -------------------------------------------------
        // Optional year filter
        // -------------------------------------------------

        if (year) {

            const paymentYear =
                Number(year);

            if (
                Number.isNaN(paymentYear)
            ) {
                return res.status(400).json({
                    message:
                        "Invalid payment year"
                });
            }

            filter.year = paymentYear;
        }


        // -------------------------------------------------
        // Optional month filter
        // -------------------------------------------------

        if (month) {

            const paymentMonth =
                Number(month);

            if (
                paymentMonth < 1 ||
                paymentMonth > 12
            ) {
                return res.status(400).json({
                    message:
                        "Invalid payment month"
                });
            }

            filter.month = paymentMonth;
        }


        // -------------------------------------------------
        // Optional status filter
        // -------------------------------------------------

        if (status) {

            if (
                !["due", "paid"].includes(
                    status
                )
            ) {
                return res.status(400).json({
                    message:
                        "Invalid payment status"
                });
            }

            filter.status = status;
        }


        // -------------------------------------------------
        // Get payments
        // -------------------------------------------------

        const payments =
            await TeacherPayment.find(filter)
                .populate({
                    path: "teacher",
                    populate: {
                        path: "user",
                        select:
                            "name email"
                    }
                })
                .sort({
                    year: -1,
                    month: -1
                });


        res.status(200).json({
            message:
                "Teacher payments fetched successfully",

            count: payments.length,

            payments
        });

    } catch (error) {

        console.error(
            "GET TEACHER PAYMENTS ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch teacher payments"
        });
    }
};


// =====================================================
// GET PAYMENTS FOR ONE TEACHER
// Admin only
// =====================================================

export const getTeacherPaymentsByTeacher = async (
    req,
    res
) => {
    try {

        const {
            teacherId
        } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(
                teacherId
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid teacher ID"
            });
        }


        const payments =
            await TeacherPayment.find({
                teacher: teacherId
            })
                .sort({
                    year: -1,
                    month: -1
                });


        res.status(200).json({
            message:
                "Teacher payment history fetched successfully",

            count: payments.length,

            payments
        });

    } catch (error) {

        console.error(
            "GET TEACHER PAYMENT HISTORY ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch teacher payment history"
        });
    }
};


// =====================================================
// UPDATE TEACHER PAYMENT
// Admin only
// =====================================================

export const updateTeacherPayment = async (
    req,
    res
) => {
    try {

        const {
            id
        } = req.params;

        const {
            status,
            paidOn,
            method
        } = req.body;


        // -------------------------------------------------
        // Validate payment ID
        // -------------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {
            return res.status(400).json({
                message:
                    "Invalid teacher payment ID"
            });
        }


        // -------------------------------------------------
        // Find payment
        // -------------------------------------------------

        const payment =
            await TeacherPayment.findById(id);

        if (!payment) {
            return res.status(404).json({
                message:
                    "Teacher payment not found"
            });
        }


        // -------------------------------------------------
        // Update status
        // -------------------------------------------------

        if (status !== undefined) {

            if (
                !["due", "paid"].includes(
                    status
                )
            ) {
                return res.status(400).json({
                    message:
                        "Invalid teacher payment status"
                });
            }

            payment.status = status;
        }


        // -------------------------------------------------
        // Update paid date
        // -------------------------------------------------

        if (paidOn !== undefined) {

            payment.paidOn =
                paidOn
                    ? new Date(paidOn)
                    : undefined;
        }


        // -------------------------------------------------
        // Update payment method
        // -------------------------------------------------

        if (method !== undefined) {

            const allowedMethods = [
                "cash",
                "upi",
                "bank_transfer"
            ];

            if (
                method !== null &&
                !allowedMethods.includes(
                    method
                )
            ) {
                return res.status(400).json({
                    message:
                        "Invalid payment method"
                });
            }

            payment.method = method;
        }


        // -------------------------------------------------
        // Automatically set paid date
        // -------------------------------------------------

        if (
            payment.status === "paid" &&
            !payment.paidOn
        ) {
            payment.paidOn = new Date();
        }


        // -------------------------------------------------
        // Remove payment details when due
        // -------------------------------------------------

        if (
            payment.status === "due"
        ) {
            payment.paidOn = undefined;
            payment.method = undefined;
        }


        await payment.save();


        const updatedPayment =
            await TeacherPayment.findById(id)
                .populate({
                    path: "teacher",
                    populate: {
                        path: "user",
                        select:
                            "name email"
                    }
                });


        res.status(200).json({
            message:
                "Teacher payment updated successfully",

            teacherPayment:
                updatedPayment
        });

    } catch (error) {

        console.error(
            "UPDATE TEACHER PAYMENT ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update teacher payment"
        });
    }
};


// =====================================================
// GET MY PAYMENTS
// Teacher only
// =====================================================

export const getMyTeacherPayments = async (
    req,
    res
) => {
    try {

        // -------------------------------------------------
        // Find teacher profile linked to logged-in user
        // -------------------------------------------------

        const teacher =
            await Teacher.findOne({
                user: req.user._id
            });

        if (!teacher) {
            return res.status(404).json({
                message:
                    "Teacher profile not found"
            });
        }


        // -------------------------------------------------
        // Optional year filter
        // -------------------------------------------------

        const filter = {
            teacher: teacher._id
        };


        if (req.query.year) {

            const year =
                Number(req.query.year);

            if (
                Number.isNaN(year)
            ) {
                return res.status(400).json({
                    message:
                        "Invalid payment year"
                });
            }

            filter.year = year;
        }


        // -------------------------------------------------
        // Get own payment history
        // -------------------------------------------------

        const payments =
            await TeacherPayment.find(filter)
                .sort({
                    year: -1,
                    month: -1
                });


        res.status(200).json({
            message:
                "My teacher payments fetched successfully",

            count: payments.length,

            payments
        });

    } catch (error) {

        console.error(
            "GET MY TEACHER PAYMENTS ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch your teacher payments"
        });
    }
};