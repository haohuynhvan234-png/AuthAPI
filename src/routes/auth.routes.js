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

// ============================================================
//  POST /api/auth/register - Đăng ký tài khoản mới
// ============================================================
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     description: |
 *       Tạo tài khoản người dùng mới với **name**, **email** và **password**.
 *       - Email sẽ được chuẩn hóa (lowercase, trim).
 *       - Password phải có tối thiểu 6 ký tự và được hash bằng bcrypt trước khi lưu.
 *       - Vai trò (role) mặc định là `user`.
 *     tags:
 *       - 🔐 Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             name: "Nguyen Van A"
 *             email: "nguyenvana@example.com"
 *             password: "123456"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đăng ký thành công"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               message: "Đăng ký thành công"
 *               user:
 *                 _id: "6a8c4967d4971d564b9ba663"
 *                 name: "Nguyen Van A"
 *                 email: "nguyenvana@example.com"
 *                 role: "user"
 *                 createdAt: "2026-08-24T13:38:47.263Z"
 *                 updatedAt: "2026-08-24T13:38:47.263Z"
 *                 __v: 0
 *       400:
 *         description: Dữ liệu không hợp lệ (thiếu trường bắt buộc hoặc password quá ngắn)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 summary: Thiếu trường bắt buộc
 *                 value:
 *                   message: "Name, email và password là bắt buộc"
 *                   error: "BadRequest"
 *                   statusCode: 400
 *               shortPassword:
 *                 summary: Password quá ngắn
 *                 value:
 *                   message: "Password phải có ít nhất 6 ký tự"
 *                   error: "BadRequest"
 *                   statusCode: 400
 *       409:
 *         description: Email đã được đăng ký bởi tài khoản khác
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Email đã được đăng ký"
 *               error: "Conflict"
 *               statusCode: 409
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
 *     description: |
 *       Xác thực người dùng bằng **email** và **password**.
 *       Nếu thành công, trả về thông tin user kèm **JWT token** (hết hạn sau 1 ngày).
 *
 *       JWT payload chứa: `{ userId, role }`
 *     tags:
 *       - 🔐 Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "nguyenvana@example.com"
 *             password: "123456"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công - Trả về user info và JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đăng nhập thành công"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expiresIn:
 *                   type: string
 *                   description: Thời gian hết hạn của token
 *                   example: "1d"
 *             example:
 *               message: "Đăng nhập thành công"
 *               user:
 *                 _id: "6a8c4967d4971d564b9ba663"
 *                 name: "Nguyen Van A"
 *                 email: "nguyenvana@example.com"
 *                 role: "user"
 *                 createdAt: "2026-08-24T13:38:47.263Z"
 *                 updatedAt: "2026-08-24T13:38:47.263Z"
 *                 __v: 0
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YThjNDk2N2Q0OTcxZDU2NGI5YmE2NjMiLCJyb2xlIjoidXNlciIsImlhdCI6MTcyNDUwNjMyN30.xxxxx"
 *               expiresIn: "1d"
 *       400:
 *         description: Thiếu email hoặc password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Email và password là bắt buộc"
 *               error: "BadRequest"
 *               statusCode: 400
 *       401:
 *         description: Email hoặc mật khẩu không đúng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Email hoặc mật khẩu không đúng"
 *               error: "Unauthorized"
 *               statusCode: 401
 */
router.post("/login", login);

// ============================================================
//  GET /api/auth/me - Lấy thông tin người dùng hiện tại
// ============================================================
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     description: |
 *       Trả về thông tin chi tiết của người dùng đang đăng nhập.
 *       Yêu cầu gửi kèm **JWT token** trong Header `Authorization`.
 *
 *       Token được giải mã để lấy `userId`, sau đó truy vấn database.
 *     tags:
 *       - 👤 User Profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lấy thông tin thành công"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               message: "Lấy thông tin thành công"
 *               user:
 *                 _id: "6a8c4967d4971d564b9ba663"
 *                 name: "Nguyen Van A"
 *                 email: "nguyenvana@example.com"
 *                 role: "user"
 *                 createdAt: "2026-08-24T13:38:47.263Z"
 *                 updatedAt: "2026-08-24T13:38:47.263Z"
 *                 __v: 0
 *       401:
 *         description: Không có token hoặc token không hợp lệ / đã hết hạn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noToken:
 *                 summary: Không tìm thấy token
 *                 value:
 *                   message: "Không tìm thấy token"
 *                   error: "Unauthorized"
 *                   statusCode: 401
 *               invalidToken:
 *                 summary: Token không hợp lệ hoặc đã hết hạn
 *                 value:
 *                   message: "Token không hợp lệ hoặc đã hết hạn"
 *                   error: "Unauthorized"
 *                   statusCode: 401
 *       404:
 *         description: Không tìm thấy người dùng trong database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Không tìm thấy người dùng"
 *               error: "NotFound"
 *               statusCode: 404
 */
router.get("/me", authMiddleware, getMe);

// ============================================================
//  PUT /api/auth/change-password - Đổi mật khẩu
// ============================================================
/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Đổi mật khẩu
 *     description: |
 *       Cho phép người dùng đang đăng nhập đổi mật khẩu.
 *       Yêu cầu gửi kèm **JWT token** trong Header `Authorization`.
 *
 *       Quy trình:
 *       1. Xác thực `oldPassword` với mật khẩu hiện tại trong DB.
 *       2. Hash `newPassword` bằng bcrypt (salt round = 10).
 *       3. Cập nhật mật khẩu mới vào database.
 *     tags:
 *       - 👤 User Profile
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *           example:
 *             oldPassword: "123456"
 *             newPassword: "654321"
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Đổi mật khẩu thành công"
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 summary: Thiếu trường bắt buộc
 *                 value:
 *                   message: "oldPassword và newPassword là bắt buộc"
 *                   error: "BadRequest"
 *                   statusCode: 400
 *               shortPassword:
 *                 summary: Password mới quá ngắn
 *                 value:
 *                   message: "Password mới phải có ít nhất 6 ký tự"
 *                   error: "BadRequest"
 *                   statusCode: 400
 *       401:
 *         description: Token không hợp lệ hoặc mật khẩu hiện tại sai
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidToken:
 *                 summary: Token không hợp lệ
 *                 value:
 *                   message: "Token không hợp lệ hoặc đã hết hạn"
 *                   error: "Unauthorized"
 *                   statusCode: 401
 *               wrongPassword:
 *                 summary: Mật khẩu hiện tại không đúng
 *                 value:
 *                   message: "Mật khẩu hiện tại không đúng"
 *                   error: "Unauthorized"
 *                   statusCode: 401
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Không tìm thấy người dùng"
 *               error: "NotFound"
 *               statusCode: 404
 */
router.put("/change-password", authMiddleware, changePassword);

// ============================================================
//  POST /api/auth/logout - Đăng xuất
// ============================================================
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Đăng xuất
 *     description: |
 *       Đăng xuất người dùng khỏi hệ thống.
 *
 *       > **Lưu ý:** API hiện tại chỉ trả về thông báo thành công.
 *       > Việc xóa token phía client (localStorage/Cookie) do Frontend đảm nhiệm.
 *     tags:
 *       - 🔐 Authentication
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Đăng xuất thành công"
 */
router.post("/logout", logout);

// ============================================================
//  GET /api/auth/admin/dashboard - Admin Dashboard (RBAC)
// ============================================================
/**
 * @swagger
 * /api/auth/admin/dashboard:
 *   get:
 *     summary: Truy cập Admin Dashboard
 *     description: |
 *       Trang quản trị dành riêng cho người dùng có vai trò **admin**.
 *
 *       Yêu cầu:
 *       1. Gửi kèm **JWT token** hợp lệ trong Header `Authorization`.
 *       2. Token phải thuộc tài khoản có `role: "admin"`.
 *
 *       Nếu role là `user` → trả về **403 Forbidden**.
 *     tags:
 *       - 🛡️ Admin (RBAC)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Truy cập Admin Dashboard thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Bạn đã truy cập khu vực admin"
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noToken:
 *                 summary: Không tìm thấy token
 *                 value:
 *                   message: "Không tìm thấy token"
 *                   error: "Unauthorized"
 *                   statusCode: 401
 *               invalidToken:
 *                 summary: Token không hợp lệ hoặc đã hết hạn
 *                 value:
 *                   message: "Token không hợp lệ hoặc đã hết hạn"
 *                   error: "Unauthorized"
 *                   statusCode: 401
 *       403:
 *         description: Không có quyền truy cập (role không phải admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Bạn không có quyền truy cập"
 *               error: "Forbidden"
 *               statusCode: 403
 */
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
