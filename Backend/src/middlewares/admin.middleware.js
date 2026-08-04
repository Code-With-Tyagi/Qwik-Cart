
export const isAdmin = async function (req, res, next) {

    if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({
            message: "Access denied, admin only"
        });
    }

    return next();

}