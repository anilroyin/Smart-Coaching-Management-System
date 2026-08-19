import express from "express";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import courseTeacherRoutes from "./routes/courseTeacherRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/course-teachers", courseTeacherRoutes);
app.use("/api/enrollments", enrollmentRoutes);

app.get("/", (req, res) => {
    res.send("SCMS API is running");
});

app.use("/api/auth", authRoutes);

export default app;