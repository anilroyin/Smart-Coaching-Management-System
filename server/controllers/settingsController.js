import Settings from "../models/settings.js";


// =====================================================
// GET SETTINGS
// =====================================================

export const getSettings = async (req, res) => {
    try {

        let settings = await Settings.findOne();

        // Create default settings if none exist
        if (!settings) {
            settings = await Settings.create({});
        }

        res.status(200).json({
            message: "Settings fetched successfully",
            settings
        });

    } catch (error) {

        console.error(
            "GET SETTINGS ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch settings"
        });
    }
};


// =====================================================
// UPDATE SETTINGS
// =====================================================

export const updateSettings = async (req, res) => {
    try {

        const {
            feesCommissionPercent
        } = req.body;


        // -------------------------------------------------
        // Validate commission percentage
        // -------------------------------------------------

        if (
            feesCommissionPercent === undefined ||
            feesCommissionPercent === null ||
            feesCommissionPercent === ""
        ) {
            return res.status(400).json({
                message:
                    "Fees commission percentage is required"
            });
        }


        const percentage =
            Number(feesCommissionPercent);


        if (
            Number.isNaN(percentage) ||
            percentage < 0 ||
            percentage > 100
        ) {
            return res.status(400).json({
                message:
                    "Fees commission percentage must be between 0 and 100"
            });
        }


        // -------------------------------------------------
        // Update or create settings
        // -------------------------------------------------

        const settings =
            await Settings.findOneAndUpdate(
                {},

                {
                    feesCommissionPercent:
                        percentage
                },

                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            );


        res.status(200).json({
            message:
                "Settings updated successfully",

            settings
        });

    } catch (error) {

        console.error(
            "UPDATE SETTINGS ERROR:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update settings"
        });
    }
};