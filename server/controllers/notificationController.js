import mongoose from "mongoose";
import Notification from "../models/notification.js";


const validId = (id) =>
    mongoose.Types.ObjectId.isValid(id);


const validRecipientType = (type) =>
    [
        "admin",
        "teacher",
        "student",
        "all"
    ].includes(type);


// =====================================================
// CREATE NOTIFICATION
// SUPER ADMIN ONLY
// =====================================================

export const createNotification = async (req, res) => {

    try {

        const {
            title,
            message,
            recipientType
        } = req.body;


        if (!title?.trim()) {
            return res.status(400).json({
                message: "Notification title is required"
            });
        }


        if (!message?.trim()) {
            return res.status(400).json({
                message: "Notification message is required"
            });
        }


        if (!validRecipientType(recipientType)) {
            return res.status(400).json({
                message: "Invalid notification recipient"
            });
        }


        const notification =
            await Notification.create({
                title: title.trim(),
                message: message.trim(),
                recipientType,
                createdBy: req.user._id
            });


        const populatedNotification =
            await Notification.findById(
                notification._id
            ).populate(
                "createdBy",
                "name email role"
            );


        return res.status(201).json({
            message: "Notification created successfully",
            notification: populatedNotification
        });

    } catch (error) {

        console.error(
            "CREATE NOTIFICATION ERROR:",
            error
        );

        return res.status(500).json({
            message: "Failed to create notification"
        });
    }
};


// =====================================================
// GET ALL NOTIFICATIONS
// SUPER ADMIN ONLY
// =====================================================

export const getAllNotifications = async (req, res) => {

    try {

        const notifications =
            await Notification.find()
                .populate(
                    "createdBy",
                    "name email role"
                )
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({
            message: "Notifications fetched successfully",
            count: notifications.length,
            notifications
        });

    } catch (error) {

        console.error(
            "GET ALL NOTIFICATIONS ERROR:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch notifications"
        });
    }
};


// =====================================================
// GET NOTIFICATIONS FOR CURRENT USER
// =====================================================

export const getMyNotifications = async (req, res) => {

    try {

        const roleMap = {
            admin: "admin",
            teacher: "teacher",
            student: "student"
        };


        const recipientType =
            roleMap[req.user.role];


        if (!recipientType) {
            return res.status(403).json({
                message:
                    "Notifications are not available for this account"
            });
        }


        const notifications =
            await Notification.find({
                recipientType: {
                    $in: [
                        recipientType,
                        "all"
                    ]
                }
            })
                .sort({
                    createdAt: -1
                });


        const notificationsWithStatus =
            notifications.map(notification => {

                const notificationData =
                    notification.toObject();


                notificationData.isRead =
                    notification.readBy.some(
                        userId =>
                            userId.toString() ===
                            req.user._id.toString()
                    );


                return notificationData;
            });


        return res.status(200).json({
            message:
                "Your notifications fetched successfully",

            count:
                notificationsWithStatus.length,

            notifications:
                notificationsWithStatus
        });

    } catch (error) {

        console.error(
            "GET MY NOTIFICATIONS ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to fetch your notifications"
        });
    }
};


// =====================================================
// MARK CURRENT USER'S NOTIFICATIONS AS READ
// =====================================================

export const markNotificationsAsRead = async (
    req,
    res
) => {

    try {

        const roleMap = {
            admin: "admin",
            teacher: "teacher",
            student: "student"
        };


        const recipientType =
            roleMap[req.user.role];


        if (!recipientType) {
            return res.status(403).json({
                message:
                    "Notifications are not available for this account"
            });
        }


        await Notification.updateMany(
            {
                recipientType: {
                    $in: [
                        recipientType,
                        "all"
                    ]
                },

                readBy: {
                    $ne: req.user._id
                }
            },

            {
                $addToSet: {
                    readBy: req.user._id
                }
            }
        );


        return res.status(200).json({
            message:
                "Notifications marked as read"
        });

    } catch (error) {

        console.error(
            "MARK NOTIFICATIONS READ ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to mark notifications as read"
        });
    }
};


// =====================================================
// DELETE NOTIFICATION
// SUPER ADMIN ONLY
// =====================================================

export const deleteNotification = async (req, res) => {

    try {

        const { id } = req.params;


        if (!validId(id)) {
            return res.status(400).json({
                message: "Invalid notification ID"
            });
        }


        const notification =
            await Notification.findByIdAndDelete(id);


        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }


        return res.status(200).json({
            message:
                "Notification deleted successfully"
        });

    } catch (error) {

        console.error(
            "DELETE NOTIFICATION ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to delete notification"
        });
    }
};