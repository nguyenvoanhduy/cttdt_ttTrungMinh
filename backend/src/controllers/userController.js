import User from "../models/User.js";
import Personal from "../models/Personal.js";
import bcrypt from "bcrypt";
import { logActivity } from "./activityLogController.js";

export const authMe = async (req, res) => {
    try {
        const user = req.user; // Lấy người dùng từ middleware xác thực

        return res.status(200).json({ user }); 
    } catch (error) {
        console.error('Lỗi lấy thông tin người dùng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
}

// Get all users with personal info
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .populate('personalId', 'fullname avatarUrl')
            .select('-password -refreshToken')
            .sort({ createdAt: -1 });

        res.status(200).json({ users });
    } catch (error) {
        console.error('Lỗi lấy danh sách users:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
}

// Create new user account
export const createUser = async (req, res) => {
    try {
        const { phonenumber, role, personalId } = req.body;

        // Validate input
        if (!phonenumber || !personalId) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        // Check if phone number already exists
        const existingUser = await User.findOne({ phonenumber });
        if (existingUser) {
            return res.status(400).json({ message: 'Số điện thoại đã được sử dụng' });
        }

        // Check if personal exists
        const personal = await Personal.findById(personalId);
        if (!personal) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin tín đồ' });
        }

        // Check if personal already has an account
        const existingUserForPersonal = await User.findOne({ personalId });
        if (existingUserForPersonal) {
            return res.status(400).json({ message: 'Tín đồ này đã có tài khoản' });
        }

        // Update personal with phonenumber
        personal.phonenumber = phonenumber;
        await personal.save();

        // Default password is "1"
        const hashedPassword = await bcrypt.hash("1", 10);

        const newUser = new User({
            phonenumber,
            password: hashedPassword,
            role: role || 'Thành Viên',
            personalId,
            requirePasswordChange: true, // Yêu cầu đổi mật khẩu lần đầu
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await newUser.save();

        const userWithPersonal = await User.findById(newUser._id)
            .populate('personalId', 'fullname avatarUrl')
            .select('-password -refreshToken');

        // Log activity
        await logActivity(req.user._id, 'CREATE_USER', 'User', newUser._id, req);

        res.status(201).json({ 
            message: 'Tạo tài khoản thành công', 
            user: userWithPersonal 
        });
    } catch (error) {
        console.error('Lỗi tạo user:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
}

// Update user role
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ message: 'Vui lòng cung cấp vai trò' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role, updatedAt: new Date() },
            { new: true }
        )
            .populate('personalId', 'fullname avatarUrl')
            .select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }

        // Log activity
        await logActivity(req.user._id, 'UPDATE_USER_ROLE', 'User', id, req);

        res.status(200).json({ 
            message: 'Cập nhật vai trò thành công', 
            user 
        });
    } catch (error) {
        console.error('Lỗi cập nhật user:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
}

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }

        // Remove phonenumber from Personal when deleting user
        if (user.personalId) {
            await Personal.findByIdAndUpdate(user.personalId, { 
                $unset: { phonenumber: "" } 
            });
        }

        await User.findByIdAndDelete(id);

        // Log activity
        await logActivity(req.user._id, 'DELETE_USER', 'User', id, req);

        res.status(200).json({ message: 'Xóa tài khoản thành công' });
    } catch (error) {
        console.error('Lỗi xóa user:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
}

// Update user password (Admin only)
export const updateUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu mới' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and set requirePasswordChange to false
        user.password = hashedPassword;
        user.requirePasswordChange = false;
        user.updatedAt = new Date();
        await user.save();

        // Log activity
        await logActivity(req.user._id, 'UPDATE_USER_PASSWORD', 'User', id, req);

        res.status(200).json({ 
            message: 'Đổi mật khẩu thành công'
        });
    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
}