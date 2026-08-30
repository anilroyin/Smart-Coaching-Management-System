import express from "express";

import {
    createTeachingSlot,
    getTeachingSlots,
    createMultipleTeachingSlots,
    getTeachingSlotsByTeacher,
    getMyTeachingSlots
} from "../controllers/teachingSlotController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import permissionMiddleware
    from "../middleware/permissionMiddleware.js";


const router = express.Router();


// =====================================================
// CREATE TEACHING SLOT
// ADMIN / PERMITTED USERS
// =====================================================

router.post(
    "/",
    authMiddleware,
    permissionMiddleware("teachingSlots"),
    createTeachingSlot
);


// =====================================================
// CREATE MULTIPLE TEACHING SLOTS
// =====================================================

router.post(
    "/bulk",
    authMiddleware,
    permissionMiddleware("teachingSlots"),
    createMultipleTeachingSlots
);


// =====================================================
// GET ALL TEACHING SLOTS
// ADMIN / PERMITTED USERS
// =====================================================

router.get(
    "/",
    authMiddleware,
    permissionMiddleware("teachingSlots"),
    getTeachingSlots
);


// =====================================================
// GET LOGGED-IN TEACHER'S TEACHING SLOTS
// TEACHER'S OWN SCHEDULE
// =====================================================

router.get(
    "/me",
    authMiddleware,
    getMyTeachingSlots
);


// =====================================================
// GET TEACHING SLOTS BY TEACHER
// ADMIN / PERMITTED USERS
// =====================================================

router.get(
    "/teacher/:teacherId",
    authMiddleware,
    permissionMiddleware("teachingSlots"),
    getTeachingSlotsByTeacher
);


export default router;