import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true
        },

        monthlyFee: {
            type: Number,
            required: true,
            min: 0
        },

        startDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["active", "paused", "completed", "cancelled"],
            default: "active"
        },

        pausedAt: {
            type: Date
        },

        resumedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;