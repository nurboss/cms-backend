import { Router } from "express";
import adminRoutes from "./adminRoutes";
import publicRoutes from "./publicRoutes";

const router = Router();

// Mount admin routes under /admin
router.use("/admin", adminRoutes);

// Mount public routes at root of /api
router.use("/", publicRoutes);

export default router;
