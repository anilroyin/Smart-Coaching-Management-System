import express from "express";

import {
    getSettings,
    updateSettings
} from "../controllers/settingsController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();


// =====================================================
// GET SETTINGS
// =====================================================

router.get(
    "/",
    authMiddleware,
    permissionMiddleware("settings"),
    getSettings
);


// =====================================================
// UPDATE SETTINGS
// =====================================================

router.put(
    "/",
    authMiddleware,
    permissionMiddleware("settings"),
    updateSettings
);


export default router;