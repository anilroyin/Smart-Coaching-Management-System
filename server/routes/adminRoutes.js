import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    createAdmin,
    getAdmins,
    getAdminById,
    updateAdminPermissions,
    updateAdminStatus
} from "../controllers/adminController.js";

const router = express.Router();

// All Admin Management routes require authentication
router.use(authMiddleware);

// Create Admin
router.post("/", createAdmin);

// Get all Admins
router.get("/", getAdmins);

// Get Admin by ID
router.get("/:id", getAdminById);

// Update Admin permissions
router.patch("/:id/permissions", updateAdminPermissions);

// Activate / Deactivate Admin
router.patch("/:id/status", updateAdminStatus);

export default router;