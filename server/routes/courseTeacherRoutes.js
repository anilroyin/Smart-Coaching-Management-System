import express from "express";
import { assignTeacherToCourse } from "../controllers/courseTeacherController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    assignTeacherToCourse
);

export default router;