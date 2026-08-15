import express from "express";

import {
    createStudent,
    getStudents,
    getStudentById
} from "../controllers/studentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createStudent
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getStudents
);

// Get a single student
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    getStudentById
);

export default router;