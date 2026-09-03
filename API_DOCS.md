# 📘 AuthAPI - Tài Liệu API Cho Frontend

> **Base URL:** `http://localhost:3000`
>
> **Content-Type:** `application/json`
>
> **Swagger UI (Interactive):** `http://localhost:3000/api-docs`

---

## 📑 Mục Lục

| # | API | Method | Endpoint | Auth |
|:--|:----|:-------|:---------|:-----|
| 1 | [Đăng ký](#1--đăng-ký-register) | `POST` | `/api/auth/register` | ❌ |
| 2 | [Đăng nhập](#2--đăng-nhập-login) | `POST` | `/api/auth/login` | ❌ |
| 3 | [Lấy thông tin user](#3--lấy-thông-tin-user-hiện-tại-get-me) | `GET` | `/api/auth/me` | ✅ Bearer |
| 4 | [Đổi mật khẩu](#4--đổi-mật-khẩu-change-password) | `PUT` | `/api/auth/change-password` | ✅ Bearer |
| 5 | [Đăng xuất](#5--đăng-xuất-logout) | `POST` | `/api/auth/logout` | ❌ |
| 6 | [Admin Dashboard](#6--admin-dashboard-rbac) | `GET` | `/api/auth/admin/dashboard` | ✅ Bearer + Admin |

---

## 🔐 Xác Thực (Authentication)

API sử dụng **JWT Bearer Token**. Sau khi gọi API Login thành công, server trả về `token`. Frontend cần lưu token này và gửi kèm trong **Header** của mọi request yêu cầu xác thực:

```
Authorization: Bearer <token>
```

**JWT Payload** chứa:
```json
{
  "userId": "6a8c4967d4971d564b9ba663",
  "role": "user",
  "iat": 1724506327,
  "exp": 1724592727
}
```

| Thông tin | Giá trị |
|:----------|:--------|
| Thuật toán | HS256 |
| Thời gian hết hạn | 1 ngày (`1d`) |
| Vị trí gửi token | Header `Authorization: Bearer <token>` |

---

## 📦 User Model (Schema)

```json
{
  "_id": "6a8c4967d4971d564b9ba663",
  "name": "Nguyen Van A",
  "email": "nguyenvana@example.com",
  "role": "user",
  "createdAt": "2026-08-24T13:38:47.263Z",
  "updatedAt": "2026-08-24T13:38:47.263Z",
  "__v": 0
}
```

| Field | Type | Mô tả |
|:------|:-----|:------|
| `_id` | `string` | MongoDB ObjectId, tự động sinh |
| `name` | `string` | Tên hiển thị (bắt buộc, trim) |
| `email` | `string` | Email (bắt buộc, unique, lowercase) |
| `role` | `string` | Vai trò: `"user"` hoặc `"admin"` (mặc định: `"user"`) |
| `createdAt` | `string (ISO 8601)` | Thời gian tạo tài khoản |
| `updatedAt` | `string (ISO 8601)` | Thời gian cập nhật gần nhất |

> ⚠️ **Lưu ý:** Trường `password` không bao giờ được trả về trong response.

---

## 🔴 Cấu Trúc Response Lỗi (Error Response)

Tất cả response lỗi đều có cấu trúc thống nhất:

```json
{
  "message": "Mô tả lỗi chi tiết bằng tiếng Việt",
  "error": "ErrorType",
  "statusCode": 400
}
```

| Field | Type | Mô tả |
|:------|:-----|:------|
| `message` | `string` | Thông báo lỗi chi tiết (tiếng Việt) |
| `error` | `string` | Loại lỗi: `BadRequest`, `Unauthorized`, `Forbidden`, `NotFound`, `Conflict` |
| `statusCode` | `number` | Mã HTTP status code |

---

## 📖 Chi Tiết Từng API

---

### 1. 📝 Đăng Ký (Register)

Tạo tài khoản người dùng mới. Email sẽ được chuẩn hóa (lowercase, trim). Password được hash bằng bcrypt trước khi lưu. Role mặc định là `"user"`.

| | |
|:--|:--|
| **URL** | `/api/auth/register` |
| **Method** | `POST` |
| **Auth** | ❌ Không yêu cầu |

#### Request Body

```json
{
  "name": "Nguyen Van A",
  "email": "nguyenvana@example.com",
  "password": "123456"
}
```

| Field | Type | Required | Validation |
|:------|:-----|:---------|:-----------|
| `name` | `string` | ✅ | Tên hiển thị, sẽ được trim |
| `email` | `string` | ✅ | Email hợp lệ, unique, sẽ được lowercase + trim |
| `password` | `string` | ✅ | Tối thiểu 6 ký tự |

#### Responses

<details>
<summary>✅ <b>201</b> - Đăng ký thành công</summary>

```json
{
  "message": "Đăng ký thành công",
  "user": {
    "_id": "6a8c4967d4971d564b9ba663",
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "role": "user",
    "createdAt": "2026-08-24T13:38:47.263Z",
    "updatedAt": "2026-08-24T13:38:47.263Z",
    "__v": 0
  }
}
```
</details>

<details>
<summary>❌ <b>400</b> - Thiếu trường bắt buộc</summary>

```json
{
  "message": "Name, email và password là bắt buộc",
  "error": "BadRequest",
  "statusCode": 400
}
```
</details>

<details>
<summary>❌ <b>400</b> - Password quá ngắn</summary>

```json
{
  "message": "Password phải có ít nhất 6 ký tự",
  "error": "BadRequest",
  "statusCode": 400
}
```
</details>

<details>
<summary>❌ <b>409</b> - Email đã tồn tại</summary>

```json
{
  "message": "Email đã được đăng ký",
  "error": "Conflict",
  "statusCode": 409
}
```
</details>

#### Code mẫu Frontend (JavaScript / Axios)

```javascript
const response = await axios.post("/api/auth/register", {
  name: "Nguyen Van A",
  email: "nguyenvana@example.com",
  password: "123456",
});

console.log(response.data.user); // User object
```

---

### 2. 🔑 Đăng Nhập (Login)

Xác thực bằng email + password. Nếu thành công, trả về thông tin user và **JWT token** (hết hạn sau 1 ngày).

| | |
|:--|:--|
| **URL** | `/api/auth/login` |
| **Method** | `POST` |
| **Auth** | ❌ Không yêu cầu |

#### Request Body

```json
{
  "email": "nguyenvana@example.com",
  "password": "123456"
}
```

| Field | Type | Required | Validation |
|:------|:-----|:---------|:-----------|
| `email` | `string` | ✅ | Email đã đăng ký |
| `password` | `string` | ✅ | Mật khẩu của tài khoản |

#### Responses

<details>
<summary>✅ <b>200</b> - Đăng nhập thành công</summary>

```json
{
  "message": "Đăng nhập thành công",
  "user": {
    "_id": "6a8c4967d4971d564b9ba663",
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "role": "user",
    "createdAt": "2026-08-24T13:38:47.263Z",
    "updatedAt": "2026-08-24T13:38:47.263Z",
    "__v": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YThjNDk2N2Q0OTcxZDU2NGI5YmE2NjMiLCJyb2xlIjoidXNlciIsImlhdCI6MTcyNDUwNjMyN30.xxxxx",
  "expiresIn": "1d"
}
```
</details>

<details>
<summary>❌ <b>400</b> - Thiếu email hoặc password</summary>

```json
{
  "message": "Email và password là bắt buộc",
  "error": "BadRequest",
  "statusCode": 400
}
```
</details>

<details>
<summary>❌ <b>401</b> - Sai email hoặc password</summary>

```json
{
  "message": "Email hoặc mật khẩu không đúng",
  "error": "Unauthorized",
  "statusCode": 401
}
```
</details>

#### Code mẫu Frontend (JavaScript / Axios)

```javascript
const response = await axios.post("/api/auth/login", {
  email: "nguyenvana@example.com",
  password: "123456",
});

// Lưu token vào localStorage
const { token, user } = response.data;
localStorage.setItem("token", token);
localStorage.setItem("user", JSON.stringify(user));
```

---

### 3. 👤 Lấy Thông Tin User Hiện Tại (Get Me)

Trả về thông tin chi tiết của người dùng đang đăng nhập. Token được giải mã để lấy `userId`, sau đó truy vấn database.

| | |
|:--|:--|
| **URL** | `/api/auth/me` |
| **Method** | `GET` |
| **Auth** | ✅ `Authorization: Bearer <token>` |

#### Request

Không có request body. Chỉ cần gửi kèm token trong Header.

```
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Responses

<details>
<summary>✅ <b>200</b> - Lấy thông tin thành công</summary>

```json
{
  "message": "Lấy thông tin thành công",
  "user": {
    "_id": "6a8c4967d4971d564b9ba663",
    "name": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "role": "user",
    "createdAt": "2026-08-24T13:38:47.263Z",
    "updatedAt": "2026-08-24T13:38:47.263Z",
    "__v": 0
  }
}
```
</details>

<details>
<summary>❌ <b>401</b> - Không tìm thấy token</summary>

```json
{
  "message": "Không tìm thấy token",
  "error": "Unauthorized",
  "statusCode": 401
}
```
</details>

<details>
<summary>❌ <b>401</b> - Token không hợp lệ hoặc hết hạn</summary>

```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn",
  "error": "Unauthorized",
  "statusCode": 401
}
```
</details>

<details>
<summary>❌ <b>404</b> - Không tìm thấy user</summary>

```json
{
  "message": "Không tìm thấy người dùng",
  "error": "NotFound",
  "statusCode": 404
}
```
</details>

#### Code mẫu Frontend (JavaScript / Axios)

```javascript
const token = localStorage.getItem("token");

const response = await axios.get("/api/auth/me", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

console.log(response.data.user); // User object
```

---

### 4. 🔄 Đổi Mật Khẩu (Change Password)

Cho phép người dùng đang đăng nhập đổi mật khẩu. Xác thực mật khẩu cũ trước khi cho phép đổi.

| | |
|:--|:--|
| **URL** | `/api/auth/change-password` |
| **Method** | `PUT` |
| **Auth** | ✅ `Authorization: Bearer <token>` |

#### Request Body

```json
{
  "oldPassword": "123456",
  "newPassword": "654321"
}
```

| Field | Type | Required | Validation |
|:------|:-----|:---------|:-----------|
| `oldPassword` | `string` | ✅ | Mật khẩu hiện tại |
| `newPassword` | `string` | ✅ | Mật khẩu mới, tối thiểu 6 ký tự |

#### Responses

<details>
<summary>✅ <b>200</b> - Đổi mật khẩu thành công</summary>

```json
{
  "message": "Đổi mật khẩu thành công"
}
```
</details>

<details>
<summary>❌ <b>400</b> - Thiếu trường bắt buộc</summary>

```json
{
  "message": "oldPassword và newPassword là bắt buộc",
  "error": "BadRequest",
  "statusCode": 400
}
```
</details>

<details>
<summary>❌ <b>400</b> - Password mới quá ngắn</summary>

```json
{
  "message": "Password mới phải có ít nhất 6 ký tự",
  "error": "BadRequest",
  "statusCode": 400
}
```
</details>

<details>
<summary>❌ <b>401</b> - Mật khẩu hiện tại sai</summary>

```json
{
  "message": "Mật khẩu hiện tại không đúng",
  "error": "Unauthorized",
  "statusCode": 401
}
```
</details>

<details>
<summary>❌ <b>401</b> - Token không hợp lệ</summary>

```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn",
  "error": "Unauthorized",
  "statusCode": 401
}
```
</details>

<details>
<summary>❌ <b>404</b> - Không tìm thấy user</summary>

```json
{
  "message": "Không tìm thấy người dùng",
  "error": "NotFound",
  "statusCode": 404
}
```
</details>

#### Code mẫu Frontend (JavaScript / Axios)

```javascript
const token = localStorage.getItem("token");

const response = await axios.put(
  "/api/auth/change-password",
  {
    oldPassword: "123456",
    newPassword: "654321",
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

alert(response.data.message); // "Đổi mật khẩu thành công"
```

---

### 5. 🚪 Đăng Xuất (Logout)

Đăng xuất người dùng. API chỉ trả về thông báo thành công. **Frontend cần tự xóa token** khỏi localStorage/Cookie.

| | |
|:--|:--|
| **URL** | `/api/auth/logout` |
| **Method** | `POST` |
| **Auth** | ❌ Không yêu cầu |

#### Request

Không có request body.

```
POST /api/auth/logout
```

#### Responses

<details>
<summary>✅ <b>200</b> - Đăng xuất thành công</summary>

```json
{
  "message": "Đăng xuất thành công"
}
```
</details>

#### Code mẫu Frontend (JavaScript / Axios)

```javascript
await axios.post("/api/auth/logout");

// Xóa token và thông tin user ở phía client
localStorage.removeItem("token");
localStorage.removeItem("user");

// Chuyển hướng về trang login
window.location.href = "/login";
```

---

### 6. 🛡️ Admin Dashboard (RBAC)

Trang quản trị dành riêng cho người dùng có vai trò `admin`. Yêu cầu JWT token hợp lệ **VÀ** tài khoản phải có `role: "admin"`.

| | |
|:--|:--|
| **URL** | `/api/auth/admin/dashboard` |
| **Method** | `GET` |
| **Auth** | ✅ `Authorization: Bearer <token>` |
| **Role** | 🛡️ Chỉ `admin` |

#### Request

Không có request body. Gửi kèm token của tài khoản admin trong Header.

```
GET /api/auth/admin/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Responses

<details>
<summary>✅ <b>200</b> - Truy cập thành công (role = admin)</summary>

```json
{
  "message": "Bạn đã truy cập khu vực admin"
}
```
</details>

<details>
<summary>❌ <b>401</b> - Không tìm thấy token</summary>

```json
{
  "message": "Không tìm thấy token",
  "error": "Unauthorized",
  "statusCode": 401
}
```
</details>

<details>
<summary>❌ <b>401</b> - Token không hợp lệ hoặc hết hạn</summary>

```json
{
  "message": "Token không hợp lệ hoặc đã hết hạn",
  "error": "Unauthorized",
  "statusCode": 401
}
```
</details>

<details>
<summary>❌ <b>403</b> - Không có quyền (role = user)</summary>

```json
{
  "message": "Bạn không có quyền truy cập",
  "error": "Forbidden",
  "statusCode": 403
}
```
</details>

#### Code mẫu Frontend (JavaScript / Axios)

```javascript
const token = localStorage.getItem("token");

try {
  const response = await axios.get("/api/auth/admin/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(response.data.message); // "Bạn đã truy cập khu vực admin"
} catch (error) {
  if (error.response?.status === 403) {
    alert("Bạn không có quyền truy cập khu vực admin!");
    // Chuyển hướng về trang chủ
    window.location.href = "/";
  }
}
```

---

## 🛠️ Hướng Dẫn Kết Nối Frontend

### 1. Cài đặt Axios

```bash
npm install axios
```

### 2. Tạo file cấu hình API (apiClient.js)

```javascript
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000", // Thay bằng URL production khi deploy
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động gắn token vào mọi request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự động xử lý lỗi 401 (token hết hạn)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3. Sử dụng trong các component

```javascript
import apiClient from "./apiClient";

// Đăng ký
const register = (name, email, password) =>
  apiClient.post("/api/auth/register", { name, email, password });

// Đăng nhập
const login = (email, password) =>
  apiClient.post("/api/auth/login", { email, password });

// Lấy thông tin user
const getMe = () => apiClient.get("/api/auth/me");

// Đổi mật khẩu
const changePassword = (oldPassword, newPassword) =>
  apiClient.put("/api/auth/change-password", { oldPassword, newPassword });

// Đăng xuất
const logout = () => apiClient.post("/api/auth/logout");

// Admin Dashboard
const getAdminDashboard = () => apiClient.get("/api/auth/admin/dashboard");
```

### 4. Xử lý CORS (nếu FE và BE khác port)

Nếu Frontend chạy ở port khác (ví dụ: `localhost:5173`), thêm middleware CORS vào file `app.js` của Backend:

```bash
npm install cors
```

```javascript
import cors from "cors";

app.use(cors({
  origin: "http://localhost:5173", // URL của Frontend
  credentials: true,
}));
```

---

## 📊 Tổng Hợp Status Code

| Code | Ý nghĩa | Khi nào xảy ra |
|:-----|:---------|:----------------|
| `200` | OK | Request thành công |
| `201` | Created | Tạo tài khoản thành công |
| `400` | Bad Request | Thiếu dữ liệu bắt buộc hoặc dữ liệu không hợp lệ |
| `401` | Unauthorized | Sai mật khẩu, thiếu token, hoặc token hết hạn |
| `403` | Forbidden | Không có quyền truy cập (role không đủ) |
| `404` | Not Found | Không tìm thấy user trong database |
| `409` | Conflict | Email đã được đăng ký |
