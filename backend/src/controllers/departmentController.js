import Department from "../models/Department.js";

// CREATE
export const createDepartment = async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json(department);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ ALL
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(department);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!department) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(department);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ message: "Không tìm thấy" });
    res.json({ message: "Đã xóa thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};