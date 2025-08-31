import type { Request, Response, NextFunction } from 'express';
const jwt = require("jsonwebtoken");


declare global {
  namespace Express {
    interface Request {
      isSoloMode?: boolean;
      sendRoomId?: string;
      socketId?: string;
    }
  }
}

const multiMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { isSolo, roomId, socketId } = req.body;

  req.isSoloMode = isSolo;
  req.sendRoomId = roomId;
  req.socketId = socketId;
  console.log(`multiMiddleware - isSolo: ${isSolo}, roomId: ${roomId}, socketId: ${socketId}`);
  next();
};

module.exports = multiMiddleware;