export const authMe = async (req, res) => {
    try {
        const user = req.user; // Lấy người dùng từ middleware xác thực

        return res.status(200).json({ user }); 
    } catch (error) {
        console.error('Lỗi lấy thông tin người dùng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
}