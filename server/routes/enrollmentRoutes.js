import express from "express";

import {
    createEnrollment,
    getEnrollments,
    getEnrollmentById,
    pauseEnrollment,
    resumeEnrollment
} from "../controllers/enrollmentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    permissionMiddleware("enrollments"),
    createEnrollment
);

router.get(
    "/",
    authMiddleware,
    permissionMiddleware("enrollments"),
    getEnrollments
);

router.get(
    "/:id",
    authMiddleware,
    permissionMiddleware("enrollments"),
    getEnrollmentById
);

router.patch(
    "/:id/pause",
    authMiddleware,
    permissionMiddleware("enrollments"),
    pauseEnrollment
);

router.patch(
    "/:id/resume",
    authMiddleware,
    permissionMiddleware("enrollments"),
    resumeEnrollment
);

export default router;