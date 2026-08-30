import bcrypt from "bcrypt";
import User from "../models/user.js";
import Teacher from "../models/teacher.js";
import mongoose from "mongoose";


// =====================================================
// CREATE TEACHER
// =====================================================

export const createTeacher = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            teacherId,
            phone,
            specialization,
            joiningDate,
            dateOfBirth,
            address
        } = req.body;


        // -------------------------------------------------
        // Check whether email already exists
        // -------------------------------------------------

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }


        // -------------------------------------------------
        // Check whether teacher ID already exists
        // -------------------------------------------------

        const existingTeacher =
            await Teacher.findOne({ teacherId });

        if (existingTeacher) {
            return res.status(409).json({
                message: "Teacher ID already exists"
            });
        }


        // -------------------------------------------------
        // Hash password
        // -------------------------------------------------

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // -------------------------------------------------
        // Create User account
        // -------------------------------------------------

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "teacher"
        });


        try {

            // -------------------------------------------------
            // Create Teacher profile
            // -------------------------------------------------

            const teacher = await Teacher.create({
                user: user._id,
                teacherId,
                phone,
                specialization,
                joiningDate,
                dateOfBirth,
                address
            });


            // -------------------------------------------------
            // Return created teacher
            // -------------------------------------------------

            return res.status(201).json({
                message:
                    "Teacher created successfully",

                teacher: {
                    id: teacher._id,
                    teacherId: teacher.teacherId,
                    name: user.name,
                    email: user.email,
                    phone: teacher.phone,
                    specialization:
                        teacher.specialization,
                    joiningDate:
                        teacher.joiningDate,
                    dateOfBirth:
                        teacher.dateOfBirth,
                    address:
                        teacher.address,
                    status:
                        teacher.status
                }
            });

        } catch (teacherError) {

            // If Teacher creation fails,
            // remove the User account

            await User.findByIdAndDelete(
                user._id
            );

            throw teacherError;
        }

    } catch (error) {

        console.error(
            "CREATE TEACHER ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to create teacher"
        });
    }
};


// =====================================================
// GET ALL TEACHERS
// =====================================================

export const getTeachers = async (req, res) => {
    try {

        const teachers = await Teacher.find()
            .populate(
                "user",
                "name email isActive"
            )
            .select("-__v");


        res.status(200).json({
            message:
                "Teachers fetched successfully",

            count: teachers.length,

            teachers
        });

    } catch (error) {

        console.error(
            "GET TEACHERS ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch teachers"
        });
    }
};


// =====================================================
// GET TEACHER BY ID
// =====================================================

export const getTeacherById = async (req, res) => {
    try {

        if (
            !mongoose.Types.ObjectId.isValid(
                req.params.id
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid teacher ID"
            });
        }


        const teacher =
            await Teacher.findById(
                req.params.id
            ).populate(
                "user",
                "name email isActive"
            );


        if (!teacher) {
            return res.status(404).json({
                message:
                    "Teacher not found"
            });
        }


        res.status(200).json({
            message:
                "Teacher fetched successfully",

            teacher
        });

    } catch (error) {

        console.error(
            "GET TEACHER ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch teacher"
        });
    }
};

// =====================================================
// GET LOGGED-IN TEACHER PROFILE
// =====================================================

export const getMyTeacherProfile = async (req, res) => {
    try {

        const teacher = await Teacher.findOne({
            user: req.user._id
        })
        .populate(
            "user",
            "name email isActive"
        )
        .select("-__v");


        if (!teacher) {
            return res.status(404).json({
                message:
                    "Teacher profile not found"
            });
        }


        return res.status(200).json({
            message:
                "Teacher profile fetched successfully",

            teacher
        });

    } catch (error) {

        console.error(
            "GET MY TEACHER PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch teacher profile"
        });
    }
};

// =====================================================
// UPDATE TEACHER
// =====================================================

export const updateTeacher = async (req, res) => {
    try {

        if (
            !mongoose.Types.ObjectId.isValid(
                req.params.id
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid teacher ID"
            });
        }


        // Fields that can be updated
        const allowedFields = [
            "phone",
            "specialization",
            "joiningDate",
            "dateOfBirth",
            "address",
            "status"
        ];


        const updates = {};


        for (const field of allowedFields) {

            if (
                req.body[field] !== undefined
            ) {
                updates[field] =
                    req.body[field];
            }
        }


        const teacher =
            await Teacher.findByIdAndUpdate(
                req.params.id,
                updates,
                {
                    new: true,
                    runValidators: true
                }
            ).populate(
                "user",
                "name email isActive"
            );


        if (!teacher) {
            return res.status(404).json({
                message:
                    "Teacher not found"
            });
        }


        res.status(200).json({
            message:
                "Teacher updated successfully",

            teacher
        });

    } catch (error) {

        console.error(
            "UPDATE TEACHER ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update teacher"
        });
    }
};


// =====================================================
// UPDATE TEACHER STATUS
// =====================================================

export const updateTeacherStatus = async (
    req,
    res
) => {
    try {

        if (
            !mongoose.Types.ObjectId.isValid(
                req.params.id
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid teacher ID"
            });
        }


        const { status } = req.body;


        // Teacher status can be:
        // active, paused or inactive

        if (
            ![
                "active",
                "paused",
                "inactive"
            ].includes(status)
        ) {
            return res.status(400).json({
                message:
                    "Invalid teacher status"
            });
        }


        const teacher =
            await Teacher.findByIdAndUpdate(
                req.params.id,
                { status },
                {
                    new: true,
                    runValidators: true
                }
            ).populate(
                "user",
                "name email isActive"
            );


        if (!teacher) {
            return res.status(404).json({
                message:
                    "Teacher not found"
            });
        }


        res.status(200).json({
            message:
                "Teacher status updated successfully",

            teacher
        });

    } catch (error) {

        console.error(
            "UPDATE TEACHER STATUS ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update teacher status"
        });
    }
};