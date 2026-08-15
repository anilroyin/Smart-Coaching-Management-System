import express from "express";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
    res.send("SCMS API is running");
});

app.use("/api/auth", authRoutes);

export default app;