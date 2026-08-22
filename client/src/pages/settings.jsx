import { useEffect, useState } from "react";

import "./settings.css";


function Settings() {

    const token = localStorage.getItem("token");


    // =====================================================
    // STATE
    // =====================================================

    const [feesCommissionPercent, setFeesCommissionPercent] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    // =====================================================
    // FETCH SETTINGS
    // =====================================================

    const fetchSettings = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:3000/api/settings",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch settings"
                );
            }

            setFeesCommissionPercent(
                data.settings
                    ?.feesCommissionPercent ?? 25
            );

        } catch (error) {

            console.error(
                "FETCH SETTINGS ERROR:",
                error
            );

            setError(
                error.message ||
                "Failed to load settings"
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        fetchSettings();

    }, []);


    // =====================================================
    // SAVE SETTINGS
    // =====================================================

    const handleSave = async (event) => {

        event.preventDefault();

        setMessage("");
        setError("");


        const percentage =
            Number(
                feesCommissionPercent
            );


        if (
            Number.isNaN(percentage) ||
            percentage < 0 ||
            percentage > 100
        ) {

            setError(
                "Commission percentage must be between 0 and 100."
            );

            return;
        }


        try {

            setSaving(true);

            const response = await fetch(
                "http://localhost:3000/api/settings",
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        feesCommissionPercent:
                            percentage
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to save settings"
                );
            }


            setFeesCommissionPercent(
                data.settings
                    ?.feesCommissionPercent ??
                percentage
            );


            setMessage(
                "Settings saved successfully."
            );

        } catch (error) {

            console.error(
                "SAVE SETTINGS ERROR:",
                error
            );

            setError(
                error.message ||
                "Failed to save settings"
            );

        } finally {

            setSaving(false);
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="settings-page">

                <div className="settings-loading">
                    Loading settings...
                </div>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="settings-page">


            {/* =================================================
                HEADER
                ================================================= */}

            <div className="settings-header">

                <h1>
                    Settings
                </h1>

                <p>
                    Manage system-wide configuration
                    for SCMS.
                </p>

            </div>


            {/* =================================================
                ERROR
                ================================================= */}

            {error && (

                <div className="settings-error">
                    {error}
                </div>

            )}


            {/* =================================================
                SUCCESS
                ================================================= */}

            {message && (

                <div className="settings-success">
                    {message}
                </div>

            )}


            {/* =================================================
                TEACHER PAYMENT SETTINGS
                ================================================= */}

            <section className="settings-card">

                <div className="settings-card-header">

                    <div>

                        <h2>
                            Teacher Payment
                        </h2>

                        <p>
                            Configure the percentage
                            of student fees retained
                            by the center.
                        </p>

                    </div>

                </div>


                <form
                    className="settings-form"
                    onSubmit={handleSave}
                >

                    <div className="settings-field">

                        <label htmlFor="commission">
                            Fees Commission
                        </label>

                        <div className="settings-percentage-input">

                            <input
                                id="commission"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={
                                    feesCommissionPercent
                                }
                                onChange={(event) =>
                                    setFeesCommissionPercent(
                                        event.target.value
                                    )
                                }
                                required
                            />

                            <span>
                                %
                            </span>

                        </div>

                        <small>
                            This percentage is retained
                            by the center from the
                            applicable student fees.
                        </small>

                    </div>


                    <div className="settings-payment-example">

                        <div>

                            <span>
                                Example
                            </span>

                            <strong>
                                ₹10,000
                            </strong>

                        </div>


                        <div>

                            <span>
                                Center Commission
                            </span>

                            <strong>
                                ₹
                                {(
                                    10000 *
                                    (
                                        Number(
                                            feesCommissionPercent
                                        ) || 0
                                    ) /
                                    100
                                ).toFixed(2)}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Teacher Payment
                            </span>

                            <strong>
                                ₹
                                {(
                                    10000 -
                                    (
                                        10000 *
                                        (
                                            Number(
                                                feesCommissionPercent
                                            ) || 0
                                        ) /
                                        100
                                    )
                                ).toFixed(2)}
                            </strong>

                        </div>

                    </div>


                    <div className="settings-actions">

                        <button
                            type="submit"
                            className="settings-save-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </form>

            </section>

        </div>
    );
}


export default Settings;