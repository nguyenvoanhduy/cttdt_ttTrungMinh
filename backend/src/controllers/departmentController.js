import Department from "../models/Department.js";
import Personal from "../models/Personal.js";
import { logActivity } from "./activityLogController.js";

// CREATE
export const createDepartment = async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    await department.populate('managerId', 'fullname avatarUrl');
    
    // Log activity
    if (req.user) {
      await logActivity(req.user._id, 'CREATE_DEPARTMENT', 'Department', department._id, req);
    }
    
    res.status(201).json({ success: true, data: department });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// READ ALL
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('managerId', 'fullname avatarUrl')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// READ ONE
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('managerId', 'fullname avatarUrl');
    if (!department) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    res.json({ success: true, data: department });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
export const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('managerId', 'fullname avatarUrl');
    if (!department) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    
    // Log activity
    if (req.user) {
      await logActivity(req.user._id, 'UPDATE_DEPARTMENT', 'Department', req.params.id, req);
    }
    
    res.json({ success: true, data: department });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE
export const deleteDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;
    
    console.log('=== DELETE DEPARTMENT DEBUG ===');
    console.log('Department ID to delete:', departmentId);
    
    // Lấy tất cả tín đồ thuộc Ban này
    const personalsInDepartment = await Personal.find({ department: departmentId });
    console.log('Total personals in department:', personalsInDepartment.length);
    
    // Lọc ra những người KHÔNG phải Trưởng Ban
    const nonManagerMembers = personalsInDepartment.filter(
      p => p.position !== 'Trưởng Ban'
    );
    console.log('Non-manager members:', nonManagerMembers.length);
    
    // Nếu còn thành viên không phải Trưởng Ban thì không cho xóa
    if (nonManagerMembers.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Không thể xóa Ban này vì còn ${nonManagerMembers.length} thành viên (không tính Trưởng Ban)` 
      });
    }
    
    const department = await Department.findByIdAndDelete(departmentId);
    if (!department) return res.status(404).json({ success: false, message: "Không tìm thấy" });
    
    // Log activity
    if (req.user) {
      await logActivity(req.user._id, 'DELETE_DEPARTMENT', 'Department', departmentId, req);
    }
    
    console.log('Department deleted successfully');
    res.json({ success: true, message: "Đã xóa thành công" });
  } catch (err) {
    console.error('Error deleting department:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};