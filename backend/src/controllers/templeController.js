import Temple from "../models/Temple.js";
import Personal from "../models/Personal.js";
import { logActivity } from "./activityLogController.js";

// CREATE
export const createTemple = async (req, res) => {
  try {
    const temple = new Temple(req.body);
    await temple.save();
    
    if (req.user) {
      await logActivity(req.user._id, 'CREATE_TEMPLE', 'Temple', temple._id, req);
    }
    
    res.status(201).json(temple);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ ALL
export const getTemples = async (req, res) => {
  try {
    const temples = await Temple.find();
    res.json(temples);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
export const getTempleById = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);
    if (!temple) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(temple);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateTemple = async (req, res) => {
  try {
    const temple = await Temple.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!temple) return res.status(404).json({ message: "Không tìm thấy" });
    
    if (req.user) {
      await logActivity(req.user._id, 'UPDATE_TEMPLE', 'Temple', req.params.id, req);
    }
    
    res.json(temple);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
export const deleteTemple = async (req, res) => {
  try {
    const templeId = req.params.id;
    
    console.log('=== DELETE TEMPLE DEBUG ===');
    console.log('Temple ID to delete:', templeId);
    
    // Kiểm tra xem có tín đồ nào đang sinh hoạt tại Thánh Thất này không
    // Kiểm tra cả currentTempleId và templeHistory.templeId
    const personalsInTemple = await Personal.find({
      $or: [
        { currentTempleId: templeId },
        { 'templeHistory.templeId': templeId }
      ]
    });
    
    console.log('Personals found:', personalsInTemple.length);
    
    if (personalsInTemple.length > 0) {
      console.log('Cannot delete - has personals:', personalsInTemple.map(p => p.fullname));
      return res.status(400).json({ 
        message: `Không thể xóa Thánh Thất này vì đang có ${personalsInTemple.length} tín đồ có lịch sử sinh hoạt tại đây` 
      });
    }
    
    const temple = await Temple.findByIdAndDelete(templeId);
    if (!temple) return res.status(404).json({ message: "Không tìm thấy" });
    
    if (req.user) {
      await logActivity(req.user._id, 'DELETE_TEMPLE', 'Temple', templeId, req);
    }
    
    console.log('Temple deleted successfully');
    res.json({ message: "Đã xóa thành công" });
  } catch (err) {
    console.error('Error deleting temple:', err);
    res.status(500).json({ message: err.message });
  }
};