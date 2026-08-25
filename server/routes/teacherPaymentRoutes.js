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
// ADMIN — GET ALL TEACHER PAYMENTS
// =====================================================

router.get(
    "/",
    authMiddleware,
    permissionMiddleware("teachers"),
    getTeacherPayments
);


// =====================================================
// ADMIN — GET PAYMENT HISTORY OF ONE TEACHER
// =====================================================

router.get(
    "/teacher/:teacherId",
    authMiddleware,
    permissionMiddleware("teachers"),
    getTeacherPaymentsByTeacher
);


// =====================================================
// ADMIN — GENERATE MONTHLY TEACHER PAYMENT
// =====================================================

router.post(
    "/generate",
    authMiddleware,
    permissionMiddleware("teachers"),
    generateTeacherPayment
);


// =====================================================
// ADMIN — UPDATE TEACHER PAYMENT
// Mark paid / due, payment date and method
// =====================================================

router.put(
    "/:id",
    authMiddleware,
    permissionMiddleware("teachers"),
    updateTeacherPayment
);


// =====================================================
// TEACHER — VIEW OWN PAYMENT HISTORY
// Read only
// =====================================================

router.get(
    "/my",
    authMiddleware,
    getMyTeacherPayments
);


export default router;