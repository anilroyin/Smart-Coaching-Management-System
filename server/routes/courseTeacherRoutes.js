import express from "express";

import {
    assignTeacherToCourse,
    getCoursesByTeacher
} from "../controllers/courseTeacherController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Get courses assigned to a particular teacher

router.get(
    "/teacher/:teacherId",
    authMiddleware,
    permissionMiddleware("teachers"),
    getCoursesByTeacher
);

router.post(
    "/",
    authMiddleware,
    permissionMiddleware("teachers"),
    assignTeacherToCourse
);

export default router;