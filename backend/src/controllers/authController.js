import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Personal from '../models/Personal.js';
import Session from '../models/Session.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days in seconds

export const signUp = async (req, res) => {
  try {
    const { email, password, fullname } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!email || !password || !fullname) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Tạo hồ sơ cá nhân (Personal)
    const newPersonal = new Personal({
      fullname,
      status: 'Đang hoạt động',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await newPersonal.save();

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10); //saltRounds = 10

    // Tạo người dùng (User)
    const newUser = new User({
      email,
      password: hashedPassword,
      personalId: newPersonal._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công', userId: newUser._id });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

export const signIn = async (req, res) => {
    try {
        // Lấy input từ body
        const { email, password } = req.body;

        //Kiểm tra dữ liệu đầu vào
        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
        }

        // Tìm người dùng theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Email không tồn tại' });
        }

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
        }

        // Tạo access token
        const accessToken = jwt.sign(
        { 
            userId: user._id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_TTL }
        );

        // Tạo refresh token
        const refreshToken = crypto.randomBytes(64).toString('hex');

        // tạo session lưu refresh token vào db
        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL) // thời gian hết hạn
        });
        // trả refresh token về trong cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: REFRESH_TOKEN_TTL
        }); 
        // Trả access token qua response
        res.status(200).json({
        message: 'Đăng nhập thành công',
        accessToken
        });
    } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }

};

export const signOut = async (req, res) => {
    try {
        // Lấy refresh token từ cookie
        const token = req.cookies?.refreshToken;

        if (!token) {
            return res.status(400).json({ message: 'Không tìm thấy token đăng xuất' });
        }

        //Xóa refresh token khỏi session trong db
        await Session.findOneAndDelete({ refreshToken: token });

        //Xoá cookie trên trình duyệt
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.status(200).json({ message: 'Đăng xuất thành công' });
    } catch (error) {
        console.error('Lỗi đăng xuất:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};
