import express from "express";

import {
    createNotification,
    getAllNotifications,
    getMyNotifications,
    markNotificationsAsRead,
    deleteNotification
} from "../controllers/notificationController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";


const router = express.Router();


// =====================================================
// SUPER ADMIN — GET ALL NOTIFICATIONS
// =====================================================

router.get(
    "/",
    authMiddleware,
    permissionMiddleware("notifications"),
    getAllNotifications
);


// =====================================================
// SUPER ADMIN — CREATE NOTIFICATION
// =====================================================

router.post(
    "/",
    authMiddleware,
    permissionMiddleware("notifications"),
    createNotification
);


// =====================================================
// ADMIN / TEACHER / STUDENT — GET THEIR NOTIFICATIONS
// =====================================================

router.get(
    "/my",
    authMiddleware,
    getMyNotifications
);


// =====================================================
// ADMIN / TEACHER / STUDENT — MARK NOTIFICATIONS AS READ
// =====================================================

router.put(
    "/read",
    authMiddleware,
    markNotificationsAsRead
);


// =====================================================
// SUPER ADMIN — DELETE NOTIFICATION
// =====================================================

router.delete(
    "/:id",
    authMiddleware,
    permissionMiddleware("notifications"),
    deleteNotification
);


export default router;