import mongoose from "mongoose";

import Enrollment from "../models/enrollment.js";
import Student from "../models/student.js";
import Course from "../models/course.js";
import Teacher from "../models/teacher.js";
import CourseTeacher from "../models/courseTeacher.js";
import TeachingSlot from "../models/teachingSlot.js";


// =====================================================
// CREATE ENROLLMENT
// =====================================================

export const createEnrollment = async (req, res) => {
    try {
        const {
            studentId,
            courseId,
            teacherId,
            teachingSlotId,
            monthlyFee,
            startDate
        } = req.body;

        // Validate MongoDB IDs
        if (
            !mongoose.Types.ObjectId.isValid(studentId) ||
            !mongoose.Types.ObjectId.isValid(courseId) ||
            !mongoose.Types.ObjectId.isValid(teacherId) ||
            !mongoose.Types.ObjectId.isValid(teachingSlotId)
        ) {
            return res.status(400).json({
                message:
                    "Invalid student, course, teacher or teaching slot ID"
            });
        }

        // -------------------------------------------------
        // Check student
        // -------------------------------------------------

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // -------------------------------------------------
        // Check course
        // -------------------------------------------------

        const course = await Course.findOne({
            _id: courseId,
            status: "active"
        });

        if (!course) {
            return res.status(404).json({
                message: "Active course not found"
            });
        }

        // -------------------------------------------------
        // Check teacher
        // -------------------------------------------------

        const teacher = await Teacher.findOne({
            _id: teacherId,
            status: "active"
        });

        if (!teacher) {
            return res.status(404).json({
                message: "Active teacher not found"
            });
        }

        // -------------------------------------------------
        // Check teacher-course assignment
        // -------------------------------------------------

        const courseTeacher = await CourseTeacher.findOne({
            course: courseId,
            teacher: teacherId,
            status: "active"
        });

        if (!courseTeacher) {
            return res.status(400).json({
                message: "This teacher is not assigned to this course"
            });
        }

        // -------------------------------------------------
        // Check teaching slot
        // -------------------------------------------------

        const teachingSlot = await TeachingSlot.findOne({
            _id: teachingSlotId,
            status: "active"
        });

        if (!teachingSlot) {
            return res.status(404).json({
                message: "Active teaching slot not found"
            });
        }

        // -------------------------------------------------
        // Make sure slot belongs to selected teacher
        // -------------------------------------------------

        if (teachingSlot.teacher.toString() !== teacherId) {
            return res.status(400).json({
                message:
                    "Teaching slot does not belong to this teacher"
            });
        }

        // -------------------------------------------------
        // Make sure slot belongs to selected course
        // -------------------------------------------------

        if (teachingSlot.course.toString() !== courseId) {
            return res.status(400).json({
                message:
                    "Teaching slot does not belong to this course"
            });
        }

        // -------------------------------------------------
        // Check teaching slot capacity
        // -------------------------------------------------

        const studentsInSlot = await Enrollment.countDocuments({
            teachingSlot: teachingSlotId,
            status: {
                $in: ["active", "paused"]
            }
        });

        if (studentsInSlot >= teachingSlot.maxStudents) {
            return res.status(400).json({
                message: "Teaching slot is full"
            });
        }

        // -------------------------------------------------
        // Prevent duplicate active/paused enrollment
        // -------------------------------------------------

        const existingEnrollment = await Enrollment.findOne({
            student: studentId,
            course: courseId,
            status: {
                $in: ["active", "paused"]
            }
        });

        if (existingEnrollment) {
            return res.status(409).json({
                message:
                    "Student already has an enrollment for this course"
            });
        }

        // -------------------------------------------------
        // Determine monthly fee
        // -------------------------------------------------

        const enrollmentFee =
            monthlyFee !== undefined
                ? monthlyFee
                : course.monthlyFee;

        if (
            typeof enrollmentFee !== "number" ||
            enrollmentFee < 0
        ) {
            return res.status(400).json({
                message: "Invalid monthly fee"
            });
        }

        // -------------------------------------------------
        // Determine start date
        // -------------------------------------------------

        const enrollmentStartDate =
            startDate || new Date();

        // -------------------------------------------------
        // Create enrollment
        // -------------------------------------------------

        const enrollment = await Enrollment.create({
            student: studentId,
            course: courseId,
            teacher: teacherId,
            teachingSlot: teachingSlotId,
            teacherAssignedAt: enrollmentStartDate,
            teacherHistory: [],
            monthlyFee: enrollmentFee,
            startDate: enrollmentStartDate
        });

        // -------------------------------------------------
        // Return populated enrollment
        // -------------------------------------------------

        const populatedEnrollment =
            await Enrollment.findById(enrollment._id)
                .populate({
                    path: "student",
                    populate: {
                        path: "user",
                        select: "name email"
                    }
                })
                .populate(
                    "course",
                    "name monthlyFee"
                )
                .populate({
                    path: "teacher",
                    populate: {
                        path: "user",
                        select: "name email"
                    }
                })
                .populate({
                    path: "teachingSlot",
                    populate: [
                        {
                            path: "teacher",
                            populate: {
                                path: "user",
                                select: "name email"
                            }
                        },
                        {
                            path: "course",
                            select: "name monthlyFee"
                        }
                    ]
                });

        res.status(201).json({
            message: "Student enrolled successfully",
            enrollment: populatedEnrollment
        });

    } catch (error) {
        console.error(
            "CREATE ENROLLMENT ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to create enrollment"
        });
    }
};


// =====================================================
// GET ALL ENROLLMENTS
// =====================================================

export const getEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate({
                path: "student",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .populate(
                "course",
                "name monthlyFee"
            )
            .populate({
                path: "teacher",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .populate({
                path: "teachingSlot",
                populate: [
                    {
                        path: "teacher",
                        populate: {
                            path: "user",
                            select: "name email"
                        }
                    },
                    {
                        path: "course",
                        select: "name monthlyFee"
                    }
                ]
            })
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            message:
                "Enrollments fetched successfully",
            enrollments
        });

    } catch (error) {
        console.error(
            "GET ENROLLMENTS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch enrollments"
        });
    }
};


// =====================================================
// GET ENROLLMENT BY ID
// =====================================================

export const getEnrollmentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid enrollment ID"
            });
        }

        const enrollment =
            await Enrollment.findById(id)
                .populate({
                    path: "student",
                    populate: {
                        path: "user",
                        select: "name email"
                    }
                })
                .populate(
                    "course",
                    "name monthlyFee"
                )
                .populate({
                    path: "teacher",
                    populate: {
                        path: "user",
                        select: "name email"
                    }
                })
                .populate({
                    path: "teachingSlot",
                    populate: [
                        {
                            path: "teacher",
                            populate: {
                                path: "user",
                                select: "name email"
                            }
                        },
                        {
                            path: "course",
                            select: "name monthlyFee"
                        }
                    ]
                });

        if (!enrollment) {
            return res.status(404).json({
                message: "Enrollment not found"
            });
        }

        res.status(200).json({
            message:
                "Enrollment fetched successfully",
            enrollment
        });

    } catch (error) {
        console.error(
            "GET ENROLLMENT ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch enrollment"
        });
    }
};


// =====================================================
// PAUSE ENROLLMENT
// =====================================================

export const pauseEnrollment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid enrollment ID"
            });
        }

        const enrollment =
            await Enrollment.findById(id);

        if (!enrollment) {
            return res.status(404).json({
                message: "Enrollment not found"
            });
        }

        if (enrollment.status !== "active") {
            return res.status(400).json({
                message:
                    "Only active enrollments can be paused"
            });
        }

        enrollment.status = "paused";
        enrollment.pausedAt = new Date();

        await enrollment.save();

        res.status(200).json({
            message:
                "Enrollment paused successfully",
            enrollment
        });

    } catch (error) {
        console.error(
            "PAUSE ENROLLMENT ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to pause enrollment"
        });
    }
};


// =====================================================
// RESUME ENROLLMENT
// =====================================================

export const resumeEnrollment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid enrollment ID"
            });
        }

        const enrollment =
            await Enrollment.findById(id);

        if (!enrollment) {
            return res.status(404).json({
                message: "Enrollment not found"
            });
        }

        if (enrollment.status !== "paused") {
            return res.status(400).json({
                message:
                    "Only paused enrollments can be resumed"
            });
        }

        enrollment.status = "active";
        enrollment.resumedAt = new Date();

        await enrollment.save();

        res.status(200).json({
            message:
                "Enrollment resumed successfully",
            enrollment
        });

    } catch (error) {
        console.error(
            "RESUME ENROLLMENT ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to resume enrollment"
        });
    }
};