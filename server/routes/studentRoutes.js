import express from "express";
import {
    createStudent,
    getStudents
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

export default router;