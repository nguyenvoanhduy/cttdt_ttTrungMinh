import bcrypt from "bcrypt";
import User from "../models/User.js";
import Personal from "../models/Personal.js";
import Session from "../models/Session.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_TTL = "60m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days in seconds

export const register = async (req, res) => {
  try {
    const { phonenumber, password, role, fullname } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!phonenumber || !password || !fullname) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đầy đủ thông tin" });
    }
    // Kiểm tra sđt đã tồn tại
    const existingUser = await User.findOne({ phonenumber });
    if (existingUser) {
      return res.status(400).json({ message: "Số điện thoại đã được sử dụng" });
    }

    // Tạo hồ sơ cá nhân (Personal)
    const newPersonal = new Personal({
      fullname,
      phonenumber,
      role,
      status: "Đang hoạt động",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newPersonal.save();

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10); //saltRounds = 10

    // Tạo người dùng (User)
    const newUser = new User({
      phonenumber,
      role: role || "Thành Viên",
      password: hashedPassword,
      personalId: newPersonal._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newUser.save();

    res
      .status(201)
      .json({ message: "Đăng ký thành công", userId: newUser._id });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export const logIn = async (req, res) => {
  try {
    // Lấy input từ body
    const { phonenumber, password } = req.body;

    //Kiểm tra dữ liệu đầu vào
    if (!phonenumber || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đầy đủ thông tin" });
    }

    // Tìm người dùng theo sđt
    const user = await User.findOne({ phonenumber });
    if (!user) {
      return res.status(404).json({ message: "Số điện thoại không tồn tại" });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không đúng" });
    }

    // Tạo access token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    // Tạo refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // tạo session lưu refresh token vào db
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL), // thời gian hết hạn
    });
    // trả refresh token về trong cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });
    // Trả access token qua response
    res.status(200).json({
      message: "Đăng nhập thành công",
      accessToken,
      requirePasswordChange: user.requirePasswordChange || false,
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export const logOut = async (req, res) => {
  try {
    // Lấy refresh token từ cookie
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res
        .status(400)
        .json({ message: "Không tìm thấy token đăng xuất" });
    }

    //Xóa refresh token khỏi session trong db
    await Session.findOneAndDelete({ refreshToken: token });

    //Xoá cookie trên trình duyệt
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export const getMe = async (req, res) => {
  try {
    // populate để lấy toàn bộ thông tin Personal và temple history
    const user = await req.user.populate({
      path: "personalId",
      populate: {
        path: "templeHistory.templeId",
        model: "Temple",
        select: "name address"
      }
    });

    res.status(200).json({
      user: {
        _id: user._id,
        role: user.role,
        phoneNumber: user.phonenumber,
      },
      personal: user.personalId ? user.personalId : null,
    });
  } catch (error) {
    console.error("Lỗi getMe:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin" });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 4 ký tự" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu và bỏ flag requirePasswordChange
    user.password = hashedPassword;
    user.requirePasswordChange = false;
    user.updatedAt = new Date();
    await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
