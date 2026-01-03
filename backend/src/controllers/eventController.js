import Event from "../models/Event.js";
import EventRegistration from "../models/EventRegistration.js";
import { logActivity } from "./activityLogController.js";

// CREATE
export const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    
    // Log activity
    if (req.user) {
      await logActivity(req.user._id, 'CREATE_EVENT', 'Event', event._id, req);
    }
    
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ ALL
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
    .populate("eventType", "name")
    .populate("members", "fullname phonenumber")
    .populate("organizer", "fullname phonenumber");
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
export const getEventId = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
    .populate("eventType", "name")
    .populate("members", "fullname phonenumber")
    .populate("organizer", "fullname phonenumber");
    if (!event) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateEvent = async (req, res) => {
  try {
    console.log(req.body);
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ message: "Không tìm thấy" });
    
    // Log activity
    if (req.user) {
      await logActivity(req.user._id, 'UPDATE_EVENT', 'Event', req.params.id, req);
    }
    
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Không tìm thấy" });
    
    // Log activity
    if (req.user) {
      await logActivity(req.user._id, 'DELETE_EVENT', 'Event', req.params.id, req);
    }
    
    res.json({ message: "Đã xóa thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REGISTER FOR EVENT
export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Kiểm tra xem sự kiện có tồn tại không
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Không tìm thấy sự kiện" });
    }

    // Kiểm tra xem đã đăng ký chưa
    const existingRegistration = await EventRegistration.findOne({ 
      eventId, 
      userId 
    });
    
    if (existingRegistration) {
      return res.status(400).json({ message: "Bạn đã đăng ký sự kiện này rồi" });
    }

    // Tạo đăng ký mới
    const registration = new EventRegistration({
      eventId,
      userId,
      registrationDate: new Date(),
      status: "Đã xác nhận"
    });

    await registration.save();

    // Tăng số lượng người tham gia
    event.participantsCount = (event.participantsCount || 0) + 1;
    await event.save();

    res.status(201).json({ 
      message: "Đăng ký thành công",
      data: registration 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET USER REGISTRATIONS
export const getUserRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;
    const registrations = await EventRegistration.find({ userId })
      .populate({
        path: "eventId",
        populate: [
          { path: "eventType", select: "name" },
          { path: "organizer", select: "fullname phonenumber" }
        ]
      });
    
    res.json({ data: registrations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE EVENT STATUS AUTOMATICALLY
export const updateEventStatus = async (req, res) => {
  try {
    const now = new Date();
    const events = await Event.find();
    
    let updatedCount = 0;
    
    for (const event of events) {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      
      let newStatus;
      if (now < start) {
        newStatus = "UPCOMING"; // Sắp diễn ra
      } else if (now >= start && now <= end) {
        newStatus = "ONGOING"; // Đang diễn ra
      } else {
        newStatus = "COMPLETED"; // Đã hoàn thành
      }
      
      // Chỉ cập nhật nếu trạng thái thay đổi
      if (event.status !== newStatus) {
        event.status = newStatus;
        await event.save();
        updatedCount++;
      }
    }
    
    res.json({ 
      message: "Cập nhật trạng thái thành công",
      updatedCount,
      totalEvents: events.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};