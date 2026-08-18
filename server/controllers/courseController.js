import Course from "../models/course.js";

export const createCourse = async (req, res) => {
    try {
        const { name, description, monthlyFee } = req.body;

        const existingCourse = await Course.findOne({ name });

        if (existingCourse) {
            return res.status(409).json({
                message: "Course already exists"
            });
        }

        const course = await Course.create({
            name,
            description,
            monthlyFee
        });

        res.status(201).json({
            message: "Course created successfully",
            course
        });
    } catch (error) {
        console.error("CREATE COURSE ERROR:", error);

        res.status(500).json({
            message: "Failed to create course"
        });
    }
};

export const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort({ name: 1 });

        res.status(200).json({
            message: "Courses fetched successfully",
            count: courses.length,
            courses
        });
    } catch (error) {
        console.error("GET COURSES ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch courses"
        });
    }
};