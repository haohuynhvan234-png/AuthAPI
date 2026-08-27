# Bộ Prompt AI Thiết Kế Giao Diện (UI/UX) Cho Dự Án AuthAPI

Tài liệu này chứa bộ prompt chi tiết giúp bạn sử dụng các công cụ AI (như **v0.dev**, **Bolt.new**, **Lovable**, **ChatGPT / Claude**, **Midjourney / DALL-E**) để sinh ra giao diện người dùng (UI) hoàn chỉnh cho hệ thống Authentication & RBAC (Phân quyền User/Admin).

---

## 📋 Danh Sách Các Chức Năng Dự Án

Hệ thống API backend hiện tại có các tính năng:

1. **Authentication:** Đăng ký (`Register`), Đăng nhập (`Login`), Đăng xuất (`Logout`).
2. **User Profile:** Xem thông tin cá nhân (`/api/auth/me`), Đổi mật khẩu (`/api/auth/change-password`).
3. **RBAC & Authorization:** Phân quyền theo vai trò (`user` / `admin`).
4. **Admin Area:** Trang quản trị Admin Dashboard (`/api/auth/admin/dashboard`).

---

## 🎨 1. Prompt Dành Cho Công Cụ Gen Code UI (v0.dev / Bolt.new / Lovable / ChatGPT)

Các công cụ này nhận prompt tiếng Anh để tạo ra component React, Tailwind CSS, Shadcn UI hoàn chỉnh.

### 🔹 Prompt 1: Trang Đăng Nhập & Đăng Ký (Auth Suite: Login & Register)

> **Cách dùng:** Copy toàn bộ đoạn text dưới đây dán vào v0.dev hoặc Bolt.new.

```text
Design a modern, responsive Authentication UI (Login & Register pages) using React, Tailwind CSS, Lucide icons, and Shadcn UI components.

Key Features & Specifications:
- Style: Minimalist, clean, glassmorphism dark/light modern aesthetic with smooth transitions.
- Brand Theme: Indigo/Violet accent (#6366f1), slate neutral backgrounds.
- Tabs or Toggle: Seamless tab switching between "Sign In" and "Sign Up".
- Form Fields:
  * Register Form: Full Name, Email Address, Password (with show/hide eye toggle), Confirm Password.
  * Login Form: Email Address, Password, "Remember Me" checkbox, "Forgot Password?" link.
- UX & Interactive States:
  * Real-time form validation with error messages under inputs.
  * Loading state on submit buttons with animated spinner.
  * Toast notification support for success (e.g., "Registration Successful!", "Welcome back!").
- Bonus UI Elements: Social Auth buttons (Google, GitHub), subtle ambient background gradient blob.
```

---

### 🔹 Prompt 2: Trang Hồ Sơ Cá Nhân & Đổi Mật Khẩu (User Profile & Account Settings)

> **Cách dùng:** Dán vào v0.dev / Lovable để sinh ra giao diện người dùng sau khi đăng nhập.

```text
Create a sleek User Profile & Account Settings dashboard page using React, Tailwind CSS, and Shadcn UI.

Key Features & Specifications:
- Layout: Top navigation bar + Left sidebar layout (User avatar, Name, Role badge).
- User Profile Card:
  * Display User ID, Full Name, Email, Role ("user" badge in blue, "admin" badge in purple/gold), and Account Created Date.
  * Avatar upload placeholder with quick edit button.
- Change Password Section/Modal:
  * Input fields: Current Password, New Password (with strength meter), Confirm New Password.
  * Password strength indicator bar (Weak, Medium, Strong).
  * Action button: "Update Password" with success toast feedback.
- Logout Button: Red styled destructive button with confirmation modal.
- Responsive design for mobile and desktop screens.
```

---

### 🔹 Prompt 3: Trang Admin Dashboard & Quản Lý Phân Quyền (Admin Dashboard & RBAC User Table)

> **Cách dùng:** Dán vào v0.dev / Lovable để tạo trang quản trị dành riêng cho vai trò `admin`.

```text
Design an Admin Dashboard interface for a Web App with Role-Based Access Control (RBAC) using React, Tailwind CSS, and Recharts/Shadcn UI.

Key Features & Specifications:
- Header: Welcome back banner ("Admin Dashboard"), Admin Profile Badge, Quick actions, Dark mode toggle.
- Metrics Cards (Top Row):
  * Total Users (with percentage growth indicator).
  * Active Sessions.
  * Admins vs Normal Users ratio.
  * Security Events / Failed Logins.
- Main Content: User Management Data Table:
  * Columns: User ID, Avatar + Name, Email, Role (Badge dropdown to switch between 'user' and 'admin'), Status (Active/Inactive), Joined Date, Actions (Edit, Delete, Lock).
  * Search & Filter bar (Search by name/email, Filter by Role).
  * Pagination controls (Rows per page, Previous/Next page).
- Security & Access Control Banner: Notice showing "Access Restricted to Users with 'admin' Role Only".
```

---

### 🔹 Prompt 4: Layout Tổng Thể Hệ Thống (Full App Layout & Navigation)

> **Cách dùng:** Dán vào ChatGPT / Claude để nhờ dựng cấu trúc Layout tổng thể (App Shell).

```text
Build a complete Responsive App Layout Shell in React with Tailwind CSS that dynamically adapts based on User Role (user vs admin).

Layout Requirements:
- Navbar: Logo, Navigation Links, Role Badge (Admin / User), Notifications icon, Profile dropdown menu (Profile, Settings, Logout).
- Dynamic Sidebar:
  * For 'user': Dashboard, My Profile, Security / Change Password.
  * For 'admin': All user links + Admin Panel, User Management, System Logs, Role Settings.
- Main Content Area with breadcrumbs navigation.
- Alert Banner for unauthorized access attempts (e.g. 403 Forbidden page design for non-admin users trying to access /admin/dashboard).
```

---

## 🖼️ 2. Prompt Tạo Image Mockup Visual Design (Midjourney / DALL-E 3 / Flux)

Nếu bạn muốn tạo hình ảnh mô phỏng (Mockup/Concept Design) để đưa vào tài liệu thuyết trình hoặc thiết kế Figma:

### 📸 Prompt Midjourney/DALL-E: Auth & Admin Dashboard UI Mockup

```text
UI UX design mockup of a modern Authentication and Admin Dashboard web application, clean glassmorphism interface, dark mode theme with indigo and violet accent lighting, high resolution, dashboard widgets, user table, profile card, sleek typography, Figma style layout, Dribbble trending design, 8k resolution, crisp vector style --ar 16:9
```

### 📸 Prompt Midjourney/DALL-E: Mobile Auth Screen

```text
Mobile app UI UX mockup for Login and Register screen, modern iOS style, clean white and indigo background, smooth card design, elegant form inputs, rounded buttons, minimal graphic illustrations, high quality, Dribbble style --ar 9:16
```

---

## 🛠️ 3. Gợi Ý Các Công Cụ AI Tạo Giao Diện Tốt Nhất Hiện Nay

| Công Cụ                                      | Loại Đầu Ra              | Mô Tả & Điểm Mạnh                                                     |
| :------------------------------------------- | :----------------------- | :-------------------------------------------------------------------- |
| **[v0.dev](https://v0.dev)**                 | Code React + Tailwind UI | Công cụ xuất sắc nhất của Vercel để gen component UI chuẩn Shadcn UI. |
| **[Lovable.dev](https://lovable.dev)**       | Fullstack App Frontend   | Tự động dựng toàn bộ Web App frontend kèm kết nối API.                |
| **[Bolt.new](https://bolt.new)**             | Full React/Vite Project  | Dựng sẵn project Vite/React có thể chạy trực tiếp trên trình duyệt.   |
| **[Galileo AI](https://www.usegalileo.ai/)** | Thiết kế Figma           | Gen giao diện thiết kế xuất ra file Figma chỉnh sửa được.             |
| **Midjourney / DALL-E 3**                    | Hình ảnh PNG Mockup      | Dùng tạo hình minh họa concept giao diện chuyên nghiệp.               |

---

## 📌 4. Hướng Dẫn Kết Nối Giao Diện Với Backend Node.js hiện tại

Sau khi AI tạo xong giao diện Frontend (bằng React / Next.js / Vue), bạn kết nối với Backend AuthAPI này bằng cách:

1. **Đăng ký (`Register`):** `POST http://localhost:3000/api/auth/register` với body `{ name, email, password }`.
2. **Đăng nhập (`Login`):** `POST http://localhost:3000/api/auth/login` -> Lưu `token` nhận được vào `localStorage` hoặc `Cookie`.
3. **Lấy thông tin (`Profile`):** `GET http://localhost:3000/api/auth/me` kèm Header `Authorization: Bearer <token>`.
4. **Đổi mật khẩu (`Change Password`):** `PUT http://localhost:3000/api/auth/change-password` với body `{ oldPassword, newPassword }`.
5. **Truy cập Admin (`Admin Dashboard`):** `GET http://localhost:3000/api/auth/admin/dashboard` kèm Header `Authorization: Bearer <token>` (Tài khoản phải có `role: "admin"`).
