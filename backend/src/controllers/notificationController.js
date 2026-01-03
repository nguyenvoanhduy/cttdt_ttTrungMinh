import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Personal from "../models/Personal.js";
import { logActivity } from "./activityLogController.js";

// CREATE - Gửi thông báo đến nhiều user (lưu 1 bản ghi với recipients array)
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, link, thumbnailUrl, targetGroups } = req.body;

    // Validate
    if (!title || !message) {
      return res.status(400).json({ message: "Tiêu đề và nội dung là bắt buộc" });
    }

    if (!targetGroups || !Array.isArray(targetGroups) || targetGroups.length === 0) {
      return res.status(400).json({ message: "Vui lòng chọn ít nhất một đối tượng nhận thông báo" });
    }

    let recipientIds = new Set(); // Dùng Set để tránh trùng lặp

    // Xác định người nhận dựa trên targetGroups
    for (const group of targetGroups) {
      if (group === "Tất cả tín đồ") {
        // Lấy tất cả users
        const allUsers = await User.find({}, "_id");
        allUsers.forEach(u => recipientIds.add(u._id.toString()));
      } else {
        // Tìm personal theo department name
        const personals = await Personal.find({ department: group }, "userId");
        personals.forEach(p => {
          if (p.userId) {
            recipientIds.add(p.userId.toString());
          }
        });
      }
    }

    // Convert Set to Array và tạo recipients structure
    const recipientsArray = Array.from(recipientIds).map(userId => ({
      userId,
      isRead: false,
      readAt: null
    }));

    if (recipientsArray.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy người nhận phù hợp" });
    }

    // Tạo 1 notification với recipients array
    const notification = await Notification.create({
      title,
      message,
      type: type || "system",
      link,
      thumbnailUrl,
      targetGroups,
      recipients: recipientsArray,
      createdBy: req.user._id
    });

    // Log activity
    if (req.user) {
      await logActivity(req.user._id, 'SEND_NOTIFICATION', 'Notification', notification._id, req);
    }

    res.status(201).json({
      message: `Đã gửi thông báo đến ${recipientsArray.length} người`,
      count: recipientsArray.length,
      data: notification,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL (Admin only - lấy tất cả thông báo để quản lý)
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('createdBy', 'name email')
      .lean();

    // Add recipient count to each notification
    const notificationsWithCount = notifications.map(notif => ({
      ...notif,
      recipientCount: notif.recipients?.length || 0
    }));

    res.json({ data: notificationsWithCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET MY NOTIFICATIONS (User lấy thông báo của chính mình)
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Tìm notifications có userId trong recipients array
    const notifications = await Notification.find({
      'recipients.userId': userId
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Map để thêm thông tin isRead của user hiện tại
    const userNotifications = notifications.map(notif => {
      const userRecipient = notif.recipients.find(
        r => r.userId.toString() === userId
      );
      return {
        ...notif,
        isRead: userRecipient?.isRead || false,
        readAt: userRecipient?.readAt || null
      };
    });

    // Đếm số thông báo chưa đọc
    const unreadCount = userNotifications.filter(n => !n.isRead).length;

    res.json({
      data: userNotifications,
      unreadCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// MARK AS READ
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Tìm notification có userId trong recipients
    const notification = await Notification.findOne({
      _id: id,
      'recipients.userId': userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }

    // Cập nhật isRead cho recipient cụ thể
    const recipientIndex = notification.recipients.findIndex(
      r => r.userId.toString() === userId
    );

    if (recipientIndex !== -1) {
      notification.recipients[recipientIndex].isRead = true;
      notification.recipients[recipientIndex].readAt = new Date();
      await notification.save();
    }

    res.json({ message: "Đã đánh dấu đã đọc", data: notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// MARK ALL AS READ
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm tất cả notifications của user
    const notifications = await Notification.find({
      'recipients.userId': userId
    });

    // Cập nhật isRead cho từng notification
    for (const notif of notifications) {
      const recipientIndex = notif.recipients.findIndex(
        r => r.userId.toString() === userId && !r.isRead
      );
      
      if (recipientIndex !== -1) {
        notif.recipients[recipientIndex].isRead = true;
        notif.recipients[recipientIndex].readAt = new Date();
        await notif.save();
      }
    }

    res.json({ message: "Đã đánh dấu tất cả là đã đọc" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE - Xóa recipient khỏi notification, nếu là admin thì xóa cả notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: id,
      'recipients.userId': userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }

    // Nếu user là admin hoặc createdBy, xóa toàn bộ notification
    if (req.user.role === 'admin' || notification.createdBy?.toString() === userId) {
      await Notification.findByIdAndDelete(id);
      return res.json({ message: "Đã xóa thông báo hoàn toàn" });
    }

    // User thường: chỉ xóa recipient của mình
    notification.recipients = notification.recipients.filter(
      r => r.userId.toString() !== userId
    );

    if (notification.recipients.length === 0) {
      await Notification.findByIdAndDelete(id);
    } else {
      await notification.save();
    }

    res.json({ message: "Đã xóa thông báo" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET NOTIFICATION STATS (Admin)
export const getNotificationStats = async (req, res) => {
  try {
    const notifications = await Notification.find();
    
    let totalRecipients = 0;
    let readRecipients = 0;

    notifications.forEach(notif => {
      totalRecipients += notif.recipients.length;
      readRecipients += notif.recipients.filter(r => r.isRead).length;
    });

    res.json({
      totalNotifications: notifications.length,
      totalRecipients,
      readRecipients,
      unreadRecipients: totalRecipients - readRecipients,
      readRate: totalRecipients > 0 ? ((readRecipients / totalRecipients) * 100).toFixed(2) : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
