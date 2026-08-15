import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/user.js";

const createAdmin = async () => {
    try {
        await connectDB();

        const existingAdmin = await User.findOne({ role: "admin" });

        if (existingAdmin) {
            console.log("Admin account already exists");
            process.exit();
        }

        const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

        await User.create({
            name: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            password,
            role: "admin"
        });

        console.log("Admin account created");
        process.exit();
    } catch (error) {
        console.error("Failed to create admin:", error.message);
        process.exit(1);
    }
};

createAdmin();