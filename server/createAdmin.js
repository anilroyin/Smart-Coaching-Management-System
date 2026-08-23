import "dotenv/config";
import bcrypt from "bcrypt";
import connectDB from "./config/db.js";
import User from "./models/user.js";

const createAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = process.env.ADMIN_EMAIL;

        // Check whether the Main Admin account already exists
        const existingUser = await User.findOne({
            email: adminEmail
        });

        if (existingUser) {

            // Make sure the configured main admin is actually
            // the Super Admin
            if (existingUser.role !== "super_admin") {
                existingUser.role = "super_admin";
                existingUser.isActive = true;

                await existingUser.save();

                console.log("Existing account promoted to Super Admin");
            } else {
                console.log("Super Admin account already exists");
            }

            process.exit(0);
        }

        // Create password only when creating a new account
        const password = await bcrypt.hash(
            process.env.ADMIN_PASSWORD,
            10
        );

        await User.create({
            name: process.env.ADMIN_NAME,
            email: adminEmail,
            password,
            role: "super_admin",
            isActive: true
        });

        console.log("Super Admin account created");

        process.exit(0);

    } catch (error) {
        console.error(
            "Failed to create Super Admin:",
            error.message
        );

        process.exit(1);
    }
};

createAdmin();