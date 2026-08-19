import mongoose from "mongoose";

import Enrollment from "../models/enrollment.js";
import Student from "../models/student.js";
import Course from "../models/course.js";
import Teacher from "../models/teacher.js";
import CourseTeacher from "../models/courseTeacher.js";

export const createEnrollment = async (req, res) => {
    try {
        const {
            studentId,
            courseId,
            teacherId,
            monthlyFee,
            startDate
        } = req.body;

        // Validate MongoDB IDs
        if (
            !mongoose.Types.ObjectId.isValid(studentId) ||
            !mongoose.Types.ObjectId.isValid(courseId) ||
            !mongoose.Types.ObjectId.isValid(teacherId)
        ) {
            return res.status(400).json({
                message: "Invalid student, course or teacher ID"
            });
        }

        // Check student
        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Check course
        const course = await Course.findOne({
            _id: courseId,
            status: "active"
        });

        if (!course) {
            return res.status(404).json({
                message: "Active course not found"
            });
        }

        // Check teacher
        const teacher = await Teacher.findOne({
            _id: teacherId,
            status: "active"
        });

        if (!teacher) {
            return res.status(404).json({
                message: "Active teacher not found"
            });
        }

        // IMPORTANT:
        // Check whether this teacher is actually assigned
        // to this course.
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

        // Prevent duplicate active enrollment
        const existingEnrollment = await Enrollment.findOne({
            student: studentId,
            course: courseId,
            status: {
                $in: ["active", "paused"]
            }
        });

        if (existingEnrollment) {
            return res.status(409).json({
                message: "Student already has an enrollment for this course"
            });
        }

        // If Admin doesn't provide a special fee,
        // use the course's current monthly fee.
        const enrollmentFee =
            monthlyFee !== undefined
                ? monthlyFee
                : course.monthlyFee;

        if (typeof enrollmentFee !== "number" || enrollmentFee < 0) {
            return res.status(400).json({
                message: "Invalid monthly fee"
            });
        }

        const enrollment = await Enrollment.create({
            student: studentId,
            course: courseId,
            teacher: teacherId,
            monthlyFee: enrollmentFee,
            startDate: startDate || new Date()
        });

        // Return useful information instead of only ObjectIds
        const populatedEnrollment = await Enrollment.findById(
            enrollment._id
        )
            .populate({
                path: "student",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .populate("course", "name monthlyFee")
            .populate({
                path: "teacher",
                populate: {
                    path: "user",
                    select: "name email"
                }
            });

        res.status(201).json({
            message: "Student enrolled successfully",
            enrollment: populatedEnrollment
        });

    } catch (error) {
        console.error("CREATE ENROLLMENT ERROR:", error);

        res.status(500).json({
            message: "Failed to create enrollment"
        });
    }
};