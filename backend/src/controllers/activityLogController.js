import ActivityLog from "../models/ActivityLog.js";
import User from "../models/User.js";

// Get all activity logs with pagination
export const getActivityLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50, action, targetCollection } = req.query;
        
        // Build filter
        const filter = {};
        if (action) filter.action = action;
        if (targetCollection) filter.targetCollection = targetCollection;

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            ActivityLog.find(filter)
                .populate('userId', 'phonenumber role personalId')
                .populate({
                    path: 'userId',
                    populate: {
                        path: 'personalId',
                        select: 'fullname avatarUrl'
                    }
                })
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(skip),
            ActivityLog.countDocuments(filter)
        ]);

        res.status(200).json({
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Lỗi lấy activity logs:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

// Create activity log (utility function for other controllers to use)
export const createActivityLog = async (req, res) => {
    try {
        const { action, targetCollection, targetId } = req.body;
        const userId = req.user._id;
        const ip = req.ip || req.connection.remoteAddress;

        const log = new ActivityLog({
            userId,
            action,
            targetCollection,
            targetId,
            ip,
        });

        await log.save();

        res.status(201).json({ message: 'Log created', log });
    } catch (error) {
        console.error('Lỗi tạo activity log:', error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

// Helper function to log activity (can be imported and used in other controllers)
export const logActivity = async (userId, action, targetCollection, targetId, req) => {
    try {
        const ip = req?.ip || req?.connection?.remoteAddress || 'unknown';
        
        const log = new ActivityLog({
            userId,
            action,
            targetCollection,
            targetId,
            ip,
        });

        await log.save();
        return log;
    } catch (error) {
        console.error('Lỗi log activity:', error);
        // Don't throw error, just log it
        return null;
    }
};
