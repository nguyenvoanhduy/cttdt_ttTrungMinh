import Personal from "../models/Personal.js";
import Event from "../models/Event.js";
import { logActivity } from "./activityLogController.js";
import User from "../models/User.js";

// CREATE
export const createPersonal = async (req, res) => {
  try {
    console.log('Creating personal with data:', { ...req.body, currentTempleId: req.body.currentTempleId });
    const person = new Personal(req.body);
    await person.save();
    console.log('Personal created with currentTempleId:', person.currentTempleId);
    
    // Log activity
    if (req.user) {
      await logActivity(req.user._id, 'CREATE_PERSONAL', 'Personal', person._id, req);
    }
    
    res.status(201).json(person);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ ALL
export const getPersonals = async (req, res) => {
  try {
    const persons = await Personal.find()
      .populate("department", "name")
      .populate("currentTempleId", "name");
    
    // Lấy User data để có số điện thoại
    const personsWithPhone = await Promise.all(
      persons.map(async (person) => {
        const user = await User.findOne({ personalId: person._id }).select('phonenumber');
        const personObj = person.toObject();
        if (user) {
          personObj.userPhone = user.phonenumber;
        }
        return personObj;
      })
    );
    
    res.json(personsWithPhone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
export const getPersonalById = async (req, res) => {
  try {
    const person = await Personal.findById(req.params.id);
    if (!person) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(person);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updatePersonal = async (req, res) => {
  try {
    console.log('Updating personal with data:', { ...req.body, currentTempleId: req.body.currentTempleId });
    
    // Nếu templeHistory là array rỗng hoặc undefined, không update field này
    const updateData = { ...req.body };
    if (!updateData.templeHistory || updateData.templeHistory.length === 0) {
      delete updateData.templeHistory; // Không update field này, giữ nguyên dữ liệu cũ
    }
    
    const person = await Personal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!person) return res.status(404).json({ message: "Không tìm thấy" });
    console.log('Personal updated with currentTempleId:', person.currentTempleId);
    console.log('Personal templeHistory length:', person.templeHistory?.length || 0);
    
    // Log activity
    if (req.user) {
      await logActivity(req.user._id, 'UPDATE_PERSONAL', 'Personal', req.params.id, req);
    }
    
    res.json(person);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
export const deletePersonal = async (req, res) => {
  try {
    const usedInEvent = await Event.exists({
      $or: [
        { organizerId: req.params.id },
        { members: req.params.id },
      ],
    });

    if (usedInEvent) {
      return res.status(400).json({
        message: "Không thể xóa nhân sự đang tham gia sự kiện",
      });
    }

    const person = await Personal.findByIdAndDelete(req.params.id);
    if (!person) {
      return res.status(404).json({ message: "Không tìm thấy" });
    }

    // Log activity
    if (req.user) {
      await logActivity(req.user._id, 'DELETE_PERSONAL', 'Personal', req.params.id, req);
    }

    res.json({ message: "Đã xóa thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPLOAD AVATAR
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get user with populated personalId
    const user = await User.findById(req.user._id).populate('personalId');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.personalId) {
      return res.status(404).json({ message: "Personal record not found" });
    }

    // Update personal document directly
    const personalId = user.personalId._id;
    const updatedPersonal = await Personal.findByIdAndUpdate(
      personalId,
      { avatarUrl: req.file.path },
      { new: true }
    );

    if (!updatedPersonal) {
      return res.status(404).json({ message: "Failed to update personal" });
    }

    // Log activity
    await logActivity(req.user._id, 'UPDATE_AVATAR', 'Personal', personalId, req);

    res.json({ avatarUrl: req.file.path });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ message: err.message });
  }
};