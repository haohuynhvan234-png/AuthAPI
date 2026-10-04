import fs from "fs";

const controllerPath = "src/controllers/auth.controller.js";
let controllerCode = fs.readFileSync(controllerPath, "utf8");

const logoutSnippet = "export const logout = async (req, res) => {";
const updateProfileCode = `export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};

    if (name !== undefined && name.trim()) {
      updates.name = name.trim();
    }

    if (avatar !== undefined) {
      updates.avatar = avatar.trim() || "default.jpg";
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { returnDocument: "after" }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
        error: "NotFound",
        statusCode: 404,
      });
    }

    return res.status(200).json({
      message: "Cập nhật thông tin thành công",
      user: removePassword(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {`;

if (!controllerCode.includes(logoutSnippet)) {
  console.error("logout snippet not found");
  process.exit(1);
}

controllerCode = controllerCode.replace(logoutSnippet, updateProfileCode);
fs.writeFileSync(controllerPath, controllerCode, "utf8");
console.log("Updated controller with updateProfile");

// Update routes
const routesPath = "src/routes/auth.routes.js";
let routesCode = fs.readFileSync(routesPath, "utf8");

routesCode = routesCode.replace(
  "  changePassword,\n  logout,",
  "  changePassword,\n  updateProfile,\n  logout,"
);

const routeTarget = 'router.put("/change-password", authMiddleware, changePassword);';
const routeReplacement = `router.put("/change-password", authMiddleware, changePassword);\n\n// ============================================================\n//  PUT /api/auth/profile - Cập nhật thông tin cá nhân (Avatar / Name)\n// ============================================================\nrouter.put("/profile", authMiddleware, updateProfile);`;

routesCode = routesCode.replace(routeTarget, routeReplacement);
fs.writeFileSync(routesPath, routesCode, "utf8");
console.log("Updated routes with /api/auth/profile");