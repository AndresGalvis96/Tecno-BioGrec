import { Router } from "express";
import { verifyToken } from "./token.middleware.js";


const router = Router();

//router.use("/animales", verifyToken);
//router.use("/bienvenido", verifyToken);

export default router;