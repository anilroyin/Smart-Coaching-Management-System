import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        // -------------------------------------------------
        // Student enrollment this payment belongs to
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
        // Payment month
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
        // Amount for this particular month
        // This is saved separately so old payment history
        // does not change if the enrollment fee changes.
        // -------------------------------------------------

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        // -------------------------------------------------
        // Payment status
        // -------------------------------------------------

        status: {
            type: String,
            enum: ["paid", "due"],
            default: "due"
        },

        // -------------------------------------------------
        // Actual payment date
        // Only present when payment is completed.
        // -------------------------------------------------

        paidAt: {
            type: Date
        },

        // -------------------------------------------------
        // Payment method
        // Can be expanded later if needed.
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
// Prevent duplicate payment records for the same
// enrollment and month.
// ---------------------------------------------------------

paymentSchema.index(
    {
        enrollment: 1,
        month: 1,
        year: 1
    },
    {
        unique: true
    }
);


const Payment = mongoose.model(
    "Payment",
    paymentSchema
);

export default Payment;