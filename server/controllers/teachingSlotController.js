import TeachingSlot from "../models/teachingSlot.js";
import Teacher from "../models/teacher.js";
import Course from "../models/course.js";
import CourseTeacher from "../models/courseTeacher.js";

// CREATE TEACHING SLOT
export const createTeachingSlot = async (req, res) => {
    try {
        const {
            teacherId,
            courseId,
            dayOfWeek,
            startTime,
            endTime,
            maxStudents
        } = req.body;

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
            dayOfWeek,
            startTime,
            endTime,
            maxStudents: maxStudents || 15
        });

        // Return populated data
        const populatedSlot = await TeachingSlot.findById(
            teachingSlot._id
        )
            .populate("teacher")
            .populate("course");

        res.status(201).json({
            message: "Teaching slot created successfully",
            teachingSlot: populatedSlot
        });

    } catch (error) {
        console.error("CREATE TEACHING SLOT ERROR:", error);

        res.status(500).json({
            message: "Failed to create teaching slot"
        });
    }
};

export const getTeachingSlots = async (req, res) => {
    try {
        const teachingSlots = await TeachingSlot.find({
            status: "active"
        })
            .populate("teacher")
            .populate("course")
            .sort({
                dayOfWeek: 1,
                startTime: 1
            });

        res.status(200).json({
            message: "Teaching slots fetched successfully",
            teachingSlots
        });

    } catch (error) {
        console.error("GET TEACHING SLOTS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch teaching slots"
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

        for (const slot of slots) {
            const {
                courseId,
                dayOfWeek,
                startTime,
                endTime,
                maxStudents
            } = slot;

            // Check course exists and is active
            const course = await Course.findOne({
                _id: courseId,
                status: "active"
            });

            if (!course) {
                return res.status(404).json({
                    message: `Course not found: ${courseId}`
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
                    message: `Teacher is not assigned to course: ${course.name}`
                });
            }

            // Check duplicate slot
            const existingSlot = await TeachingSlot.findOne({
                teacher: teacherId,
                course: courseId,
                dayOfWeek,
                startTime,
                endTime,
                status: "active"
            });

            if (existingSlot) {
                return res.status(409).json({
                    message: `Slot already exists: ${dayOfWeek} ${startTime}-${endTime}`
                });
            }

            // Create slot
            const teachingSlot = await TeachingSlot.create({
                teacher: teacherId,
                course: courseId,
                dayOfWeek,
                startTime,
                endTime,
                maxStudents: maxStudents || 15
            });

            createdSlots.push(teachingSlot);
        }

        // Populate teacher and course information
        const populatedSlots = await TeachingSlot.find({
            _id: {
                $in: createdSlots.map(slot => slot._id)
            }
        })
            .populate("teacher")
            .populate("course");

        res.status(201).json({
            message: "Teaching slots created successfully",
            teachingSlots: populatedSlots
        });

    } catch (error) {
        console.error("CREATE MULTIPLE TEACHING SLOTS ERROR:", error);

        res.status(500).json({
            message: "Failed to create teaching slots"
        });
    }
};