import express from "express";
import cors from "cors";
import authRoutes from "./routes/userAuthRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import courseTeacherRoutes from "./routes/courseTeacherRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import teachingSlotRoutes from "./routes/teachingSlotRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentFeeRoutes from "./routes/studentFeeRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import teacherPaymentRoutes from "./routes/teacherPaymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173"
    })
);

app.use(express.json());

app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/course-teachers", courseTeacherRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/teaching-slots", teachingSlotRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/student-fees", studentFeeRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/teacher-payments", teacherPaymentRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
    res.send("SCMS API is running");
});

app.use("/api/auth", authRoutes);

export default app;