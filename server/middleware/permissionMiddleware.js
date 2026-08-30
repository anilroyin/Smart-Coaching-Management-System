// =====================================================
// PERMISSION MIDDLEWARE
//
// Usage:
//
// permissionMiddleware("students")
// → Super Admin + Admin with permission
//
// permissionMiddleware("teacherPayments", {
//     superAdminOnly: true
// })
// → Super Admin only
// =====================================================

const permissionMiddleware = (
    permission,
    options = {}
) => {

    return (req, res, next) => {

        const role = req.user?.role;


        // =================================================
        // SUPER ADMIN
        //
        // Super Admin normally has full access.
        // =================================================

        if (role === "super_admin") {
            return next();
        }


        // =================================================
        // SUPER ADMIN ONLY
        //
        // If this permission is restricted to Super Admin,
        // regular Admins are denied.
        // =================================================

        if (options.superAdminOnly) {

            return res.status(403).json({
                message:
                    "Super Admin access required"
            });

        }


        // =================================================
        // REGULAR ADMIN
        // =================================================

        if (role !== "admin") {

            return res.status(403).json({
                message:
                    "Access denied"
            });

        }


        // =================================================
        // ADMIN PERMISSION
        // =================================================

        if (!req.user.permissions?.[permission]) {

            return res.status(403).json({
                message:
                    "You do not have permission to perform this action"
            });

        }


        next();
    };
};


export default permissionMiddleware;