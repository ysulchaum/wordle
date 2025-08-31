import type { Request, Response, NextFunction } from 'express';
const jwt = require("jsonwebtoken");

declare global {
  namespace Express {
    interface Request {
      userInfo?: any;
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  // console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided. Please login to continue",
    });
  }

  //decode this token
  try {
    const decodedTokenInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(`auth middleware: ${JSON.stringify(decodedTokenInfo)}`);

    req.userInfo = decodedTokenInfo;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Access denied. No token provided. Please login to continue",
    });
  }
};

module.exports = authMiddleware;