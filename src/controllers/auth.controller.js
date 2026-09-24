import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { getAdminAuth } from "../config/firebase.js";
import { sendPasswordResetEmail } from "../config/mailer.js";

const removePassword = (user) => {
  const data = user.toObject();
  delete data.password;
  delete data.passwordResetToken;
  delete data.passwordResetExpires;
  return data;
};

/**
 * POST /api/auth/google-login
 * Nhận Firebase ID Token -> Xác thực qua Firebase Admin SDK -> Tìm hoặc tạo User -> Ký JWT hệ thống.
 */
export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        message: "idToken là bắt buộc",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    // 1. Xác thực ID Token qua Firebase Admin SDK
    let decodedToken;
    try {
      const auth = getAdminAuth();
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (err) {
      console.error(
        "[Google Login Verify Error]:",
        err.message,
        "Code:",
        err.code,
      );

      if (err.code === "auth/id-token-expired") {
        return res.status(401).json({
          message: "Firebase ID Token đã hết hạn",
          error: "Unauthorized",
          statusCode: 401,
        });
      }

      // Trả về chi tiết nguyên nhân lỗi để dễ debug chính xác
      return res.status(401).json({
        message: "Xác thực Firebase thất bại: " + err.message,
        error: "Unauthorized",
        code: err.code || "unknown",
        statusCode: 401,
      });
    }

    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({
        message: "Tài khoản Google không cung cấp email hợp lệ",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Tìm User trong Database
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      let updated = false;
      if (!user.googleId) {
        user.googleId = uid;
        updated = true;
      }
      if (picture && user.avatar === "default.jpg") {
        user.avatar = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // 3. Nếu chưa có tài khoản: tạo User mới với authType = 'google'
      user = await User.create({
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        googleId: uid,
        avatar: picture || "default.jpg",
        authType: "google",
        role: "user",
      });
    }

    // 4. Ký JWT của hệ thống
    const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
    const jwtSecret =
      process.env.JWT_SECRET || "your_super_secret_key_13082007";
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      jwtSecret,
      { expiresIn },
    );

    return res.status(200).json({
      message: "Đăng nhập Google thành công",
      user: removePassword(user),
      token,
      expiresIn,
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email và password là bắt buộc",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password phải có ít nhất 6 ký tự",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "Email đã được đăng ký",
        error: "Conflict",
        statusCode: 409,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Đăng ký thành công",
      user: removePassword(user),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email và password là bắt buộc",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (!user || !user.password) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
        error: "Unauthorized",
        statusCode: 401,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu không đúng",
        error: "Unauthorized",
        statusCode: 401,
      });
    }

    const jwtSecret =
      process.env.JWT_SECRET || "your_super_secret_key_13082007";
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      jwtSecret,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      message: "Đăng nhập thành công",
      user: removePassword(user),
      token,
      expiresIn: "1d",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const genericMessage =
      "Nếu email này tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.";

    if (!email) {
      return res.status(400).json({
        message: "Email là bắt buộc",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Tránh lộ tài khoản hoặc user đăng nhập qua Google OAuth
    if (!user || user.authType === "google") {
      return res.status(200).json({ message: genericMessage });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const ttlMinutes = Number(
      process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 15,
    );

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = new Date(Date.now() + ttlMinutes * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const clientUrl =
      process.env.CLIENT_URL ||
      process.env.FRONTEND_URL ||
      "http://localhost:3000";
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl,
      });
    } catch (error) {
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save({ validateBeforeSave: false });
      return next(error);
    }

    return res.status(200).json({ message: genericMessage });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "token và newPassword là bắt buộc",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password mới phải có ít nhất 6 ký tự",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    const passwordResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({
        message: "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
        error: "NotFound",
        statusCode: 404,
      });
    }

    return res.status(200).json({
      message: "Lấy thông tin thành công",
      user: removePassword(user),
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "oldPassword và newPassword là bắt buộc",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password mới phải có ít nhất 6 ký tự",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    const user = await User.findById(req.user.userId).select("+password");
    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
        error: "NotFound",
        statusCode: 404,
      });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({
        message: "Mật khẩu hiện tại không đúng",
        error: "Unauthorized",
        statusCode: 401,
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  return res.status(200).json({
    message: "Đăng xuất thành công",
  });
};
