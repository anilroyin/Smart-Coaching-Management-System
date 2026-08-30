import mongoose from "mongoose";
import Fee from "../models/studentFee.js";
import Enrollment from "../models/enrollment.js";
import Student from "../models/student.js";
import Teacher from "../models/teacher.js";

const feePopulate = [
    {
        path: "student",
        populate: {
            path: "user",
            select: "name email"
        }
    },
    {
        path: "enrollment",
        populate: [
            {
                path: "course",
                select: "name monthlyFee"
            },
            {
                path: "teacher",
                populate: {
                    path: "user",
                    select: "name email"
                }
            },
            {
                path: "teachingSlot"
            }
        ]
    }
];

const validId = (id) =>
    mongoose.Types.ObjectId.isValid(id);

const validMonth = (month) =>
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12;

const validYear = (year) =>
    Number.isInteger(year) &&
    year >= 2000;

const getFees = (query, sort = { year: -1, month: -1 }) =>
    Fee.find(query)
        .populate(feePopulate)
        .sort(sort);

const getSummary = (fees) =>
    fees.reduce(
        (summary, fee) => {
            const amount = Number(fee.amount || 0);

            summary.totalFees += amount;

            if (fee.status === "paid") {
                summary.totalCollected += amount;
                summary.paidCount++;
            } else {
                summary.totalDue += amount;
                summary.dueCount++;
            }

            return summary;
        },
        {
            totalFees: 0,
            totalCollected: 0,
            totalDue: 0,
            paidCount: 0,
            dueCount: 0
        }
    );

const getFilters = (query) => {
    const filters = {};
    const { month, year, status, studentId } = query;

    if (month !== undefined) {
        const value = Number(month);

        if (!validMonth(value))
            return { error: "Invalid fee month" };

        filters.month = value;
    }

    if (year !== undefined) {
        const value = Number(year);

        if (!validYear(value))
            return { error: "Invalid fee year" };

        filters.year = value;
    }

    if (status !== undefined) {
        if (!["paid", "due"].includes(status))
            return { error: "Invalid fee status" };

        filters.status = status;
    }

    if (studentId !== undefined) {
        if (!validId(studentId))
            return { error: "Invalid student ID" };

        filters.student = studentId;
    }

    return { filters };
};


// =====================================================
// CREATE FEE
// =====================================================

export const createFee = async (req, res) => {
    try {
        const {
            enrollmentId,
            month,
            year,
            amount,
            status = "due",
            paidAt,
            paymentMethod,
            transactionId,
            notes
        } = req.body;

        if (!validId(enrollmentId))
            return res.status(400).json({
                message: "Invalid enrollment ID"
            });

        if (!validMonth(month))
            return res.status(400).json({
                message: "Invalid fee month"
            });

        if (!validYear(year))
            return res.status(400).json({
                message: "Invalid fee year"
            });

        if (!["paid", "due"].includes(status))
            return res.status(400).json({
                message: "Invalid fee status"
            });

        const enrollment =
            await Enrollment.findById(enrollmentId);

        if (!enrollment)
            return res.status(404).json({
                message: "Enrollment not found"
            });

        const student =
            await Student.findById(enrollment.student);

        if (!student)
            return res.status(404).json({
                message: "Student not found"
            });

        const feeAmount =
            amount !== undefined
                ? Number(amount)
                : enrollment.monthlyFee;

        if (!Number.isFinite(feeAmount) || feeAmount < 0)
            return res.status(400).json({
                message: "Invalid fee amount"
            });

        const existingFee =
            await Fee.findOne({
                enrollment: enrollmentId,
                month,
                year
            });

        if (existingFee)
            return res.status(409).json({
                message:
                    "Fee record already exists for this month"
            });

        const fee = await Fee.create({
            enrollment: enrollmentId,
            student: enrollment.student,
            month,
            year,
            amount: feeAmount,
            status,
            paidAt:
                status === "paid"
                    ? paidAt
                        ? new Date(paidAt)
                        : new Date()
                    : undefined,
            paymentMethod,
            transactionId,
            notes
        });

        const populatedFee =
            await Fee.findById(fee._id)
                .populate(feePopulate);

        return res.status(201).json({
            message: "Fee created successfully",
            fee: populatedFee
        });

    } catch (error) {
        console.error("CREATE FEE ERROR:", error);

        return res.status(500).json({
            message: "Failed to create fee"
        });
    }
};


// =====================================================
// GET ALL FEES
// =====================================================

export const getAllFees = async (req, res) => {
    try {
        const result = getFilters(req.query);

        if (result.error)
            return res.status(400).json({
                message: result.error
            });

        const fees = await getFees(result.filters, {
            year: -1,
            month: -1,
            createdAt: -1
        });

        return res.status(200).json({
            message: "Student fees fetched successfully",
            count: fees.length,
            summary: getSummary(fees),
            fees
        });

    } catch (error) {
        console.error("GET ALL FEES ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch student fees"
        });
    }
};


// =====================================================
// GET FEES BY STUDENT
// =====================================================

export const getFeesByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!validId(studentId))
            return res.status(400).json({
                message: "Invalid student ID"
            });

        const student =
            await Student.findById(studentId);

        if (!student)
            return res.status(404).json({
                message: "Student not found"
            });

        // Teacher cannot access this endpoint.
        if (req.user.role === "teacher") {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        // Student can only see their own fees.
        if (req.user.role === "student") {
            if (
                student.user.toString() !==
                req.user._id.toString()
            ) {
                return res.status(403).json({
                    message:
                        "You are not allowed to view these fees"
                });
            }
        }

        const fees = await getFees(
            { student: studentId }
        );

        return res.status(200).json({
            message: "Student fees fetched successfully",
            count: fees.length,
            summary: getSummary(fees),
            fees
        });

    } catch (error) {
        console.error("GET STUDENT FEES ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch student fees"
        });
    }
};


// =====================================================
// GET FEES BY ENROLLMENT
// =====================================================

export const getFeesByEnrollment = async (req, res) => {
    try {
        const { enrollmentId } = req.params;

        if (!validId(enrollmentId))
            return res.status(400).json({
                message: "Invalid enrollment ID"
            });

        const enrollment =
            await Enrollment.findById(enrollmentId);

        if (!enrollment)
            return res.status(404).json({
                message: "Enrollment not found"
            });

        const fees = await getFees({
            enrollment: enrollmentId
        });

        return res.status(200).json({
            message:
                "Enrollment fees fetched successfully",
            count: fees.length,
            summary: getSummary(fees),
            fees
        });

    } catch (error) {
        console.error(
            "GET ENROLLMENT FEES ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch enrollment fees"
        });
    }
};


// =====================================================
// GET FEES BY TEACHER
// =====================================================

export const getFeesByTeacher = async (req, res) => {
    try {
        const teacher =
            await Teacher.findOne({
                user: req.user._id
            });

        if (!teacher)
            return res.status(404).json({
                message:
                    "Teacher profile not found"
            });

        const result = getFilters(req.query);

        if (result.error)
            return res.status(400).json({
                message: result.error
            });

        const enrollments =
            await Enrollment.find({
                teacher: teacher._id,
                status: "active"
            }).select("_id");

        const enrollmentIds =
            enrollments.map(
                enrollment => enrollment._id
            );

        if (!enrollmentIds.length) {
            return res.status(200).json({
                message:
                    "Your student fees fetched successfully",
                count: 0,
                summary: {
                    totalFees: 0,
                    totalCollected: 0,
                    totalDue: 0,
                    paidCount: 0,
                    dueCount: 0,
                    totalStudents: 0,
                    studentsWithFeeRecords: 0
                },
                fees: []
            });
        }

        result.filters.enrollment = {
            $in: enrollmentIds
        };

        const fees = await getFees(
            result.filters
        );

        const summary = getSummary(fees);

        const students =
            new Set(
                fees
                    .filter(fee => fee.student?._id)
                    .map(fee =>
                        fee.student._id.toString()
                    )
            );

        return res.status(200).json({
            message:
                "Your student fees fetched successfully",
            count: fees.length,
            summary: {
                ...summary,
                totalStudents:
                    enrollmentIds.length,
                studentsWithFeeRecords:
                    students.size
            },
            fees
        });

    } catch (error) {
        console.error(
            "GET TEACHER FEES ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch your student fees"
        });
    }
};


// =====================================================
// UPDATE FEE
// =====================================================

export const updateFee = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validId(id))
            return res.status(400).json({
                message: "Invalid fee ID"
            });

        const fee =
            await Fee.findById(id);

        if (!fee)
            return res.status(404).json({
                message: "Fee not found"
            });

        const {
            status,
            paidAt,
            paymentMethod,
            transactionId,
            notes
        } = req.body;

        if (status !== undefined) {
            if (!["paid", "due"].includes(status))
                return res.status(400).json({
                    message: "Invalid fee status"
                });

            fee.status = status;
        }

        if (paidAt !== undefined)
            fee.paidAt =
                paidAt
                    ? new Date(paidAt)
                    : undefined;

        if (paymentMethod !== undefined)
            fee.paymentMethod = paymentMethod;

        if (transactionId !== undefined)
            fee.transactionId = transactionId;

        if (notes !== undefined)
            fee.notes = notes;

        if (fee.status === "paid" && !fee.paidAt)
            fee.paidAt = new Date();

        if (fee.status === "due")
            fee.paidAt = undefined;

        await fee.save();

        const updatedFee =
            await Fee.findById(fee._id)
                .populate(feePopulate);

        return res.status(200).json({
            message: "Fee updated successfully",
            fee: updatedFee
        });

    } catch (error) {
        console.error("UPDATE FEE ERROR:", error);

        return res.status(500).json({
            message: "Failed to update fee"
        });
    }
};