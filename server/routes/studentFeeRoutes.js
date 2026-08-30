import express from "express";

import {
    createFee,
    getAllFees,
    getFeesByStudent,
    getFeesByEnrollment,
    getFeesByTeacher,
    updateFee
} from "../controllers/studentFeeController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();


// =====================================================
// SUPER ADMIN / ADMIN — GET ALL STUDENT FEES
// =====================================================

router.get(
    "/",
    authMiddleware,
    permissionMiddleware("studentFees"),
    getAllFees
);


// =====================================================
// SUPER ADMIN / ADMIN — CREATE FEE
// =====================================================

router.post(
    "/",
    authMiddleware,
    permissionMiddleware("studentFees"),
    createFee
);


// =====================================================
// STUDENT / ADMIN — GET FEES BY STUDENT
// =====================================================

router.get(
    "/student/:studentId",
    authMiddleware,
    getFeesByStudent
);


// =====================================================
// ADMIN — GET FEES BY ENROLLMENT
// =====================================================

router.get(
    "/enrollment/:enrollmentId",
    authMiddleware,
    permissionMiddleware("enrollments"),
    getFeesByEnrollment
);


// =====================================================
// TEACHER — VIEW FEES OF CURRENT STUDENTS
// READ ONLY
// =====================================================

router.get(
    "/teacher/my",
    authMiddleware,
    getFeesByTeacher
);


// =====================================================
// SUPER ADMIN / ADMIN — UPDATE FEE
// =====================================================

router.put(
    "/:id",
    authMiddleware,
    permissionMiddleware("studentFees"),
    updateFee
);


export default router;