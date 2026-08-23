import express from "express";

import {
    createTeacher,
    getTeachers,
    getTeacherById,
    updateTeacher,
    updateTeacherStatus
} from "../controllers/teacherController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    permissionMiddleware("teachers"),
    createTeacher
);

router.get(
    "/",
    authMiddleware,
    permissionMiddleware("teachers"),
    getTeachers
);

router.get(
    "/:id",
    authMiddleware,
    permissionMiddleware("teachers"),
    getTeacherById
);

router.put(
    "/:id",
    authMiddleware,
    permissionMiddleware("teachers"),
    updateTeacher
);

router.patch(
    "/:id/status",
    authMiddleware,
    permissionMiddleware("teachers"),
    updateTeacherStatus
);

export default router;