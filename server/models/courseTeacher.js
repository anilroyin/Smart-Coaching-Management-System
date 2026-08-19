import mongoose from "mongoose";

const courseTeacherSchema = new mongoose.Schema(
    {
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

courseTeacherSchema.index(
    { course: 1, teacher: 1 },
    { unique: true }
);

const CourseTeacher = mongoose.model(
    "CourseTeacher",
    courseTeacherSchema
);

export default CourseTeacher;