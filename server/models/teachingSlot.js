import mongoose from "mongoose";

const teachingSlotSchema = new mongoose.Schema(
    {
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        className: {
            type: String,
            required: true,
            trim: true
        },

        dayOfWeek: {
            type: String,
            enum: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ],
            required: true
        },

        startTime: {
            type: String,
            required: true
        },

        endTime: {
            type: String,
            required: true
        },

        maxStudents: {
            type: Number,
            default: 15,
            min: 1
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

const TeachingSlot = mongoose.model(
    "TeachingSlot",
    teachingSlotSchema
);

export default TeachingSlot;