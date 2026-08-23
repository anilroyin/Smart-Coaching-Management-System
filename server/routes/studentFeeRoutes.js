import express from "express";

import {
    createPayment,
    getPaymentsByStudent,
    getPaymentsByEnrollment,
    updatePayment
} from "../controllers/studentFeeController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();


// =====================================================
// CREATE PAYMENT
// =====================================================

router.post(
    "/",
    authMiddleware,
    permissionMiddleware("enrollments"),
    createPayment
);


// =====================================================
// GET PAYMENTS BY STUDENT
// =====================================================

router.get(
    "/student/:studentId",
    authMiddleware,
    permissionMiddleware("students"),
    getPaymentsByStudent
);


// =====================================================
// GET PAYMENTS BY ENROLLMENT
// =====================================================

router.get(
    "/enrollment/:enrollmentId",
    authMiddleware,
    permissionMiddleware("enrollments"),
    getPaymentsByEnrollment
);


// =====================================================
// UPDATE PAYMENT
// =====================================================

router.put(
    "/:id",
    authMiddleware,
    permissionMiddleware("enrollments"),
    updatePayment
);


export default router;