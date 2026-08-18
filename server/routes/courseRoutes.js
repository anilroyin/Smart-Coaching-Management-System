import express from "express";
import { createCourse,
         getCourses

} from "../controllers/courseController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createCourse
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getCourses
);

export default router;