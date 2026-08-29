import { useEffect, useState } from "react";
import "./CreateNotification.css";

const API_URL = "http://localhost:3000/api/notifications";

const recipients = {
    student: "Students",
    teacher: "Teachers",
    admin: "Admins",
    all: "Everyone"
};

const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });


function CreateNotification() {

    const [form, setForm] = useState({
        recipientType: "student",
        title: "",
        message: ""
    });

    const [notifications, setNotifications] = useState([]);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [modal, setModal] = useState(null);


    const token = localStorage.getItem("token");


    // Fetch notification history

    const loadNotifications = async () => {

        try {

            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok)
                throw new Error(
                    data.message ||
                    "Failed to load notifications"
                );

            setNotifications(
                data.notifications || []
            );

        } catch (error) {

            setError(error.message);

        } finally {

            setFetching(false);
        }
    };


    useEffect(() => {
        loadNotifications();
    }, []);


    const updateForm = (field, value) => {

        setForm(previous => ({
            ...previous,
            [field]: value
        }));

        setError("");
        setSuccess("");
    };


    // Validate before opening confirmation

    const validate = () => {

        if (!form.title.trim()) {
            setError("Please enter a notification title.");
            return false;
        }

        if (!form.message.trim()) {
            setError("Please enter a notification message.");
            return false;
        }

        return true;
    };


    const openPreview = () => {

        if (!validate())
            return;

        setModal("preview");
    };


    const openConfirmation = () => {

        if (!validate())
            return;

        setModal("confirm");
    };


    // Create notification

    const sendNotification = async () => {

        try {

            setLoading(true);
            setError("");
            setSuccess("");

            const response = await fetch(API_URL, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok)
                throw new Error(
                    data.message ||
                    "Failed to create notification"
                );


            if (data.notification) {

                setNotifications(previous => [
                    data.notification,
                    ...previous
                ]);
            }


            setForm({
                recipientType: "student",
                title: "",
                message: ""
            });

            setModal(null);

            setSuccess(
                "Notification sent successfully."
            );

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);
        }
    };


    // Delete notification

    const deleteNotification = async (id) => {

        if (!window.confirm(
            "Delete this notification?"
        ))
            return;


        try {

            const response = await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok)
                throw new Error(
                    data.message ||
                    "Failed to delete notification"
                );


            setNotifications(previous =>
                previous.filter(
                    notification =>
                        notification._id !== id
                )
            );

            setSuccess(
                "Notification deleted successfully."
            );

        } catch (error) {

            setError(error.message);
        }
    };


    return (
        <div className="notification-creation-page">

            <div className="notification-page-header">

                <h1>
                    Create Notification
                </h1>

                <p>
                    Send important updates to
                    admins, teachers or students.
                </p>

            </div>


            {error && (
                <div className="notification-error">
                    {error}
                </div>
            )}


            {success && (
                <div className="notification-success">
                    {success}
                </div>
            )}


            {/* Create notification */}

            <section className="notification-create-section">

                <div className="notification-section-title">

                    <div>
                        <h2>
                            New Notification
                        </h2>

                        <span>
                            Choose the recipient and
                            write your message.
                        </span>
                    </div>

                </div>


                <div className="notification-form">

                    <div className="notification-field">

                        <label>
                            Send To
                        </label>

                        <select
                            value={form.recipientType}
                            onChange={event =>
                                updateForm(
                                    "recipientType",
                                    event.target.value
                                )
                            }
                        >

                            <option value="student">
                                Students
                            </option>

                            <option value="teacher">
                                Teachers
                            </option>

                            <option value="admin">
                                Admins
                            </option>

                            <option value="all">
                                Everyone
                            </option>

                        </select>

                    </div>


                    <div className="notification-field">

                        <label>
                            Title
                        </label>

                        <input
                            type="text"
                            value={form.title}
                            maxLength={120}
                            placeholder="Enter notification title"
                            onChange={event =>
                                updateForm(
                                    "title",
                                    event.target.value
                                )
                            }
                        />

                        <small>
                            {form.title.length}/120
                        </small>

                    </div>


                    <div className="notification-field">

                        <label>
                            Message
                        </label>

                        <textarea
                            value={form.message}
                            maxLength={1000}
                            rows={6}
                            placeholder="Write your notification..."
                            onChange={event =>
                                updateForm(
                                    "message",
                                    event.target.value
                                )
                            }
                        />

                        <small>
                            {form.message.length}/1000
                        </small>

                    </div>


                    <div className="notification-form-actions">

                        <button
                            type="button"
                            className="notification-preview-button"
                            onClick={openPreview}
                        >
                            Preview
                        </button>

                        <button
                            type="button"
                            className="notification-send-button"
                            onClick={openConfirmation}
                            disabled={loading}
                        >
                            Send Notification
                        </button>

                    </div>

                </div>

            </section>


            {/* Recent notifications */}

            <section className="notification-history-section">

                <div className="notification-section-title">

                    <div>
                        <h2>
                            Recent Notifications
                        </h2>

                        <span>
                            Notifications created by
                            the Super Admin.
                        </span>
                    </div>

                </div>


                {fetching ? (

                    <div className="notification-empty">
                        Loading notifications...
                    </div>

                ) : notifications.length === 0 ? (

                    <div className="notification-empty">
                        No notifications created yet.
                    </div>

                ) : (

                    <div className="notification-table-wrapper">

                        <table className="notification-table">

                            <thead>

                                <tr>
                                    <th>Title</th>
                                    <th>Message</th>
                                    <th>Sent To</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>

                            </thead>

                            <tbody>

                                {notifications.map(
                                    notification => (

                                        <tr
                                            key={
                                                notification._id
                                            }
                                        >

                                            <td>
                                                <strong>
                                                    {
                                                        notification.title
                                                    }
                                                </strong>
                                            </td>

                                            <td className="notification-message-cell">
                                                {
                                                    notification.message
                                                }
                                            </td>

                                            <td>
                                                <span className="notification-recipient">
                                                    {
                                                        recipients[
                                                            notification
                                                                .recipientType
                                                        ]
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                {
                                                    formatDate(
                                                        notification.createdAt
                                                    )
                                                }
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="notification-delete-button"
                                                    onClick={() =>
                                                        deleteNotification(
                                                            notification._id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* Preview / confirmation modal */}

            {modal && (

                <div
                    className="notification-modal-overlay"
                    onClick={() =>
                        !loading && setModal(null)
                    }
                >

                    <div
                        className="notification-modal"
                        onClick={event =>
                            event.stopPropagation()
                        }
                    >

                        <div className="notification-modal-header">

                            <div>

                                <h2>
                                    {modal === "preview"
                                        ? "Notification Preview"
                                        : "Send Notification?"}
                                </h2>

                                <p>
                                    {modal === "preview"
                                        ? "Review the message before sending."
                                        : "Please confirm that you want to send this notification."}
                                </p>

                            </div>

                            <button
                                type="button"
                                className="notification-close-button"
                                onClick={() =>
                                    setModal(null)
                                }
                                disabled={loading}
                            >
                                ×
                            </button>

                        </div>


                        <div className="notification-preview">

                            <div className="notification-preview-recipient">

                                To:

                                <strong>
                                    {" "}
                                    {
                                        recipients[
                                            form.recipientType
                                        ]
                                    }
                                </strong>

                            </div>


                            <h3>
                                {form.title}
                            </h3>

                            <p>
                                {form.message}
                            </p>

                        </div>


                        <div className="notification-modal-actions">

                            <button
                                type="button"
                                className="notification-cancel-button"
                                onClick={() =>
                                    setModal(null)
                                }
                                disabled={loading}
                            >
                                Cancel
                            </button>


                            {modal === "preview" ? (

                                <button
                                    type="button"
                                    className="notification-confirm-button"
                                    onClick={
                                        openConfirmation
                                    }
                                >
                                    Continue
                                </button>

                            ) : (

                                <button
                                    type="button"
                                    className="notification-confirm-button"
                                    onClick={
                                        sendNotification
                                    }
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Sending..."
                                        : "Yes, Send"}
                                </button>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}


export default CreateNotification;