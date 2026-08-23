import express from "express";

import {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    updateStudentStatus
} from "../controllers/studentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    permissionMiddleware("students"),
    createStudent
);

router.get(
    "/",
    authMiddleware,
    permissionMiddleware("students"),
    getStudents
);

// Get a single student
router.get(
    "/:id",
    authMiddleware,
    permissionMiddleware("students"),
    getStudentById
);

// Update a student
router.put(
    "/:id",
    authMiddleware,
    permissionMiddleware("students"),
    updateStudent
);

router.patch(
    "/:id/status",
    authMiddleware,
    permissionMiddleware("students"),
    updateStudentStatus
);

export default router;