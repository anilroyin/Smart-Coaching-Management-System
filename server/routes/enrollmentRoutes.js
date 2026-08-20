import express from "express";

import { createEnrollment,
        getEnrollments,
        getEnrollmentById,
        pauseEnrollment,
        resumeEnrollment
} from "../controllers/enrollmentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createEnrollment
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getEnrollments
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    getEnrollmentById
);

router.patch(
    "/:id/pause",
    authMiddleware,
    roleMiddleware("admin"),
    pauseEnrollment
);

router.patch(
    "/:id/resume",
    authMiddleware,
    roleMiddleware("admin"),
    resumeEnrollment
);
export default router;