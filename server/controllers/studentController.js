import bcrypt from "bcrypt";
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