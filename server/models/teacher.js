import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        teacherId: {
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

        specialization: {
            type: String,
            trim: true
        },

        joiningDate: {
            type: Date
        },

        dateOfBirth: {
            type: Date
        },

        address: {
            type: String,
            trim: true
        },

        monthlyPayment: {
            type: Number,
            min: 0
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

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;