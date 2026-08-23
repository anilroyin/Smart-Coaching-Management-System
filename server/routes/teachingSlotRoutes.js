import express from "express";

import {
    createTeachingSlot,
    getTeachingSlots,
    createMultipleTeachingSlots,
    getTeachingSlotsByTeacher
} from "../controllers/teachingSlotController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Create a teaching slot
router.post(
    "/",
    authMiddleware,
    permissionMiddleware("teachingSlots"),
    createTeachingSlot
);

// Create multiple teaching slots
router.post(
    "/bulk",
    authMiddleware,
    permissionMiddleware("teachingSlots"),
    createMultipleTeachingSlots
);

// Get all teaching slots
router.get(
    "/",
    authMiddleware,
    permissionMiddleware("teachingSlots"),
    getTeachingSlots
);

// Get teaching slots of a particular teacher
router.get(
    "/teacher/:teacherId",
    authMiddleware,
    permissionMiddleware("teachingSlots"),
    getTeachingSlotsByTeacher
);

export default router;