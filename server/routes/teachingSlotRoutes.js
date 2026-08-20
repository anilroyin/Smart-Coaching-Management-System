import express from "express";
import {
    createTeachingSlot,
    getTeachingSlots,
    createMultipleTeachingSlots
} from "../controllers/teachingSlotController.js";

const router = express.Router();

// Create a teaching slot
router.post("/", createTeachingSlot);
router.post("/bulk", createMultipleTeachingSlots);
router.get("/", getTeachingSlots);

export default router;