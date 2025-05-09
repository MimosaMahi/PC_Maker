import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res
                .status(401)
                .json({ message: "Unauthorized - No token provided" });
        }

        try {
            const decoded = jwt.verify(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET
            );

            const user = await User.findById(decoded.userId).select(
                "-password"
            );
            if (!user) {
                return res
                    .status(401)
                    .json({ message: "Unauthorized - User not found" });
            }

            req.user = user;
            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res
                    .status(401)
                    .json({ message: "Unauthorized - Access Token Expired" });
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error("Error in protectRoute middleware:", error.message);
        res.status(500).json({
            message: "Unauthorized - Invalid Access Token",
        });
    }
};

export const adminRoute = (req, res, next) => {
    if (
        req.user &&
        (req.user.role === "admin" || req.user.role === "superadmin")
    ) {
        next();
    } else {
        return res.status(403).json({
            message: "Access Denied - Admins only",
        });
    }
};
