import express from "express";

import {
    createCourse,
    getCourses
} from "../controllers/courseController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    permissionMiddleware("courses"),
    createCourse
);

router.get(
    "/",
    authMiddleware,
    permissionMiddleware("courses"),
    getCourses
);

export default router;