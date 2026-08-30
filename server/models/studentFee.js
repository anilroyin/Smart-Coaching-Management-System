import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
    {
        // -------------------------------------------------
        // Student enrollment this fee belongs to
        // -------------------------------------------------

        enrollment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Enrollment",
            required: true
        },


        // -------------------------------------------------
        // Student
        // -------------------------------------------------

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },


        // -------------------------------------------------
        // Fee month
        // Example: August 2026
        // -------------------------------------------------

        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        },

        year: {
            type: Number,
            required: true
        },


        // -------------------------------------------------
        // Monthly fee amount
        //
        // Saved separately so old fee history does not
        // change if the enrollment fee changes later.
        // -------------------------------------------------

        amount: {
            type: Number,
            required: true,
            min: 0
        },


        // -------------------------------------------------
        // Fee status
        // -------------------------------------------------

        status: {
            type: String,
            enum: ["paid", "due"],
            default: "due"
        },


        // -------------------------------------------------
        // Actual payment date
        // Only present when the fee is paid.
        // -------------------------------------------------

        paidAt: {
            type: Date
        },


        // -------------------------------------------------
        // Payment method
        // -------------------------------------------------

        paymentMethod: {
            type: String,
            enum: [
                "cash",
                "upi",
                "bank_transfer",
                "card",
                "other"
            ]
        },


        // -------------------------------------------------
        // Optional transaction/reference number
        // -------------------------------------------------

        transactionId: {
            type: String,
            trim: true
        },


        // -------------------------------------------------
        // Optional admin note
        // -------------------------------------------------

        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);


// ---------------------------------------------------------
// Prevent duplicate fee records for the same
// enrollment + month + year.
// ---------------------------------------------------------

feeSchema.index(
    {
        enrollment: 1,
        month: 1,
        year: 1
    },
    {
        unique: true
    }
);


// ---------------------------------------------------------
// Fee model
// ---------------------------------------------------------

const Fee = mongoose.model(
    "Fee",
    feeSchema
);

export default Fee;