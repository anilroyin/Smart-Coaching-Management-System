import express from "express";
import { createTeacher,
         getTeachers,
         getTeacherById,
         updateTeacher,
         updateTeacherStatus
 } from "../controllers/teacherController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createTeacher
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getTeachers
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    getTeacherById
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateTeacher
);

router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateTeacherStatus
);
export default router;