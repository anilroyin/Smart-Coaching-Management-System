import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/user.js";

const allowedPermissions = [
    "students",
    "teachers",
    "courses",
    "teachingSlots",
    "enrollments",
    "fees",
    "settings"
];

// CREATE ADMIN
export const createAdmin = async (req, res) => {
    try {
        // Only Super Admin can create Admins
        if (req.user.role !== "super_admin") {
            return res.status(403).json({
                message: "Only the Main Admin can create Admins"
            });
        }

        const {
            name,
            email,
            password,
            permissions
        } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        // Check maximum 5 active Admins
        const activeAdminCount = await User.countDocuments({
            role: "admin",
            isActive: true
        });

        if (activeAdminCount >= 5) {
            return res.status(409).json({
                message: "Maximum of 5 active Admins already exists"
            });
        }

        // Check email
        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // Build permissions
        const adminPermissions = {};

        for (const permission of allowedPermissions) {
            adminPermissions[permission] =
                permissions?.[permission] === true;
        }

        const admin = await User.create({
            name,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: "admin",
            isActive: true,
            permissions: adminPermissions
        });

        res.status(201).json({
            message: "Admin created successfully",
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                isActive: admin.isActive,
                permissions: admin.permissions
            }
        });

    } catch (error) {
        console.error("CREATE ADMIN ERROR:", error);

        res.status(500).json({
            message: "Failed to create Admin"
        });
    }
};


// GET ALL ADMINS
export const getAdmins = async (req, res) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({
                message: "Only the Main Admin can view Admins"
            });
        }

        const admins = await User.find({
            role: "admin"
        })
            .select("-password")
            .sort({ createdAt: 1 });

        res.status(200).json({
            message: "Admins fetched successfully",
            count: admins.length,
            admins
        });

    } catch (error) {
        console.error("GET ADMINS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch Admins"
        });
    }
};


// GET ADMIN BY ID
export const getAdminById = async (req, res) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({
                message: "Only the Main Admin can view Admin details"
            });
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Admin ID"
            });
        }

        const admin = await User.findOne({
            _id: id,
            role: "admin"
        }).select("-password");

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        res.status(200).json({
            message: "Admin fetched successfully",
            admin
        });

    } catch (error) {
        console.error("GET ADMIN ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch Admin"
        });
    }
};


// UPDATE ADMIN PERMISSIONS
export const updateAdminPermissions = async (req, res) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({
                message: "Only the Main Admin can change permissions"
            });
        }

        const { id } = req.params;
        const { permissions } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Admin ID"
            });
        }

        if (!permissions || typeof permissions !== "object") {
            return res.status(400).json({
                message: "Permissions object is required"
            });
        }

        const admin = await User.findOne({
            _id: id,
            role: "admin"
        });

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        for (const permission of allowedPermissions) {
            if (permissions[permission] !== undefined) {
                admin.permissions[permission] =
                    permissions[permission] === true;
            }
        }

        await admin.save();

        res.status(200).json({
            message: "Admin permissions updated successfully",
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                isActive: admin.isActive,
                permissions: admin.permissions
            }
        });

    } catch (error) {
        console.error(
            "UPDATE ADMIN PERMISSIONS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to update Admin permissions"
        });
    }
};


// UPDATE ADMIN STATUS
export const updateAdminStatus = async (req, res) => {
    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({
                message: "Only the Main Admin can change Admin status"
            });
        }

        const { id } = req.params;
        const { isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Admin ID"
            });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be true or false"
            });
        }

        const admin = await User.findOne({
            _id: id,
            role: "admin"
        });

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        admin.isActive = isActive;

        await admin.save();

        res.status(200).json({
            message: isActive
                ? "Admin activated successfully"
                : "Admin deactivated successfully",

            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                isActive: admin.isActive,
                permissions: admin.permissions
            }
        });

    } catch (error) {
        console.error(
            "UPDATE ADMIN STATUS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to update Admin status"
        });
    }
};