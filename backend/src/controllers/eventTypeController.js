import EventType from "../models/EventType.js";
import { logActivity } from "./activityLogController.js";

/* ================= CREATE ================= */
export const createEventType = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Tên loại sự kiện không được để trống" });
    }

    const exists = await EventType.findOne({ name: name.trim() });
    if (exists) {
      return res.status(409).json({ message: "Loại sự kiện đã tồn tại" });
    }

    const eventType = await EventType.create({
      name: name.trim(),
      createdBy: req.user?._id
    });

    if (req.user) {
      await logActivity(req.user._id, 'CREATE_EVENT_TYPE', 'EventType', eventType._id, req);
    }

    res.status(201).json(eventType);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= READ ALL ================= */
export const getEventTypes = async (req, res) => {
  try {
    const eventTypes = await EventType.find()
      .sort({ createdAt: -1 });

    res.json(eventTypes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= READ ONE ================= */
export const getEventTypeById = async (req, res) => {
  try {
    const eventType = await EventType.findById(req.params.id);

    if (!eventType) {
      return res.status(404).json({ message: "Không tìm thấy loại sự kiện" });
    }

    res.json(eventType);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE ================= */
export const updateEventType = async (req, res) => {
  try {
    const { name, isActive } = req.body;

    const eventType = await EventType.findById(req.params.id);
    if (!eventType) {
      return res.status(404).json({ message: "Không tìm thấy loại sự kiện" });
    }

    if (name !== undefined) eventType.name = name.trim();
    if (isActive !== undefined) eventType.isActive = isActive;

    await eventType.save();

    if (req.user) {
      await logActivity(req.user._id, 'UPDATE_EVENT_TYPE', 'EventType', req.params.id, req);
    }

    res.json(eventType);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE ================= */
// chỉ Admin mới vào được route này
export const deleteEventType = async (req, res) => {
  try {
    const { id } = req.params;

    const eventType = await EventType.findById(id);
    if (!eventType) {
      return res.status(404).json({ message: "Không tìm thấy loại sự kiện" });
    }

    const usedCount = await Event.countDocuments({ eventType: id });

    if (usedCount > 0) {
      return res.status(400).json({
        message: "Không thể xóa vì loại sự kiện đang được sử dụng",
      });
    }

    await eventType.deleteOne();
    
    if (req.user) {
      await logActivity(req.user._id, 'DELETE_EVENT_TYPE', 'EventType', id, req);
    }
    
    res.json({ message: "Xóa loại sự kiện thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

