import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/user.js";
import Student from "../models/student.js";

export const createStudent = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            studentId,
            phone,
            dateOfBirth,
            address,
            guardianName,
            guardianPhone
        } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        const existingStudent = await Student.findOne({ studentId });

        if (existingStudent) {
            return res.status(409).json({
                message: "Student ID already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "student"
        });

        try {
            const student = await Student.create({
                user: user._id,
                studentId,
                phone,
                dateOfBirth,
                address,
                guardianName,
                guardianPhone
            });

            res.status(201).json({
                message: "Student created successfully",
                student: {
                    id: student._id,
                    studentId: student.studentId,
                    name: user.name,
                    email: user.email
                }
            });
        } catch (error) {
            await User.findByIdAndDelete(user._id);
            throw error;
        }
    }  catch (error) {
    console.error("CREATE STUDENT ERROR:", error);

    return res.status(500).json({
        message: "Failed to create student"
    });
}
};

export const getStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .populate("user", "name email isActive")
            .select("-__v");

        res.status(200).json({
            message: "Students fetched successfully",
            count: students.length,
            students
        });
    } catch (error) {
        console.error("GET STUDENTS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch students"
        });
    }
};

export const getStudentById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid student ID"
            });
        }

        const student = await Student.findById(req.params.id)
            .populate("user", "name email isActive");

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student fetched successfully",
            student
        });
    } catch (error) {
        console.error("GET STUDENT ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch student"
        });
    }
};

export const updateStudent = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid student ID"
            });
        }

        const allowedFields = [
            "phone",
            "dateOfBirth",
            "address",
            "guardianName",
            "guardianPhone",
            "status"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        ).populate("user", "name email isActive");

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student updated successfully",
            student
        });
    } catch (error) {
        console.error("UPDATE STUDENT ERROR:", error);

        res.status(500).json({
            message: "Failed to update student"
        });
    }
};

export const updateStudentStatus = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid student ID"
            });
        }

        const { status } = req.body;

        if (!["active", "paused", "inactive"].includes(status)) {
            return res.status(400).json({
                message: "Invalid student status"
            });
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                new: true,
                runValidators: true
            }
        ).populate("user", "name email isActive");

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student status updated successfully",
            student
        });
    } catch (error) {
        console.error("UPDATE STUDENT STATUS ERROR:", error);

        res.status(500).json({
            message: "Failed to update student status"
        });
    }
};