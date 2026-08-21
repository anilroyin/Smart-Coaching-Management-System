const permissionMiddleware = (permission) => {
    return (req, res, next) => {

        // Super Admin has full access
        if (req.user.role === "super_admin") {
            return next();
        }

        // Only regular Admins should use permission-based access
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        // Check the requested permission
        if (!req.user.permissions?.[permission]) {
            return res.status(403).json({
                message: "You do not have permission to perform this action"
            });
        }

        next();
    };
};

export default permissionMiddleware;