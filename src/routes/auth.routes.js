import express from "express";

import {
  register,
  login,
  googleLogin,
  getMe,
  changePassword,
  logout,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/google-login", googleLogin);
// ============================================================
//  POST /api/auth/register - ÄÄƒng kÃ½ tÃ i khoáº£n má»›i
// ============================================================
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: ÄÄƒng kÃ½ tÃ i khoáº£n má»›i
 *     description: |
 *       Táº¡o tÃ i khoáº£n ngÆ°á»i dÃ¹ng má»›i vá»›i **name**, **email** vÃ  **password**.
 *       - Email sáº½ Ä‘Æ°á»£c chuáº©n hÃ³a (lowercase, trim).
 *       - Password pháº£i cÃ³ tá»‘i thiá»ƒu 6 kÃ½ tá»± vÃ  Ä‘Æ°á»£c hash báº±ng bcrypt trÆ°á»›c khi lÆ°u.
 *       - Vai trÃ² (role) máº·c Ä‘á»‹nh lÃ  `user`.
 *     tags:
 *       - ðŸ” Authentication
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
 *         description: ÄÄƒng kÃ½ thÃ nh cÃ´ng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ÄÄƒng kÃ½ thÃ nh cÃ´ng"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               message: "ÄÄƒng kÃ½ thÃ nh cÃ´ng"
 *               user:
 *                 _id: "6a8c4967d4971d564b9ba663"
 *                 name: "Nguyen Van A"
 *                 email: "nguyenvana@example.com"
 *                 role: "user"
 *                 createdAt: "2026-08-24T13:38:47.263Z"
 *                 updatedAt: "2026-08-24T13:38:47.263Z"
 *                 __v: 0
 *       400:
 *         description: Dá»¯ liá»‡u khÃ´ng há»£p lá»‡ (thiáº¿u trÆ°á»ng báº¯t buá»™c hoáº·c password quÃ¡ ngáº¯n)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 summary: Thiáº¿u trÆ°á»ng báº¯t buá»™c
 *                 value:
 *                   message: "Name, email vÃ  password lÃ  báº¯t buá»™c"
 *                   error: "BadRequest"
 *                   statusCode: 400
 *               shortPassword:
 *                 summary: Password quÃ¡ ngáº¯n
 *                 value:
 *                   message: "Password pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±"
 *                   error: "BadRequest"
 *                   statusCode: 400
 *       409:
 *         description: Email Ä‘Ã£ Ä‘Æ°á»£c Ä‘Äƒng kÃ½ bá»Ÿi tÃ i khoáº£n khÃ¡c
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Email Ä‘Ã£ Ä‘Æ°á»£c Ä‘Äƒng kÃ½"
 *               error: "Conflict"
 *               statusCode: 409
 */
router.post("/register", register);

// ============================================================
//  POST /api/auth/login - ÄÄƒng nháº­p
// ============================================================
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: ÄÄƒng nháº­p
 *     description: |
 *       XÃ¡c thá»±c ngÆ°á»i dÃ¹ng báº±ng **email** vÃ  **password**.
 *       Náº¿u thÃ nh cÃ´ng, tráº£ vá» thÃ´ng tin user kÃ¨m **JWT token** (háº¿t háº¡n sau 1 ngÃ y).
 *
 *       JWT payload chá»©a: `{ userId, role }`
 *     tags:
 *       - ðŸ” Authentication
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
 *         description: ÄÄƒng nháº­p thÃ nh cÃ´ng - Tráº£ vá» user info vÃ  JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ÄÄƒng nháº­p thÃ nh cÃ´ng"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expiresIn:
 *                   type: string
 *                   description: Thá»i gian háº¿t háº¡n cá»§a token
 *                   example: "1d"
 *             example:
 *               message: "ÄÄƒng nháº­p thÃ nh cÃ´ng"
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
 *         description: Thiáº¿u email hoáº·c password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Email vÃ  password lÃ  báº¯t buá»™c"
 *               error: "BadRequest"
 *               statusCode: 400
 *       401:
 *         description: Email hoáº·c máº­t kháº©u khÃ´ng Ä‘Ãºng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Email hoáº·c máº­t kháº©u khÃ´ng Ä‘Ãºng"
 *               error: "Unauthorized"
 *               statusCode: 401
 */
router.post("/login", login);

// ============================================================
//  GET /api/auth/me - Láº¥y thÃ´ng tin ngÆ°á»i dÃ¹ng hiá»‡n táº¡i
// ============================================================
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Láº¥y thÃ´ng tin ngÆ°á»i dÃ¹ng hiá»‡n táº¡i
 *     description: |
 *       Tráº£ vá» thÃ´ng tin chi tiáº¿t cá»§a ngÆ°á»i dÃ¹ng Ä‘ang Ä‘Äƒng nháº­p.
 *       YÃªu cáº§u gá»­i kÃ¨m **JWT token** trong Header `Authorization`.
 *
 *       Token Ä‘Æ°á»£c giáº£i mÃ£ Ä‘á»ƒ láº¥y `userId`, sau Ä‘Ã³ truy váº¥n database.
 *     tags:
 *       - ðŸ‘¤ User Profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Láº¥y thÃ´ng tin thÃ nh cÃ´ng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Láº¥y thÃ´ng tin thÃ nh cÃ´ng"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               message: "Láº¥y thÃ´ng tin thÃ nh cÃ´ng"
 *               user:
 *                 _id: "6a8c4967d4971d564b9ba663"
 *                 name: "Nguyen Van A"
 *                 email: "nguyenvana@example.com"
 *                 role: "user"
 *                 createdAt: "2026-08-24T13:38:47.263Z"
 *                 updatedAt: "2026-08-24T13:38:47.263Z"
 *                 __v: 0
 *       401:
 *         description: KhÃ´ng cÃ³ token hoáº·c token khÃ´ng há»£p lá»‡ / Ä‘Ã£ háº¿t háº¡n
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noToken:
 *                 summary: KhÃ´ng tÃ¬m tháº¥y token
 *                 value:
 *                   message: "KhÃ´ng tÃ¬m tháº¥y token"
 *                   error: "Unauthorized"
 *                   statusCode: 401
 *               invalidToken:
 *                 summary: Token khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n
 *                 value:
 *                   message: "Token khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n"
 *                   error: "Unauthorized"
 *                   statusCode: 401
 *       404:
 *         description: KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng trong database
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng"
 *               error: "NotFound"
 *               statusCode: 404
 */
router.get("/me", authMiddleware, getMe);

// ============================================================
//  PUT /api/auth/change-password - Äá»•i máº­t kháº©u
// ============================================================
/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Äá»•i máº­t kháº©u
 *     description: |
 *       Cho phÃ©p ngÆ°á»i dÃ¹ng Ä‘ang Ä‘Äƒng nháº­p Ä‘á»•i máº­t kháº©u.
 *       YÃªu cáº§u gá»­i kÃ¨m **JWT token** trong Header `Authorization`.
 *
 *       Quy trÃ¬nh:
 *       1. XÃ¡c thá»±c `oldPassword` vá»›i máº­t kháº©u hiá»‡n táº¡i trong DB.
 *       2. Hash `newPassword` báº±ng bcrypt (salt round = 10).
 *       3. Cáº­p nháº­t máº­t kháº©u má»›i vÃ o database.
 *     tags:
 *       - ðŸ‘¤ User Profile
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
 *         description: Äá»•i máº­t kháº©u thÃ nh cÃ´ng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Äá»•i máº­t kháº©u thÃ nh cÃ´ng"
 *       400:
 *         description: Dá»¯ liá»‡u khÃ´ng há»£p lá»‡
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 summary: Thiáº¿u trÆ°á»ng báº¯t buá»™c
 *                 value:
 *                   message: "oldPassword vÃ  newPassword lÃ  báº¯t buá»™c"
 *                   error: "BadRequest"
 *                   statusCode: 400
 *               shortPassword:
 *                 summary: Password má»›i quÃ¡ ngáº¯n
 *                 value:
 *                   message: "Password má»›i pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±"
 *                   error: "BadRequest"
 *                   statusCode: 400
 *       401:
 *         description: Token khÃ´ng há»£p lá»‡ hoáº·c máº­t kháº©u hiá»‡n táº¡i sai
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidToken:
 *                 summary: Token khÃ´ng há»£p lá»‡
 *                 value:
 *                   message: "Token khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n"
 *                   error: "Unauthorized"
 *                   statusCode: 401
 *               wrongPassword:
 *                 summary: Máº­t kháº©u hiá»‡n táº¡i khÃ´ng Ä‘Ãºng
 *                 value:
 *                   message: "Máº­t kháº©u hiá»‡n táº¡i khÃ´ng Ä‘Ãºng"
 *                   error: "Unauthorized"
 *                   statusCode: 401
 *       404:
 *         description: KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng"
 *               error: "NotFound"
 *               statusCode: 404
 */
router.put("/change-password", authMiddleware, changePassword);

// ============================================================
//  POST /api/auth/logout - ÄÄƒng xuáº¥t
// ============================================================
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: ÄÄƒng xuáº¥t
 *     description: |
 *       ÄÄƒng xuáº¥t ngÆ°á»i dÃ¹ng khá»i há»‡ thá»‘ng.
 *
 *       > **LÆ°u Ã½:** API hiá»‡n táº¡i chá»‰ tráº£ vá» thÃ´ng bÃ¡o thÃ nh cÃ´ng.
 *       > Viá»‡c xÃ³a token phÃ­a client (localStorage/Cookie) do Frontend Ä‘áº£m nhiá»‡m.
 *     tags:
 *       - ðŸ” Authentication
 *     responses:
 *       200:
 *         description: ÄÄƒng xuáº¥t thÃ nh cÃ´ng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "ÄÄƒng xuáº¥t thÃ nh cÃ´ng"
 */
router.post("/logout", logout);

// ============================================================
//  GET /api/auth/admin/dashboard - Admin Dashboard (RBAC)
// ============================================================
/**
 * @swagger
 * /api/auth/admin/dashboard:
 *   get:
 *     summary: Truy cáº­p Admin Dashboard
 *     description: |
 *       Trang quáº£n trá»‹ dÃ nh riÃªng cho ngÆ°á»i dÃ¹ng cÃ³ vai trÃ² **admin**.
 *
 *       YÃªu cáº§u:
 *       1. Gá»­i kÃ¨m **JWT token** há»£p lá»‡ trong Header `Authorization`.
 *       2. Token pháº£i thuá»™c tÃ i khoáº£n cÃ³ `role: "admin"`.
 *
 *       Náº¿u role lÃ  `user` â†’ tráº£ vá» **403 Forbidden**.
 *     tags:
 *       - ðŸ›¡ï¸ Admin (RBAC)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Truy cáº­p Admin Dashboard thÃ nh cÃ´ng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Báº¡n Ä‘Ã£ truy cáº­p khu vá»±c admin"
 *       401:
 *         description: KhÃ´ng cÃ³ token hoáº·c token khÃ´ng há»£p lá»‡
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noToken:
 *                 summary: KhÃ´ng tÃ¬m tháº¥y token
 *                 value:
 *                   message: "KhÃ´ng tÃ¬m tháº¥y token"
 *                   error: "Unauthorized"
 *                   statusCode: 401
 *               invalidToken:
 *                 summary: Token khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n
 *                 value:
 *                   message: "Token khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n"
 *                   error: "Unauthorized"
 *                   statusCode: 401
 *       403:
 *         description: KhÃ´ng cÃ³ quyá»n truy cáº­p (role khÃ´ng pháº£i admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p"
 *               error: "Forbidden"
 *               statusCode: 403
 */
router.get(
  "/admin/dashboard",
  authMiddleware,
  authorizeRoles("admin"),
  (req, res) => {
    res.status(200).json({
      message: "Báº¡n Ä‘Ã£ truy cáº­p khu vá»±c admin",
    });
  },
);

export default router;
