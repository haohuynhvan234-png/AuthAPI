import express from "express";

import {
  register,
  login,
  getMe,
  changePassword,
  logout,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.put("/change-password", authMiddleware, changePassword);
router.post("/logout", logout);
router.get(
  "/admin/dashboard",
  authMiddleware,
  authorizeRoles("admin"),
  (req, res) => {
    res.status(200).json({
      message: "Bạn đã truy cập khu vực admin",
    });
  },
);

export default router;
