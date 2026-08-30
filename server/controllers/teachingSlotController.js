import mongoose from "mongoose";
import TeachingSlot from "../models/teachingSlot.js";
import Teacher from "../models/teacher.js";
import Course from "../models/course.js";
import CourseTeacher from "../models/courseTeacher.js";
import Enrollment from "../models/enrollment.js";

// CREATE TEACHING SLOT
export const createTeachingSlot = async (req, res) => {
    try {
        const {
            teacherId,
            courseId,
            className,
            dayOfWeek,
            startTime,
            endTime,
            maxStudents
        } = req.body;


        // Check class
        if (!className || !className.trim()) {
            return res.status(400).json({
                message: "Class is required"
            });
        }


        // Check teacher exists and is active
        const teacher = await Teacher.findOne({
            _id: teacherId,
            status: "active"
        });

        if (!teacher) {
            return res.status(404).json({
                message: "Active teacher not found"
            });
        }


        // Check course exists and is active
        const course = await Course.findOne({
            _id: courseId,
            status: "active"
        });

        if (!course) {
            return res.status(404).json({
                message: "Active course not found"
            });
        }


        // Check teacher is assigned to this course
        const courseTeacher = await CourseTeacher.findOne({
            teacher: teacherId,
            course: courseId,
            status: "active"
        });

        if (!courseTeacher) {
            return res.status(400).json({
                message: "Teacher is not assigned to this course"
            });
        }


        // Prevent duplicate teaching slot
        const existingSlot = await TeachingSlot.findOne({
            teacher: teacherId,
            course: courseId,
            className: className.trim(),
            dayOfWeek,
            startTime,
            endTime,
            status: "active"
        });

        if (existingSlot) {
            return res.status(409).json({
                message: "This teaching slot already exists"
            });
        }


        // Create teaching slot
        const teachingSlot = await TeachingSlot.create({
            teacher: teacherId,
            course: courseId,
            className: className.trim(),
            dayOfWeek,
            startTime,
            endTime,
            maxStudents: maxStudents || 15
        });


        // Return populated data
        const populatedSlot = await TeachingSlot.findById(
            teachingSlot._id
        )
            .populate({
                path: "teacher",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .populate("course");


        res.status(201).json({
            message: "Teaching slot created successfully",
            teachingSlot: populatedSlot
        });

    } catch (error) {
        console.error(
            "CREATE TEACHING SLOT ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to create teaching slot"
        });
    }
};

// CREATE MULTIPLE TEACHING SLOTS
export const createMultipleTeachingSlots = async (req, res) => {
    try {
        const { teacherId, slots } = req.body;


        // Check teacher exists and is active
        const teacher = await Teacher.findOne({
            _id: teacherId,
            status: "active"
        });

        if (!teacher) {
            return res.status(404).json({
                message: "Active teacher not found"
            });
        }


        // Check slots array
        if (!Array.isArray(slots) || slots.length === 0) {
            return res.status(400).json({
                message: "Slots must be a non-empty array"
            });
        }


        const createdSlots = [];


        // Create each slot
        for (const slot of slots) {

            const {
                courseId,
                className,
                dayOfWeek,
                startTime,
                endTime,
                maxStudents
            } = slot;


            // -------------------------------------------------
            // Check class
            // -------------------------------------------------

            if (!className || !className.trim()) {
                return res.status(400).json({
                    message:
                        `Class is required for ${dayOfWeek} ${startTime}`
                });
            }


            // -------------------------------------------------
            // Check course exists and is active
            // -------------------------------------------------

            const course = await Course.findOne({
                _id: courseId,
                status: "active"
            });

            if (!course) {
                return res.status(404).json({
                    message:
                        `Course not found: ${courseId}`
                });
            }


            // -------------------------------------------------
            // Check teacher is assigned to this course
            // -------------------------------------------------

            const courseTeacher =
                await CourseTeacher.findOne({
                    teacher: teacherId,
                    course: courseId,
                    status: "active"
                });

            if (!courseTeacher) {
                return res.status(400).json({
                    message:
                        `Teacher is not assigned to course: ${course.name}`
                });
            }


            // -------------------------------------------------
            // Check duplicate slot
            // -------------------------------------------------

            const existingSlot =
                await TeachingSlot.findOne({
                    teacher: teacherId,
                    course: courseId,
                    className: className.trim(),
                    dayOfWeek,
                    startTime,
                    endTime,
                    status: "active"
                });

            if (existingSlot) {
                return res.status(409).json({
                    message:
                        `Slot already exists: ${dayOfWeek} ${startTime}-${endTime} for Class ${className}`
                });
            }


            // -------------------------------------------------
            // Create slot
            // -------------------------------------------------

            const teachingSlot =
                await TeachingSlot.create({
                    teacher: teacherId,
                    course: courseId,
                    className: className.trim(),
                    dayOfWeek,
                    startTime,
                    endTime,
                    maxStudents:
                        maxStudents || 15
                });

            createdSlots.push(teachingSlot);
        }


        // -------------------------------------------------
        // Populate teacher and course information
        // -------------------------------------------------

        const populatedSlots =
            await TeachingSlot.find({
                _id: {
                    $in: createdSlots.map(
                        slot => slot._id
                    )
                }
            })
                .populate({
                    path: "teacher",
                    populate: {
                        path: "user",
                        select: "name email"
                    }
                })
                .populate("course");


        res.status(201).json({
            message:
                "Teaching slots created successfully",

            teachingSlots: populatedSlots
        });

    } catch (error) {

        console.error(
            "CREATE MULTIPLE TEACHING SLOTS ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to create teaching slots"
        });
    }
};

export const getTeachingSlots = async (req, res) => {
    try {
        const teachingSlots = await TeachingSlot.find({
            status: "active"
        })
            .populate({
                path: "teacher",
                populate: {
                    path: "user",
                    select: "name email"
                }
            })
            .populate("course")
            .sort({
                dayOfWeek: 1,
                startTime: 1
            });

        const slotsWithEnrollmentCount = await Promise.all(
            teachingSlots.map(async (slot) => {

                const enrolledStudents =
                    await Enrollment.countDocuments({
                        teachingSlot: slot._id,
                        status: "active"
                    });

                return {
                    ...slot.toObject(),

                    enrolledStudents,

                    availableSeats:
                        Math.max(
                            slot.maxStudents -
                            enrolledStudents,
                            0
                        )
                };
            })
        );

        res.status(200).json({
            message: "Teaching slots fetched successfully",
            teachingSlots: slotsWithEnrollmentCount
        });

    } catch (error) {
        console.error(
            "GET TEACHING SLOTS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch teaching slots"
        });
    }
};

// GET TEACHING SLOTS BY TEACHER
export const getTeachingSlotsByTeacher = async (req, res) => {
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

        // Get all active slots of this teacher
        const teachingSlots = await TeachingSlot.find({
            teacher: teacherId,
            status: "active"
        })
            .populate("teacher")
            .populate("course")
            .sort({
                dayOfWeek: 1,
                startTime: 1
            });

        res.status(200).json({
            message: "Teacher teaching slots fetched successfully",
            teacher: {
                id: teacher._id,
                teacherId: teacher.teacherId
            },
            count: teachingSlots.length,
            teachingSlots
        });

    } catch (error) {
        console.error(
            "GET TEACHING SLOTS BY TEACHER ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch teacher teaching slots"
        });
    }
};

// =====================================================
// GET LOGGED-IN TEACHER'S TEACHING SLOTS
// =====================================================

export const getMyTeachingSlots = async (req, res) => {
    try {

        // -------------------------------------------------
        // Find Teacher profile belonging to logged-in User
        // -------------------------------------------------

        const teacher = await Teacher.findOne({
            user: req.user._id
        });

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher profile not found"
            });
        }


        // -------------------------------------------------
        // Get active teaching slots
        // -------------------------------------------------

        const teachingSlots =
            await TeachingSlot.find({
                teacher: teacher._id,
                status: "active"
            })
            .populate("course")
            .sort({
                dayOfWeek: 1,
                startTime: 1
            });


        // -------------------------------------------------
        // Add enrollment information
        // -------------------------------------------------

        const slotsWithEnrollmentCount =
            await Promise.all(

                teachingSlots.map(async (slot) => {

                    const enrolledStudents =
                        await Enrollment.countDocuments({
                            teachingSlot: slot._id,
                            status: "active"
                        });


                    return {
                        ...slot.toObject(),

                        enrolledStudents,

                        availableSeats:
                            Math.max(
                                slot.maxStudents -
                                enrolledStudents,
                                0
                            )
                    };

                })

            );


        return res.status(200).json({

            message:
                "Your teaching slots fetched successfully",

            count:
                slotsWithEnrollmentCount.length,

            teachingSlots:
                slotsWithEnrollmentCount

        });

    } catch (error) {

        console.error(
            "GET MY TEACHING SLOTS ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch my teaching slots"
        });

    }
};