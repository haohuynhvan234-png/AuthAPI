import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
const removePassword = (user) => {
  const data = user.toObject();

  delete data.password;

  return data;
};
import admin from "../config/firebase.js";

/**
 * POST /api/auth/google-login
 * Nháº­n Firebase ID Token -> XÃ¡c thá»±c qua Firebase Admin SDK -> TÃ¬m hoáº·c táº¡o User -> KÃ½ JWT há»‡ thá»‘ng.
 */
export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        message: "idToken lÃ  báº¯t buá»™c",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    // 1. XÃ¡c thá»±c ID Token qua Firebase Admin SDK
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (err) {
      if (err.code === "auth/id-token-expired") {
        return res.status(401).json({
          message: "Firebase ID Token Ä‘Ã£ háº¿t háº¡n",
          error: "Unauthorized",
          statusCode: 401,
        });
      }
      return res.status(401).json({
        message: "Firebase ID Token khÃ´ng há»£p lá»‡",
        error: "Unauthorized",
        statusCode: 401,
      });
    }

    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({
        message: "TÃ i khoáº£n Google khÃ´ng cung cáº¥p email há»£p lá»‡",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. TÃ¬m User trong Database
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // Náº¿u Ä‘Ã£ cÃ³ tÃ i khoáº£n: cáº­p nháº­t thÃªm googleId/avatar náº¿u trÆ°á»›c Ä‘Ã³ Ä‘Äƒng kÃ½ local
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
      // 3. Náº¿u chÆ°a cÃ³ tÃ i khoáº£n: táº¡o User má»›i vá»›i authType = 'google'
      user = await User.create({
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        googleId: uid,
        avatar: picture || "default.jpg",
        authType: "google",
        role: "user",
      });
    }

    // 4. KÃ½ JWT cá»§a há»‡ thá»‘ng (dÃ¹ng chung quy Æ°á»›c vá»›i login thÆ°á»ng)
    const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn },
    );

    return res.status(200).json({
      message: "ÄÄƒng nháº­p Google thÃ nh cÃ´ng",
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

    // 1. Kiá»ƒm tra dá»¯ liá»‡u
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email vÃ  password lÃ  báº¯t buá»™c",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    // 2. Kiá»ƒm tra password
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    // 3. Chuáº©n hÃ³a email
    const normalizedEmail = email.trim().toLowerCase();

    // 4. Kiá»ƒm tra email tá»“n táº¡i
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email Ä‘Ã£ Ä‘Æ°á»£c Ä‘Äƒng kÃ½",
        error: "Conflict",
        statusCode: 409,
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Táº¡o user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // 7. Tráº£ káº¿t quáº£
    return res.status(201).json({
      message: "ÄÄƒng kÃ½ thÃ nh cÃ´ng",
      user: removePassword(user),
    });
    //8. Ä‘Äƒng nháº­p user
  } catch (error) {
    next(error);
  }
};
export const login = async (req, res, next) => {
  try {
    // 1. Láº¥y dá»¯ liá»‡u tá»« request
    const { email, password } = req.body;

    // 2. Kiá»ƒm tra dá»¯ liá»‡u
    if (!email || !password) {
      return res.status(400).json({
        message: "Email vÃ  password lÃ  báº¯t buá»™c",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    // 3. Chuáº©n hÃ³a email
    const normalizedEmail = email.trim().toLowerCase();

    // 4. TÃ¬m user
    // Pháº£i dÃ¹ng .select("+password")
    // vÃ¬ trong User Model password Ä‘ang select: false
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    // 5. KhÃ´ng tÃ¬m tháº¥y user hoáº·c user khÃ´ng cÃ³ máº­t kháº©u
    if (!user || !user.password) {
      return res.status(401).json({
        message: "Email hoáº·c máº­t kháº©u khÃ´ng Ä‘Ãºng",
        error: "Unauthorized",
        statusCode: 401,
      });
    }

    // 6. Kiá»ƒm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Email hoáº·c máº­t kháº©u khÃ´ng Ä‘Ãºng",
        error: "Unauthorized",
        statusCode: 401,
      });
    }

    // 7. Táº¡o JWT
    const jwtSecret =
      process.env.JWT_SECRET || "your_super_secret_key_13082007";
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: "1d",
      },
    );

    // 8. Tráº£ káº¿t quáº£
    return res.status(200).json({
      message: "ÄÄƒng nháº­p thÃ nh cÃ´ng",
      user: removePassword(user),
      token,
      expiresIn: "1d",
    });
  } catch (error) {
    next(error);
  }
};
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng",
        error: "NotFound",
        statusCode: 404,
      });
    }

    return res.status(200).json({
      message: "Láº¥y thÃ´ng tin thÃ nh cÃ´ng",
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
        message: "oldPassword vÃ  newPassword lÃ  báº¯t buá»™c",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password má»›i pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±",
        error: "BadRequest",
        statusCode: 400,
      });
    }

    const user = await User.findById(req.user.userId).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng",
        error: "NotFound",
        statusCode: 404,
      });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      return res.status(401).json({
        message: "Máº­t kháº©u hiá»‡n táº¡i khÃ´ng Ä‘Ãºng",
        error: "Unauthorized",
        statusCode: 401,
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.status(200).json({
      message: "Äá»•i máº­t kháº©u thÃ nh cÃ´ng",
    });
  } catch (error) {
    next(error);
  }
};
export const logout = async (req, res) => {
  return res.status(200).json({
    message: "ÄÄƒng xuáº¥t thÃ nh cÃ´ng",
  });
};
