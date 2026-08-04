import jwt from "jsonwebtoken";
export const isAuthenticated = async function (req, res, next) {
    try {
        let token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "Token is missing!"
            })
        }
        let decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded

        next();
    }catch(err){
        return res.status(401).json({
            message:"Invalid Token",
            error:err.message
        })
    }

}