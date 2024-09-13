import jwt from "jsonwebtoken";
import { exports } from "../config/default.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Token de inicio de sesión no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, exports.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Token de inicio de sesión inválido" });
  }
};
