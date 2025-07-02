import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const authGuard = async (req, res, next) => {
    // console.log(req.headers);
    const authHeader = req.headers.authorization;
    try {
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'User not authorized!',
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token || token === '') {
            return res.status(401).json({
                success: false,
                error: 'No token in header!',
            });
        }

        const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedUser;

        // return req.user;
        next();
    }

    catch (error) {
        console.error(error);
        return res.status(401).json({ error: "Invalid Token!" });
    }

};
