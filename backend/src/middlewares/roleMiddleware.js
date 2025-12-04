// middlewares/roleMiddleware.js
export const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    next();
  };
};