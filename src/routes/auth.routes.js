import express from "express";

import {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  getMe,
  changePassword,
  logout,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/google-login", googleLogin);

// ============================================================
//  POST /api/auth/register - Đăng ký tài khoản mới
// ============================================================
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags:
 *       - 🔑 Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       409:
 *         description: Email đã tồn tại
 */
router.post("/register", register);

// ============================================================
//  POST /api/auth/login - Đăng nhập
// ============================================================
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags:
 *       - 🔑 Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       401:
 *         description: Email hoặc mật khẩu không đúng
 */
router.post("/login", login);

// ============================================================
//  POST /api/auth/forgot-password - Quên mật khẩu (Public)
// ============================================================
/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Yêu cầu liên kết đặt lại mật khẩu qua email
 *     description: |
 *       Nhận email và gửi mail chứa link reset token.
 *       Luôn trả về cùng response 200 kể cả khi email không tồn tại hoặc tài khoản dùng Google OAuth để chống dò user (User Enumeration).
 *     tags:
 *       - 🔑 Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Trả về thông báo thành công chung
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Nếu email này tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu."
 *       400:
 *         description: Thiếu email
 */
router.post("/forgot-password", forgotPassword);

// ============================================================
//  POST /api/auth/reset-password - Đặt lại mật khẩu (Public)
// ============================================================
/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu mới bằng reset token
 *     description: |
 *       Nhận raw token từ link email và mật khẩu mới.
 *       Hệ thống hash SHA-256 token để tìm user tương ứng và kiểm tra hạn sử dụng.
 *     tags:
 *       - 🔑 Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: "4a7f0e9b8c..."
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "newSecretPassword123"
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 *       400:
 *         description: Token không hợp lệ hoặc đã hết hạn / Thiếu dữ liệu
 */
router.post("/reset-password", resetPassword);

// ============================================================
//  GET /api/auth/me - Lấy thông tin tài khoản hiện tại
// ============================================================
router.get("/me", authMiddleware, getMe);

// ============================================================
//  PUT /api/auth/change-password - Đổi mật khẩu
// ============================================================
router.put("/change-password", authMiddleware, changePassword);

// ============================================================
//  POST /api/auth/logout - Đăng xuất
// ============================================================
router.post("/logout", logout);

// ============================================================
//  GET /api/auth/admin/dashboard - Admin Dashboard (RBAC)
// ============================================================
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
