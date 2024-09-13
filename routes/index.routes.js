import { Router } from "express";
import adminRoutes from './admin.routes.js';
import Auth from "./auth.route.js";
import User from './user.routes.js';

const router = Router();

router.use('/admin', adminRoutes);
router.use('/auth', Auth);
router.use('/user', User);

export default router;
