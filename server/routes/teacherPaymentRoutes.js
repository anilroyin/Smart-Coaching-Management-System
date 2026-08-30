import express from "express";

import {
    generateTeacherPayment,
    getTeacherPayments,
    getTeacherPaymentsByTeacher,
    updateTeacherPayment,
    getMyTeacherPayments
} from "../controllers/teacherPaymentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";


const router = express.Router();


// =====================================================
// SUPER ADMIN — GET ALL TEACHER PAYMENTS
// =====================================================

router.get(
    "/",
    authMiddleware,
    permissionMiddleware(
        "teacherPayments",
        {
            superAdminOnly: true
        }
    ),
    getTeacherPayments
);


// =====================================================
// SUPER ADMIN — GET PAYMENT HISTORY OF ONE TEACHER
// =====================================================

router.get(
    "/teacher/:teacherId",
    authMiddleware,
    permissionMiddleware(
        "teacherPayments",
        {
            superAdminOnly: true
        }
    ),
    getTeacherPaymentsByTeacher
);


// =====================================================
// SUPER ADMIN — GENERATE MONTHLY TEACHER PAYMENT
// =====================================================

router.post(
    "/generate",
    authMiddleware,
    permissionMiddleware(
        "teacherPayments",
        {
            superAdminOnly: true
        }
    ),
    generateTeacherPayment
);


// =====================================================
// SUPER ADMIN — UPDATE TEACHER PAYMENT
//
// Mark paid / due
// Set payment date
// Set payment method
// =====================================================

router.put(
    "/:id",
    authMiddleware,
    permissionMiddleware(
        "teacherPayments",
        {
            superAdminOnly: true
        }
    ),
    updateTeacherPayment
);


// =====================================================
// TEACHER — VIEW OWN PAYMENT HISTORY
//
// Read only
// =====================================================

router.get(
    "/my",
    authMiddleware,
    getMyTeacherPayments
);


export default router;