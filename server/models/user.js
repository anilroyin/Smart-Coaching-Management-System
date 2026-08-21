import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["super_admin", "admin", "teacher", "student"],
            required: true
        },

        isActive: {
            type: Boolean,
            default: true
        },

        permissions: {
            students: {
                type: Boolean,
                default: false
            },

            teachers: {
                type: Boolean,
                default: false
            },

            courses: {
                type: Boolean,
                default: false
            },

            teachingSlots: {
                type: Boolean,
                default: false
            },

            enrollments: {
                type: Boolean,
                default: false
            },

            fees: {
                type: Boolean,
                default: false
            },

            settings: {
                type: Boolean,
                default: false
            }
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

export default User;