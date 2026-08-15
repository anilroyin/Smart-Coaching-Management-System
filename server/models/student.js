import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        studentId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        dateOfBirth: {
            type: Date
        },

        address: {
            type: String,
            trim: true
        },

        guardianName: {
            type: String,
            required: true,
            trim: true
        },

        guardianPhone: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["active", "paused", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;