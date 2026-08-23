import mongoose from "mongoose";
import Course from "../models/course.js";
import Teacher from "../models/teacher.js";
import CourseTeacher from "../models/courseTeacher.js";

export const assignTeacherToCourse = async (req, res) => {
    try {
        const { courseId, teacherId } = req.body;

        if (
            !mongoose.Types.ObjectId.isValid(courseId) ||
            !mongoose.Types.ObjectId.isValid(teacherId)
        ) {
            return res.status(400).json({
                message: "Invalid course or teacher ID"
            });
        }

        const course = await Course.findOne({
            _id: courseId,
            status: "active"
        });

        if (!course) {
            return res.status(404).json({
                message: "Active course not found"
            });
        }

        const teacher = await Teacher.findOne({
            _id: teacherId,
            status: "active"
        });

        if (!teacher) {
            return res.status(404).json({
                message: "Active teacher not found"
            });
        }

        const existingAssignment = await CourseTeacher.findOne({
            course: courseId,
            teacher: teacherId
        });

        if (existingAssignment) {
            return res.status(409).json({
                message: "Teacher is already assigned to this course"
            });
        }

        const courseTeacher = await CourseTeacher.create({
            course: courseId,
            teacher: teacherId
        });

        res.status(201).json({
            message: "Teacher assigned to course successfully",
            courseTeacher
        });
    } catch (error) {
        console.error("ASSIGN TEACHER ERROR:", error);

        res.status(500).json({
            message: "Failed to assign teacher to course"
        });
    }
};

// =====================================================
// GET COURSES ASSIGNED TO A TEACHER
// =====================================================

export const getCoursesByTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Validate teacher ID
        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({
                message: "Invalid teacher ID"
            });
        }

        // Check teacher exists
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }

        // Get courses assigned to teacher
        const assignments = await CourseTeacher.find({
            teacher: teacherId,
            status: "active"
        }).populate(
            "course",
            "name class monthlyFee status"
        );

        res.status(200).json({
            message:
                "Teacher courses fetched successfully",

            count: assignments.length,

            courses: assignments
        });

    } catch (error) {
        console.error(
            "GET TEACHER COURSES ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch teacher courses"
        });
    }
};