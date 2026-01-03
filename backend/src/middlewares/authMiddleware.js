import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectedRoute = async (req, res, next) => {
    try {
        //Lấy token từ header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // bearer token
        
        console.log('Auth Header:', authHeader ? authHeader.substring(0, 30) + '...' : 'NO AUTH HEADER');
        console.log('Token:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
        
        if (!token) {
            return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
        }
        
        //Xác thực token hợp lệ
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                console.error('Lỗi xác thực token:', err.message);
                console.error('Token Secret exists:', !!process.env.ACCESS_TOKEN_SECRET);
                return res.status(403).json({ message: 'Token không hợp lệ' });
            }
            
            // tìm user 
            const user = await User.findById(decoded.userId).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'Người dùng không tồn tại' });
            }

            // trả user về trong reg
            req.user = user;
            next();
        });

        
    } catch (error) {
        console.error('Lỗi xác thực người dùng:', error);
        return res.status(500).json({ message: 'Xác thực thất bại' });
    }
}