import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
    {
        feesCommissionPercent: {
            type: Number,
            required: true,
            default: 25,
            min: 0,
            max: 100
        }
    },
    {
        timestamps: true
    }
);

const Settings = mongoose.model(
    "Settings",
    settingsSchema
);

export default Settings;