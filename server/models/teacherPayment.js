import mongoose from "mongoose";

const teacherPaymentSchema = new mongoose.Schema(
    {
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: true
        },

        year: {
            type: Number,
            required: true,
            min: 2000
        },

        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        },

        totalFees: {
            type: Number,
            required: true,
            min: 0
        },

        commissionPercent: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },

        commissionAmount: {
            type: Number,
            required: true,
            min: 0
        },

        teacherPayment: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: ["due", "paid"],
            default: "due"
        },

        paidOn: {
            type: Date
        },

        method: {
            type: String,
            enum: ["cash", "upi", "bank"],
            default: null
        }
    },
    {
        timestamps: true
    }
);


// =====================================================
// ONE PAYMENT RECORD PER TEACHER PER MONTH
// =====================================================

teacherPaymentSchema.index(
    {
        teacher: 1,
        year: 1,
        month: 1
    },
    {
        unique: true
    }
);


const TeacherPayment =
    mongoose.model(
        "TeacherPayment",
        teacherPaymentSchema
    );


export default TeacherPayment;