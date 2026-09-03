import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AuthAPI - Authentication & Authorization API",
      version: "1.0.0",
      description:
        "REST API hệ thống xác thực (Authentication) và phân quyền (RBAC) sử dụng Node.js, Express, MongoDB và JWT.\n\n" +
        "## Tính năng chính\n" +
        "- 🔐 Đăng ký / Đăng nhập / Đăng xuất\n" +
        "- 👤 Xem thông tin cá nhân\n" +
        "- 🔑 Đổi mật khẩu\n" +
        "- 🛡️ Phân quyền theo vai trò (User / Admin)\n\n" +
        "## Xác thực (Authentication)\n" +
        "API sử dụng **JWT Bearer Token**. Sau khi đăng nhập, gửi token trong Header:\n" +
        "```\nAuthorization: Bearer <your_token>\n```",
      contact: {
        name: "AuthAPI Developer",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Nhập JWT token nhận được từ API đăng nhập (login). Ví dụ: eyJhbGciOiJIUzI1NiIs...",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "ID của người dùng (MongoDB ObjectId)",
              example: "6a8c4967d4971d564b9ba663",
            },
            name: {
              type: "string",
              description: "Tên hiển thị của người dùng",
              example: "Nguyen Van A",
            },
            email: {
              type: "string",
              format: "email",
              description: "Địa chỉ email (unique, lowercase)",
              example: "nguyenvana@example.com",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              description: "Vai trò của người dùng",
              example: "user",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Thời gian tạo tài khoản",
              example: "2026-08-24T13:38:47.263Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Thời gian cập nhật gần nhất",
              example: "2026-08-24T13:38:47.263Z",
            },
            __v: {
              type: "integer",
              description: "Version key (MongoDB)",
              example: 0,
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              description: "Tên hiển thị",
              example: "Nguyen Van A",
            },
            email: {
              type: "string",
              format: "email",
              description: "Địa chỉ email",
              example: "nguyenvana@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              description: "Mật khẩu (tối thiểu 6 ký tự)",
              example: "123456",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Địa chỉ email đã đăng ký",
              example: "nguyenvana@example.com",
            },
            password: {
              type: "string",
              description: "Mật khẩu",
              example: "123456",
            },
          },
        },
        ChangePasswordRequest: {
          type: "object",
          required: ["oldPassword", "newPassword"],
          properties: {
            oldPassword: {
              type: "string",
              description: "Mật khẩu hiện tại",
              example: "123456",
            },
            newPassword: {
              type: "string",
              minLength: 6,
              description: "Mật khẩu mới (tối thiểu 6 ký tự)",
              example: "654321",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Mô tả lỗi chi tiết",
            },
            error: {
              type: "string",
              description: "Loại lỗi",
            },
            statusCode: {
              type: "integer",
              description: "Mã trạng thái HTTP",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
